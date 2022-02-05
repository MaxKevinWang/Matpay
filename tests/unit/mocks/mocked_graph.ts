import { TxGraph } from '@/models/transaction.model'

export const graph1_unoptimized: TxGraph = {
  graph: {
    aaa: [['bbb', 30]],
    bbb: [['ccc', 20]],
    ccc: [['aaa', 20]]
  }
}

export const graph1_optimized: TxGraph = {
  graph: {
    aaa: [['bbb', 10]],
    bbb: [],
    ccc: []
  }
}

export const graph2_unoptimized: TxGraph = {
  graph: {
    a: [['b', 50], ['c', 50]],
    b: [['d', 100]],
    c: [['e', 100]],
    d: [['a', 25], ['f', 75]],
    e: [],
    f: []
  }
}

export const graph2_optimized: TxGraph = {
  graph: {
    a: [['e', 50], ['f', 25]],
    b: [['f', 50]],
    c: [['e', 50]],
    d: [],
    e: [],
    f: []
  }
}

export const graph3_unoptimized: TxGraph = {
  graph: {
    a: [['b', 10]],
    b: [['c', 20]],
    c: [['a', 20], ['d', 30]],
    d: [['b', 30]]
  }
}

export const graph3_optimized: TxGraph = {
  graph: {
    a: [],
    b: [],
    c: [['a', 10], ['b', 20]],
    d: []
  }
}

export const graph4_unoptimized: TxGraph = {
  graph: {
    a: [['c', 10], ['e', 20]],
    b: [['a', 5]],
    c: [['d', 30]],
    d: [['c', 5], ['e', 20]],
    e: [['b', 10], ['c', 30]]
  }
}

export const graph4_optimized: TxGraph = {
  graph: {
    a: [['d', 0]],
    b: [],
    c: [['d', 5]],
    d: [],
    e: []
  }
}

export const graph5_unoptimized: TxGraph = {
  // A typical case for path transformations
  graph: {
    a: [['b', 50]],
    b: [['c', 40]],
    c: [['d', 30]],
    d: [['e', 20]],
    e: [['f', 10]],
    f: []
  }
}
export const graph5_optimized: TxGraph = {
  graph: {
    a: [['b', 10], ['c', 10], ['d', 10], ['e', 10], ['f', 10]],
    b: [],
    c: [],
    d: [],
    e: [],
    f: []
  }
}
