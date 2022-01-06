import { v4 as uuidv4 } from 'uuid'
import { TxGraph } from '@/models/transaction.model'
import { MatrixUserID } from '@/models/id.model'

export function deepcopy<T> (i: T): T {
  return JSON.parse(JSON.stringify(i))
}

export function uuidgen (): string {
  return uuidv4()
}

export function optimize_graph (graph: TxGraph) : TxGraph {
  throw new Error('not implemented')
}
