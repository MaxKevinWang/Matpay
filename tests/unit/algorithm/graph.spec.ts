import { TxGraph } from '@/models/transaction.model'
import { optimize_graph } from '@/utils/utils'
import { graph1_optimized, graph1_unoptimized, graph2_optimized, graph2_unoptimized } from '../mocks/mocked_graph'

describe('Test optimization algorithm', () => {
  it('Data 1: simple loop', () => {
    const result = optimize_graph(graph1_unoptimized)
    expect(result).toEqual(graph1_optimized)
  })
  it('Data 2: a more complex loop', () => {
    const result = optimize_graph(graph2_unoptimized)
    expect(result).toEqual(graph2_optimized)
  })
})
