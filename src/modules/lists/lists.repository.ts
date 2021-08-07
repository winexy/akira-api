import {Inject, Injectable, Logger} from '@nestjs/common'
import {ListModel, TaskList} from './list.model'
import {TasksRepo} from '../tasks/tasks.repository'

@Injectable()
export class ListsRepo {
  private readonly logger = new Logger(ListsRepo.name)

  constructor(
    @Inject(ListModel)
    private readonly listModel: typeof ListModel
  ) {}

  create(uid: UID, title: string): Promise<TaskList> {
    return this.listModel
      .query()
      .insert({
        author_uid: uid,
        title
      })
      .returning('*')
  }

  findExactTitle(uid: UID, title: string): Promise<TaskList | undefined> {
    this.logger.log('[findExactTitle]', {
      uid,
      title
    })

    return this.listModel
      .query()
      .where('title', title)
      .findOne('author_uid', uid)
  }

  findDuplicates(uid: UID, title: string): Promise<TaskList[] | undefined> {
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
    const query = this.listModel
      .query()
      .where('author_uid', uid)
      .andWhere('title', 'LIKE', rawExpression)

    return query
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
