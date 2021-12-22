import { v4 as uuidv4 } from 'uuid'

export function deepcopy<T> (i: T): T {
  return JSON.parse(JSON.stringify(i))
}

export function uuidgen (): string {
  return uuidv4()
}

const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function txnid (length: number): string {
  const array: string[] = []
  while (length--) {
    const char = CHARS[(Math.random() * CHARS.length) | 0]
    array.push(char)
  }
  return array.join('')
}
