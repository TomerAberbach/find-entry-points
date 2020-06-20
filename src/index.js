/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import assert from 'assert'
import createGraph from './create-graph'
import stronglyConnectedComponents from './strongly-connected-components'
import pMap from './p-map'

export const findEntryPoints = async (
  iterable,
  { followDynamicImports = true } = {}
) => {
  const graph = await createGraph(iterable, { followDynamicImports })
  const entryPointComponents = []

  for await (const stronglyConnectedComponent of stronglyConnectedComponents(
    graph
  )) {
    entryPointComponents.push(stronglyConnectedComponent)

    await pMap(stronglyConnectedComponent, async filename => {
      for (const imported of await graph.get(filename).imports) {
        if (stronglyConnectedComponent.has(imported)) {
          continue
        }

        const { componentIndex } = graph.get(imported)
        assert(componentIndex < entryPointComponents.length)

        entryPointComponents[componentIndex] = false
      }
    })
  }

  return entryPointComponents
    .filter(Boolean)
    .map(entryPointComponent => Array.from(entryPointComponent))
}

export const findSingleEntryPoints = async (
  iterable,
  { followDynamicImports = true } = {}
) => {
  const graph = await createGraph(iterable, { followDynamicImports })
  const entryPoints = new Set(graph.keys())
  const promises = []

  for (const { imports } of graph) {
    promises.push(
      (async () => {
        for (const filename of await imports) {
          entryPoints.delete(filename)
        }
      })()
    )
  }

  await Promise.all(promises)
  return [...entryPoints]
}
