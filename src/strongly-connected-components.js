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

/*
 * Implements Tarjan's strongly connected components algorithm:
 * https://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm
 */
async function* stronglyConnectedComponents(graph) {
  /*
   * A filename will be on the stack after it has been visited if and only if
   * it (potentially transitively) imports some filename earlier on the stack
   */
  const stack = []

  let lowestUnusedVertexIndex = 0
  let lowestUnusedComponentIndex = 0

  async function* walk(filename) {
    stack.push(filename)

    const state = graph.get(filename)
    Object.assign(state, {
      index: lowestUnusedVertexIndex,
      lowestReachableIndex: lowestUnusedVertexIndex,
      onStack: true
    })
    lowestUnusedVertexIndex++

    for await (const imported of await state.imports) {
      const importedState = graph.get(imported)

      if (importedState.index == null) {
        // Imported file has not been visited yet
        yield* walk(imported)
        state.lowestReachableIndex = Math.min(
          state.lowestReachableIndex,
          importedState.lowestReachableIndex
        )
      } else if (importedState.onStack) {
        // Imported file is in the current strongly connected component
        state.lowestReachableIndex = Math.min(
          state.lowestReachableIndex,
          importedState.index
        )
      }
    }

    // `filename` is the not a "root" node of a strongly connected component
    if (state.index !== state.lowestReachableIndex) {
      return
    }

    const stronglyConnectedComponent = new Set()
    const componentIndex = lowestUnusedComponentIndex++

    let componentFilename

    do {
      componentFilename = stack.pop()
      stronglyConnectedComponent.add(componentFilename)

      Object.assign(graph.get(componentFilename), {
        onStack: false,
        componentIndex
      })
    } while (componentFilename !== filename)

    yield stronglyConnectedComponent
  }

  for (const filename of graph.keys()) {
    if (graph.get(filename).index == null) {
      yield* walk(filename)
    }
  }
}

export default stronglyConnectedComponents
