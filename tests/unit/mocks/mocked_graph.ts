import { TxGraph } from '@/models/transaction.model'

export const graph1_unoptimized : TxGraph = {
  graph: {
    aaa: [['bbb', 30]],
    bbb: [['ccc', 20]],
    ccc: [['aaa', 20]]
  }
}

export const graph1_optimized : TxGraph = {
  graph: {
    aaa: [['bbb', 10]],
    bbb: [],
    ccc: []
  }
}

export const graph2_unoptimized : TxGraph = {
  graph: {
    a: [['b', 50], ['c', 50]],
    b: [['d', 100]],
    c: [['e', 100]],
    d: [['a', 25], ['f', 75]],
    e: [],
    f: []
  }
}

export const graph2_optimized : TxGraph = {
  graph: {
    a: [['b', 25], ['c', 50]],
    b: [['d', 75]],
    c: [['e', 100]],
    d: [['f', 75]],
    e: [],
    f: []
  }
}

export const graph3_unoptimized : TxGraph = {
  graph: {
    a: [['b', 10]],
    b: [['c', 20]],
    c: [['a', 20], ['d', 30]],
    d: [['b', 30]]
  }
}

export const graph3_optimized : TxGraph = {
  graph: {
    a: [],
    b: [],
    c: [['a', 10], ['b', 20]],
    d: []
  }
}

export const graph4_unoptimized : TxGraph = {
  graph: {
    a: [['c', 10], ['e', 20]],
    b: [['a', 5]],
    c: [['d', 30]],
    d: [['c', 5], ['e', 20]],
    e: [['c', 30], ['b', 10]]
  }
}

export const graph4_optimized : TxGraph = {
  graph: {
    a: [['c', 10], ['e', 15]],
    b: [],
    c: [['d', 5]],
    d: [['c', 5], ['e', 20]],
    e: [['c', 10], ['b', 5]]
  }
}
