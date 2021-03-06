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
import createGraph from './create-graph.js'
import stronglyConnectedComponents from './strongly-connected-components.js'
import pMap from './p-map.js'
import normalizeOptions from './normalize-options.js'

export const findEntryPoints = async (iterable, options) => {
  options = normalizeOptions(options)

  const graph = await createGraph(iterable, options)
  const entryPointComponents = []

  for await (const stronglyConnectedComponent of stronglyConnectedComponents(
    graph
  )) {
    entryPointComponents.push(stronglyConnectedComponent)

    await pMap(stronglyConnectedComponent, async filename => {
      for await (const imported of await graph.get(filename).imports) {
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

export const findSingleEntryPoints = async (iterable, options) => {
  options = normalizeOptions(options)

  const graph = await createGraph(iterable, options)
  const entryPoints = new Set(graph.keys())

  await pMap(graph.values(), async ({ imports }) => {
    for await (const filename of await imports) {
      entryPoints.delete(filename)
    }
  })

  return [...entryPoints]
}
