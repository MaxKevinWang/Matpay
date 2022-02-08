import { optimize_graph } from '@/utils/utils'
import {
  graph1_optimized,
  graph1_unoptimized,
  graph2_optimized,
  graph2_unoptimized,
  graph3_optimized,
  graph3_unoptimized,
  graph4_optimized,
  graph4_unoptimized,
  graph5_optimized,
  graph5_unoptimized
} from '../mocks/mocked_graph'

describe('Test optimization algorithm', () => {
  it('Data 1: simple loop', () => {
    const result = optimize_graph(graph1_unoptimized)
    expect(result).toEqual(graph1_optimized)
  })
  it('Data 2: a more complex loop', () => {
    const result = optimize_graph(graph2_unoptimized)
    expect(result).toEqual(graph2_optimized)
  })
  it('Data 3: a more complex loop', () => {
    const result = optimize_graph(graph3_unoptimized)
    expect(result).toEqual(graph3_optimized)
  })
  it('Data 4: a more complex loop', () => {
    const result = optimize_graph(graph4_unoptimized)
    expect(result).toEqual(graph4_optimized)
  })
  it('Data 5: long transaction chain', () => {
    const result = optimize_graph(graph5_unoptimized)
    expect(result).toEqual(graph5_optimized)
  })
})
