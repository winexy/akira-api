export const concat = <T>() => (a: Array<T>) => {
  return (b: Array<T>): Array<T> => [...a, ...b]
}
