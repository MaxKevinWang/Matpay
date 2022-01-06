import { v4 as uuidv4 } from 'uuid'
import { TxGraph } from '@/models/transaction.model'
import { MatrixUserID } from '@/models/id.model'
import { cloneDeep } from 'lodash'
export function deepcopy<T> (i: T): T {
  return JSON.parse(JSON.stringify(i))
}

export function uuidgen (): string {
  return uuidv4()
}

export function optimize_graph (graph: TxGraph) : TxGraph {
  const cycles : Array<Array<MatrixUserID>> = []
  for (const source of Object.keys(graph.graph)) {
    dfs(graph.graph, [source], {}, cycles)
  }
  console.log(cycles)
  const optim_graph = cloneDeep(graph)
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
      // loop detected
      cycles.push(deepcopy(current).concat(target_vertex[0]))
    }
    if (!visited[target_vertex[0]]) {
      visited[target_vertex[0]] = true
      dfs(graph, current.concat(target_vertex[0]), visited, cycles)
      current.pop()
    }
  }
}
