import {Model} from 'objection'
import * as TE from 'fp-ts/lib/TaskEither'
import * as IO from 'fp-ts/lib/IO'

export async function startTransaction() {
  const trx = await Model.startTransaction()

  const foldTransaction = <E, A>(
    onLeft: (error: E) => IO.IO<void>,
    onRight: (value: A) => IO.IO<void>
  ) => {
    return TE.match<E, void, A>(
      async error => {
        await trx.rollback()
        onLeft(error)()
      },
      async value => {
        await trx.commit()
        onRight(value)()
      }
    )
  }

  return {trx, foldTransaction}
}
