import {Injectable} from '@nestjs/common'
import {fromNullable, just} from '@sweet-monads/maybe'
import {get, isUndefined} from 'lodash'
import {ListsRepo} from './lists.repository'

@Injectable()
export class ListsService {
  constructor(private readonly listRepo: ListsRepo) {}

  async create(uid: UID, title: string) {
    const result = await this.listRepo.findSimilarList(uid, title)

    return result.asyncMap(similar => {
      const nextTitle = !isUndefined(similar)
        ? this.getNextDuplicateTitle(title)
        : title

      return this.listRepo.create(uid, nextTitle)
    })
  }

  private getNextDuplicateTitle(title: string) {
    const duplicateRegex = / \((\d+)\)$/

    const {value} = fromNullable(title.match(duplicateRegex))
      .map(match => get(match, 1))
      .map(n => parseInt(n, 10))
      .or(just(0))
      .map(n => n + 1)
      .map(n => `${title} (${n})`)

    return value
  }
}
