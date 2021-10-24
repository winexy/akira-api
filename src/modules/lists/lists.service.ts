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

  create(uid: UID, title: string) {
    return pipe(
      () => this.logger.log(`creating list "${title}"`),
      TE.fromIO,
      TE.chain(() => this.listRepo.findDuplicates(uid, title)),
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
          ? this.listRepo.findExactTitle(uid, title)
          : TE.of(this.getLastDuplicateTitle(duplicates))
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
        flow(O.map(this.getNextDuplicateTitle), O.getOrElse(constant(title)))
      ),
      TE.chainFirstIOK(
        tap(title => () => {
          this.logger.log('final title', {
            title
          })
        })
      ),
      TE.chain(this.listRepo.create(uid))
    )
  }

  findAll(uid: UID) {
    return this.listRepo.findAll(uid)
  }

  remove(uid: UID, listId: TaskList['id']) {
    return this.listRepo.remove(uid, listId)
  }

  private getLastDuplicateTitle(duplicates: TaskList[]): O.Option<string> {
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

  private getNextDuplicateTitle(title: string): string {
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

  findAllTasks(uid: UID, listId: TaskList['id']) {
    return this.listRepo.queryWithTasks(uid, listId)
  }
}
