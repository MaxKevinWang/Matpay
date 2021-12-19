import { v4 as uuidv4 } from 'uuid'

export function deepcopy<T> (i: T): T {
  return JSON.parse(JSON.stringify(i))
}

export function uuidgen (): string {
  return uuidv4()
}
