import {Inject, Injectable} from '@nestjs/common'
import {ListModel, TaskList} from './list.model'
import {TasksRepo} from '../tasks/tasks.repository'

@Injectable()
export class ListsRepo {
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
    return this.listModel
      .query()
      .where('title', title)
      .findOne('author_uid', uid)
  }

  findDuplicates(uid: UID, title: string): Promise<TaskList[] | undefined> {
    return this.listModel
      .query()
      .where(
        'title',
        'LIKE',
        this.listModel
          .raw(`':title:' || ' (%)'`, {
            title
          })
          .toString()
      )
      .where('author_uid', uid)
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
