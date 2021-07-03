import {Inject, Injectable} from '@nestjs/common'
import {ListModel, TaskList} from './list.model'

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
      .orderBy('title', 'DESC')
      .findOne('author_uid', uid)
  }

  findDuplicate(uid: UID, title: string): Promise<TaskList | undefined> {
    return this.listModel
      .query()
      .where('title', 'LIKE', this.listModel.raw(`'${title}' || ' (%)'`))
      .orderBy('title', 'DESC')
      .findOne('author_uid', uid)
  }
}
