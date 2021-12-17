export function deepcopy<T> (i: T): T {
  return JSON.parse(JSON.stringify(i))
}
