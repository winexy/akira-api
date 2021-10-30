import {Logger, Injectable} from '@nestjs/common'
import {constant, flow, pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as O from 'fp-ts/lib/Option'
import * as A from 'fp-ts/lib/Array'
import * as N from 'fp-ts/lib/number'
import * as S from 'fp-ts/lib/string'
import {tap} from 'fp-ts-std/IO'
import {contramap} from 'fp-ts/lib/Ord'
import {ListsRepo} from './lists.repository'
import {TaskList} from './list.model'
@Injectable()
export class ListsService {
  private readonly logger = new Logger(ListsService.name)

  constructor(private readonly listRepo: ListsRepo) {}

  public static DUPLICATE_MARK_REGEX = / \((\d+)\)$/

  Create(uid: UID, title: string) {
    return pipe(
      () => this.logger.log(`creating list "${title}"`),
      TE.fromIO,
      TE.chain(() => this.listRepo.FindDuplicates(uid, title)),
      TE.chainFirstIOK(
        tap(duplicates => () => {
          if (A.isEmpty(duplicates)) {
            this.logger.log('no duplicates')
          } else {
            this.logger.log('found duplicates', {
              count: A.size(duplicates)
            })
          }
        })
      ),
      TE.chain(duplicates => {
        return A.isEmpty(duplicates)
          ? this.listRepo.FindExactTitle(uid, title)
          : TE.of(this.GetLastDuplicateTitle(duplicates))
      }),
      TE.chainFirstIOK(
        tap(duplicateTitle => () => {
          if (O.isSome(duplicateTitle)) {
            this.logger.log('found duplicate title', {
              duplicateTitle
            })
          }
        })
      ),
      TE.map(
        flow(O.map(this.GetNextDuplicateTitle), O.getOrElse(constant(title)))
      ),
      TE.chainFirstIOK(
        tap(title => () => {
          this.logger.log('final title', {
            title
          })
        })
      ),
      TE.chain(this.listRepo.Create(uid))
    )
  }

  FindAll(uid: UID) {
    return this.listRepo.FindAll(uid)
  }

  Remove(uid: UID, listId: TaskList['id']) {
    return this.listRepo.Remove(uid, listId)
  }

  private GetLastDuplicateTitle(duplicates: TaskList[]): O.Option<string> {
    const regex = ListsService.DUPLICATE_MARK_REGEX

    type DuplicateMeta = {
      number: number
      title: string
    }

    const byNumber = pipe(
      N.Ord,
      contramap(({number}: DuplicateMeta) => number)
    )

    return pipe(
      duplicates,
      A.map(duplicate => {
        const number = pipe(
          duplicate.title.match(regex),
          O.fromNullable,
          O.chain(A.lookup(1)),
          O.map(Number),
          O.getOrElse(() => Infinity)
        )

        return {
          number,
          title: duplicate.title
        }
      }),
      A.sortBy([byNumber]),
      A.last,
      O.map(duplicate => duplicate.title)
    )
  }

  private GetNextDuplicateTitle(title: string): string {
    const regex = ListsService.DUPLICATE_MARK_REGEX

    return pipe(
      title.match(regex),
      O.fromNullable,
      O.chain(A.lookup(1)),
      O.map(Number),
      O.map(n => S.replace(regex, ` (${n + 1})`)(title)),
      O.getOrElse(() => `${title} (1)`)
    )
  }

  FindAllTasks(uid: UID, listId: TaskList['id']) {
    return this.listRepo.QueryWithTasks(uid, listId)
  }
}
