import {Injectable} from '@nestjs/common'
import {fromNullable} from '@sweet-monads/maybe'
import {isEmpty, last, sortBy, isUndefined} from 'lodash'
import {get} from 'lodash/fp'
import {ListsRepo} from './lists.repository'
import {from, of} from 'rxjs'
import {map, mergeMap} from 'rxjs/operators'
import {TaskList} from './list.model'
import {assert} from 'console'
@Injectable()
export class ListsService {
  constructor(private readonly listRepo: ListsRepo) {}

  public static DUPLICATE_MARK_REGEX = / \((\d+)\)$/

  create(uid: UID, title: string) {
    return from(this.listRepo.findDuplicates(uid, title)).pipe(
      mergeMap(duplicates => {
        return isUndefined(duplicates) || isEmpty(duplicates)
          ? from(this.listRepo.findExactTitle(uid, title).then(get('title')))
          : of(this.getLastDuplicateTitle(duplicates))
      }),
      map(duplicateTitle => {
        const nextTitle = fromNullable(duplicateTitle).map(
          this.getNextDuplicateTitle
        )

        return nextTitle.isJust() ? nextTitle.value : title
      }),
      mergeMap(title => this.listRepo.create(uid, title))
    )
  }

  findAll(uid: UID) {
    return this.listRepo.findAll(uid)
  }

  remove(uid: UID, listId: TaskList['id']) {
    return this.listRepo.remove(uid, listId)
  }

  private getLastDuplicateTitle(duplicates: TaskList[]): string {
    assert(!isEmpty(duplicates), 'duplicates should not be empty')

    const regex = ListsService.DUPLICATE_MARK_REGEX

    const transformed = duplicates.map(duplicate => ({
      number: Number(get(1, duplicate.title.match(regex))),
      title: duplicate.title
    }))

    const lastDuplicate = last(sortBy(transformed, 'number'))

    return lastDuplicate?.title as string
  }

  private getNextDuplicateTitle(title: string): string {
    const regex = ListsService.DUPLICATE_MARK_REGEX

    const {value} = fromNullable(title.match(regex))
      .map(get(1))
      .map(Number)
      .map(n => title.replace(regex, ` (${n + 1})`))

    return value ?? `${title} (1)`
  }

  findAllTasks(uid: UID, listId: TaskList['id']) {
    return this.listRepo.queryWithTasks(uid, listId)
  }
}
