import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'

export async function doTask<T, E>(task: TE.TaskEither<E, T>) {
  const result = await task()

  if (E.isLeft(result)) {
    throw result.left
  }

  return result.right
}
