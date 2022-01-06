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
