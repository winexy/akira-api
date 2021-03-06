import {Inject, Injectable, Logger} from '@nestjs/common'
import {ListModel, TaskList} from './list.model'
import {TasksRepo} from '../tasks/tasks.repository'
import * as TE from 'fp-ts/lib/TaskEither'
import {flow, pipe} from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import {UserError} from 'src/filters/user-error.exception.filter'
import {taskEitherQuery} from 'src/shared/task-either-query'

@Injectable()
export class ListsRepo {
  private readonly logger = new Logger(ListsRepo.name)

  constructor(
    @Inject(ListModel)
    private readonly listModel: typeof ListModel
  ) {}

  Create(uid: UID) {
    return (title: string): TE.TaskEither<UserError, TaskList> => {
      return taskEitherQuery(() => {
        return this.listModel
          .query()
          .insert({
            author_uid: uid,
            title
          })
          .returning('*')
      })
    }
  }

  FindExactTitle(
    uid: UID,
    title: string
  ): TE.TaskEither<UserError, O.Option<string>> {
    return pipe(
      taskEitherQuery(() => {
        return this.listModel
          .query()
          .where('title', title)
          .findOne('author_uid', uid)
      }),
      TE.map(
        flow(
          O.fromNullable,
          O.map(taskList => taskList.title)
        )
      )
    )
  }

  FindDuplicates(
    uid: UID,
    title: string
  ): TE.TaskEither<UserError, TaskList[]> {
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

    return taskEitherQuery(() => {
      return this.listModel
        .query()
        .where('author_uid', uid)
        .andWhere('title', 'LIKE', rawExpression)
    })
  }

  FindAll(uid: UID) {
    const countQuery = this.listModel
      .relatedQuery('tasks')
      .count()
      .as('tasksCount')

    return this.listModel
      .query()
      .select('*', countQuery)
      .where('author_uid', uid)
  }

  Remove(uid: UID, listId: TaskList['id']) {
    return this.listModel
      .query()
      .where({author_uid: uid})
      .deleteById(listId)
      .throwIfNotFound()
  }

  QueryWithTasks(uid: UID, listId: TaskList['id']) {
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
