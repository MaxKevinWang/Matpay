import { v4 as uuidv4 } from 'uuid'
import { GroupedTransaction, PendingApproval, SimpleTransaction, TxGraph } from '@/models/transaction.model'
import { MatrixUserID, TxID } from '@/models/id.model'
import { cloneDeep } from 'lodash'

export function uuidgen (): string {
  return uuidv4()
}

export const sum_amount = (item: GroupedTransaction | PendingApproval | SimpleTransaction[]) : number => {
  if (Array.isArray(item)) {
    return item.reduce((sum, tx) => sum + tx.amount, 0)
  } else {
    return item.txs.reduce((sum, tx) => sum + tx.amount, 0)
  }
}
export const split_percentage = (item: GroupedTransaction | PendingApproval | SimpleTransaction[]) : Record<TxID, number> => {
  const result: Record<TxID, number> = {}
  if (Array.isArray(item)) {
    const sum = item.reduce((sum, tx) => sum + tx.amount, 0)
    for (const simple_tx of item) {
      result[simple_tx.tx_id] = simple_tx.amount / sum
    }
  } else {
    const sum = item.txs.reduce((sum, tx) => sum + tx.amount, 0)
    for (const simple_tx of item.txs) {
      result[simple_tx.tx_id] = simple_tx.amount / sum
    }
  }
  return result
}
export const to_currency_display = (num: number) : string => {
  return (num / 100).toFixed(2) + '€'
}
export const selectorify = (user_id: MatrixUserID) : string => {
  // transforms a user id to a valid selector
  return user_id.substring(1)
    .replaceAll(':', '_')
    .replaceAll('.', '_')
}
export function optimize_graph (graph: TxGraph) : TxGraph {
  const optim_graph = cloneDeep(graph)
  console.log('Start optim: ', optim_graph)
  // remove self cycles before starting
  for (const source of Object.keys(optim_graph.graph)) {
    for (const [index, target] of optim_graph.graph[source].entries()) {
      if (source === target[0]) {
        optim_graph.graph[source].splice(index, 1)
      }
    }
  }
  console.log('After removing self cycle:', optim_graph)
  const cycles : Array<Array<MatrixUserID>> = []
  for (const source of Object.keys(optim_graph.graph)) {
    dfs(optim_graph.graph, [source], {}, cycles)
  }
  console.log('After cycle removal: ', optim_graph)
  console.log('Cycles: ', cycles)
  for (const cycle of cycles) {
    const amounts : Array<number> = []
    for (let i = 0; i < cycle.length - 1; i++) {
      amounts.push(optim_graph.graph[cycle[i]].filter(u => u[0] === cycle[i + 1])[0][1])
    }
    const dec_amount = Math.min(...amounts)
    for (let i = 0; i < cycle.length - 1; i++) {
      optim_graph.graph[cycle[i]].filter(u => u[0] === cycle[i + 1])[0][1] -= dec_amount
    }
  }
  // remove all 0 nodes
  for (const source of Object.keys(graph.graph)) {
    for (let i = 0; i < optim_graph.graph[source].length; i++) {
      if (optim_graph.graph[source][i][1] === 0) {
        optim_graph.graph[source].splice(i, 1)
      }
    }
  }
  return optim_graph
}

function dfs (graph: Record<MatrixUserID, Array<[MatrixUserID, number]>>,
  current: Array<MatrixUserID>, // the last element is the current one
  visited: Record<MatrixUserID, boolean>,
  cycles: Array<Array<MatrixUserID>>) {
  for (const target_vertex of graph[current.slice(-1)[0]]) {
    if (target_vertex[0] === current[0]) {
      // cycle detected
      cycles.push(cloneDeep(current).concat(target_vertex[0]))
    }
    if (!visited[target_vertex[0]]) {
      visited[target_vertex[0]] = true
      dfs(graph, current.concat(target_vertex[0]), visited, cycles)
      visited[target_vertex[0]] = false
      // current.pop()
    }
  }
}
