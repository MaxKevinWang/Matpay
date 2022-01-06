import { TxGraph } from '@/models/transaction.model'
import { optimize_graph } from '@/utils/utils'

describe('Test optimization algorithm', () => {
  it('Data 1: simple loop', () => {
    const data : TxGraph = {
      graph: {
        aaa: [['bbb', 30]],
        bbb: [['ccc', 20]],
        ccc: [['aaa', 20]]
      }
    }
    const result = optimize_graph(data)
    expect(result).toEqual({
      graph: {
        aaa: [['bbb', 10]]
      }
    })
  })
  it('Data 2: a more complex loop', () => {
    const data : TxGraph = {
      graph: {
        a: [['b', 50], ['c', 50]],
        b: [['d', 100]],
        c: [['e', 100]],
        d: [['a', 25], ['f', 75]],
        e: [],
        f: []
      }
    }
    const result = optimize_graph(data)
    expect(result).toEqual({
      graph: {
        a: [['b', 25], ['c', 50]],
        b: [['d', 75]],
        c: [['e', 100]],
        d: [['f', 75]],
        e: [],
        f: []
      }
    })
  })
})
