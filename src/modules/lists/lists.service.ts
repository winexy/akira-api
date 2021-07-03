import {Injectable} from '@nestjs/common'
import {fromNullable, just} from '@sweet-monads/maybe'
import {get, isUndefined} from 'lodash/fp'
import {ListsRepo} from './lists.repository'
import {from, of} from 'rxjs'
import {map, mergeMap} from 'rxjs/operators'

@Injectable()
export class ListsService {
  constructor(private readonly listRepo: ListsRepo) {}

  create(uid: UID, title: string) {
    return from(this.listRepo.findDuplicate(uid, title)).pipe(
      mergeMap(duplicate => {
        return isUndefined(duplicate)
          ? from(this.listRepo.findExactTitle(uid, title))
          : of(duplicate)
      }),
      map(duplicate => {
        return fromNullable(duplicate)
          .map(get('title'))
          .map(this.getNextDuplicateTitle)
          .or(just(title)).value
      }),
      mergeMap(title => this.listRepo.create(uid, title))
    )
  }

  private getNextDuplicateTitle(title: string): string {
    const duplicateRegex = / \((\d+)\)$/

    const {value} = fromNullable(title.match(duplicateRegex))
      .map(get(1))
      .map(parseInt)
      .map(n => title.replace(duplicateRegex, ` (${n + 1})`))
      .or(just(`${title} (1)`))

    return value
  }
}
