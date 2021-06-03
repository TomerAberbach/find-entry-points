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

import { promises as fs } from 'fs'
import pMap from './p-map.js'

const parseImportsNormalized = async ({
  filename,
  filenames,
  followDynamicImports,
  transform,
  parseImports
}) => {
  const file = {
    path: filename,
    read: async () =>
      transform({
        path: filename,
        code: await fs.readFile(filename, `utf8`)
      })
  }

  const imports = new Set()

  for await (const $import of await parseImports({
    followDynamicImports,
    file
  })) {
    if (filenames.has($import)) {
      imports.add($import)
    }
  }

  return imports
}

const createGraph = async (iterable, options) => {
  const filenames = new Set(
    await pMap(iterable, filename => fs.realpath(filename))
  )
  const graph = new Map()

  for (const filename of filenames) {
    graph.set(filename, {
      imports: parseImportsNormalized({ filename, filenames, ...options })
    })
  }

  return graph
}

export default createGraph
