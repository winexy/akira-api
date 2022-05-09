import {curry2} from 'fp-ts-std/Function'

export const concat = <T>() =>
  curry2((a: Array<T>, b: Array<T>): Array<T> => [...a, ...b])
