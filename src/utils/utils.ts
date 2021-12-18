import { v4 as uuidv4 } from 'uuid'

export function deepcopy<T> (i: T): T {
  return JSON.parse(JSON.stringify(i))
}

/* eslint no-undef: "off" */
/* eslint @typescript-eslint/ban-ts-comment: "off" */
// @ts-ignore
export function uuidgen () : string {
  // UUID generation: API distinguish
  // @ts-ignore
  if (crypto.randomUUID !== undefined) {
    // @ts-ignore
    return crypto.randomUUID()
  } else {
    return uuidv4()
  }
}
