import { v4 as uuidv4 } from 'uuid'
import { GroupedTransaction, PendingApproval, SimpleTransaction, TxGraph } from '@/models/transaction.model'
import { MatrixUserID, TxID } from '@/models/id.model'
import { cloneDeep } from 'lodash'

export function uuidgen (): string {
  return uuidv4()
}

export const sum_amount = (item: GroupedTransaction | PendingApproval | SimpleTransaction[]): number => {
  if (Array.isArray(item)) {
    return item.reduce((sum, tx) => sum + tx.amount, 0)
  } else {
    return item.txs.reduce((sum, tx) => sum + tx.amount, 0)
  }
}
export const split_percentage = (item: GroupedTransaction | PendingApproval | SimpleTransaction[]): Record<TxID, number> => {
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
export const to_currency_display = (num: number): string => {
  return (num / 100).toFixed(2) + '€'
}
export const selectorify = (user_id: MatrixUserID): string => {
  // transforms a user id to a valid selector
  return user_id.substring(1)
    .replaceAll(':', '_')
    .replaceAll('.', '_')
}

export function build_graph (grouped_txs: GroupedTransaction[]): TxGraph {
  const result: TxGraph = {
    graph: {}
  }
  for (const grouped_tx of grouped_txs) {
    for (const simple_tx of grouped_tx.txs) {
      // From side is a new vertex
      if (!result.graph[grouped_tx.from.user_id]) {
        result.graph[grouped_tx.from.user_id] = []
      }
      // To side is a new vertex
      if (!result.graph[simple_tx.to.user_id]) {
        result.graph[simple_tx.to.user_id] = []
      }
      const existing_edge = result.graph[grouped_tx.from.user_id].filter(i => i[0] === simple_tx.to.user_id)
      if (existing_edge.length > 0) {
        // Edge already exists; add the weight instead of creating a new edge.
        // This makes sure that the graph is not a multigraph.
        existing_edge[0][1] += simple_tx.amount
      } else {
        // Add new adjacency list edge: from -> to
        result.graph[grouped_tx.from.user_id].push([
          simple_tx.to.user_id,
          simple_tx.amount
        ])
      }
    }
  }
  return result
}

export function optimize_graph (graph: TxGraph): TxGraph {
  const op_graph = transform_path(transform_to_dag(graph))
  // sorting; test workaround
  for (const source of Object.keys(op_graph.graph)) {
    op_graph.graph[source].sort((a, b) => a[0].localeCompare(b[0]))
  }
  return op_graph
}

function transform_path (graph: TxGraph): TxGraph {
  if (Object.keys(graph.graph).length <= 2) {
    // only at most 2 vertexes; no transformation possible
    return graph
  }
  // topological sort
  const topological_ordering: Array<MatrixUserID> = []
  const temp_visited: Record<MatrixUserID, boolean> = {}
  const perm_visited: Record<MatrixUserID, boolean> = {}
  // initialize perm_visited
  for (const source of Object.keys(graph.graph)) {
    perm_visited[source] = false
  }

  // actual dfs
  function dfs_visit (node: MatrixUserID) {
    if (perm_visited[node]) {
      return
    }
    if (temp_visited[node]) {
      throw new Error('Error: input not a DAG!')
    }
    temp_visited[node] = true
    for (const target of graph.graph[node]) {
      dfs_visit(target[0])
    }
    temp_visited[node] = false
    perm_visited[node] = true
    topological_ordering.unshift(node)
  }

  // actual sort
  for (const source of Object.keys(graph.graph)) {
    if (!perm_visited[source]) {
      dfs_visit(source)
    }
  }
  console.log('Topological Ordering: ', topological_ordering)
  // reverse topological order
  for (let i = topological_ordering.length - 3; i >= 0; i--) {
    for (let j = i + 1; j < topological_ordering.length; j++) {
      const edges_i_to_j_index = graph.graph[topological_ordering[i]].findIndex(n => n[0] === topological_ordering[j])
      // i --> j exists
      if (edges_i_to_j_index !== -1) {
        const edge_1 = graph.graph[topological_ordering[i]][edges_i_to_j_index]
        for (let k = topological_ordering.length - 1; k > j; k--) {
          const edges_j_to_k_index = graph.graph[topological_ordering[j]].findIndex(n => n[0] === topological_ordering[k])
          // j --> k exists
          if (edges_j_to_k_index !== -1) {
            const edge_2 = graph.graph[topological_ordering[j]][edges_j_to_k_index]
            // Reduce
            const min_amount = Math.min(edge_1[1], edge_2[1])
            edge_1[1] -= min_amount
            edge_2[1] -= min_amount
            // Add edge
            const edges_i_to_k_index = graph.graph[topological_ordering[i]].findIndex(i => i[0] === topological_ordering[k])
            if (edges_i_to_k_index !== -1) {
              graph.graph[topological_ordering[i]][edges_i_to_k_index][1] += min_amount
            } else {
              graph.graph[topological_ordering[i]].push([topological_ordering[k], min_amount])
            }
            // remove if 0
            if (edge_1[1] === 0) {
              graph.graph[topological_ordering[i]].splice(
                edges_i_to_j_index, 1
              )
            }
            if (edge_2[1] === 0) {
              graph.graph[topological_ordering[j]].splice(
                edges_j_to_k_index, 1
              )
            }
          }
        }
      }
    }
  }
  return graph
}

function transform_to_dag (graph: TxGraph): TxGraph {
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
  const cycles: Array<Array<MatrixUserID>> = []
  for (const source of Object.keys(optim_graph.graph)) {
    dfs(optim_graph.graph, [source], {}, cycles)
  }
  console.log('After cycle removal: ', optim_graph)
  console.log('Cycles: ', cycles)
  for (const cycle of cycles) {
    const amounts: Array<number> = []
    for (let i = 0; i < cycle.length - 1; i++) {
      amounts.push(optim_graph.graph[cycle[i]].filter(u => u[0] === cycle[i + 1])[0][1])
    }
    const dec_amount = Math.min(...amounts)
    for (let i = 0; i < cycle.length - 1; i++) {
      optim_graph.graph[cycle[i]].filter(u => u[0] === cycle[i + 1])[0][1] -= dec_amount
    }
  }
  // remove all 0 nodes
  for (const source of Object.keys(optim_graph.graph)) {
    optim_graph.graph[source] = optim_graph.graph[source].filter(i => i[1] !== 0)
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
    }
  }
}
