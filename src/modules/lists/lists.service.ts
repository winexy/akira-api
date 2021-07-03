import {Injectable} from '@nestjs/common'
import {fromNullable, just} from '@sweet-monads/maybe'
import {isEmpty, last, sortBy} from 'lodash'
import {get} from 'lodash/fp'
import {ListsRepo} from './lists.repository'
import {from, of} from 'rxjs'
import {map, mergeMap} from 'rxjs/operators'
import {TaskList} from './list.model'
@Injectable()
export class ListsService {
  constructor(private readonly listRepo: ListsRepo) {}

  public static DUPLICATE_MARK_REGEX = / \((\d+)\)$/

  create(uid: UID, title: string) {
    return from(this.listRepo.findDuplicates(uid, title)).pipe(
      mergeMap(duplicates => {
        return isEmpty(duplicates)
          ? from(this.listRepo.findExactTitle(uid, title).then(get('title')))
          : of(this.getLastDuplicateTitle(duplicates))
      }),
      map(duplicateTitle => {
        return fromNullable(duplicateTitle)
          .map(this.getNextDuplicateTitle)
          .or(just(title)).value
      }),
      mergeMap(title => this.listRepo.create(uid, title))
    )
  }

  private getLastDuplicateTitle(duplicates: TaskList[]): string {
    const regex = ListsService.DUPLICATE_MARK_REGEX

    const transformed = duplicates.map(duplicate => ({
      number: Number(get(1, duplicate.title.match(regex))),
      title: duplicate.title
    }))

    return last(sortBy(transformed, 'number')).title
  }

  private getNextDuplicateTitle(title: string): string {
    const regex = ListsService.DUPLICATE_MARK_REGEX

    const {value} = fromNullable(title.match(regex))
      .map(get(1))
      .map(Number)
      .map(n => title.replace(regex, ` (${n + 1})`))
      .or(just(`${title} (1)`))

    return value
  }
}
