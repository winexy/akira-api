import {Inject, Injectable, Logger} from '@nestjs/common'
import {ListModel, TaskList} from './list.model'
import {TasksRepo} from '../tasks/tasks.repository'
import * as TE from 'fp-ts/lib/TaskEither'
import {
  transformRejectReason,
  RejectedQueryError
} from '../../shared/transform-reject-reason'
import {flow, pipe} from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

@Injectable()
export class ListsRepo {
  private readonly logger = new Logger(ListsRepo.name)

  constructor(
    @Inject(ListModel)
    private readonly listModel: typeof ListModel
  ) {}

  create(uid: UID) {
    return (title: string): TE.TaskEither<RejectedQueryError, TaskList> => {
      return TE.tryCatch(() => {
        return this.listModel
          .query()
          .insert({
            author_uid: uid,
            title
          })
          .returning('*')
      }, transformRejectReason)
    }
  }

  findExactTitle(
    uid: UID,
    title: string
  ): TE.TaskEither<RejectedQueryError, O.Option<string>> {
    return pipe(
      TE.tryCatch(() => {
        return this.listModel
          .query()
          .where('title', title)
          .findOne('author_uid', uid)
      }, transformRejectReason),
      TE.map(
        flow(
          O.fromNullable,
          O.map(taskList => taskList.title)
        )
      )
    )
  }

  findDuplicates(
    uid: UID,
    title: string
  ): TE.TaskEither<RejectedQueryError, TaskList[]> {
    /**
     * 1) Concatenation
     * :title || ' (%)' <- || is concatenation
     * hello || ' (%)' => 'hello (%)'
     * 2) Value binding
     * :title
     * https://github.com/knex/knex/issues/3288
     * 3) :title not in quotes like ':title' due to PG error
     * https://github.com/knex/knex/issues/1207
     */
    const rawExpression = this.listModel.raw(`:title || ' (%)'`, {title})

    return TE.tryCatch(() => {
      return this.listModel
        .query()
        .where('author_uid', uid)
        .andWhere('title', 'LIKE', rawExpression)
    }, transformRejectReason)
  }

  findAll(uid: UID) {
    const countQuery = this.listModel
      .relatedQuery('tasks')
      .count()
      .as('tasksCount')

    return this.listModel
      .query()
      .select('*', countQuery)
      .where('author_uid', uid)
  }

  remove(uid: UID, listId: TaskList['id']) {
    return this.listModel
      .query()
      .where({author_uid: uid})
      .deleteById(listId)
      .throwIfNotFound()
  }

  queryWithTasks(uid: UID, listId: TaskList['id']) {
    return this.listModel
      .query()
      .where({author_uid: uid})
      .findById(listId)
      .withGraphFetched({
        tasks: TasksRepo.DEFAULT_FETCH_GRAPH
      })
      .throwIfNotFound()
  }
}
