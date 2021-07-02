import {Inject, Injectable} from '@nestjs/common'
import {left, right} from '@sweet-monads/either'
import {ListModel, TaskList} from './list.model'

@Injectable()
export class ListsRepo {
  constructor(
    @Inject(ListModel)
    private readonly listModel: typeof ListModel
  ) {}

  async create(uid: UID, title: string) {
    return this.listModel
      .query()
      .insert({
        author_uid: uid,
        title
      })
      .returning('*')
  }

  async findSimilarList(
    uid: UID,
    title: string
  ): EitherP<DBException, TaskList | undefined> {
    try {
      const result: TaskList = await this.listModel
        .query()
        .where('author_uid', uid)
        .findOne('title', title)
        .limit(1)
        .orderBy('title', 'DESC')

      return right(result)
    } catch (error) {
      return left(error)
    }
  }
}
