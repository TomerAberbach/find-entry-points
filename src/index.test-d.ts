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

import { join } from 'path'
import { expectType } from 'tsd'
import { findEntryPoints, findSingleEntryPoints, Options } from './index'

const testReturnType = async (
  filenames: Iterable<string> | AsyncIterable<string>,
  options?: Options
) => {
  expectType<string[][]>(await findEntryPoints(filenames, options))
  expectType<string[]>(await findSingleEntryPoints(filenames, options))
}

const test = async () => {
  const filenames = [`a.js`, `b.js`, `c.js`].map(name =>
    join(__dirname, `fixtures/normal/1`, name)
  )

  async function* asyncFilenames() {
    for await (const filename of filenames) {
      yield filename
    }
  }

  const iterables = [
    () => filenames,
    filenames[Symbol.iterator],
    asyncFilenames
  ]

  for (const iterable of iterables) {
    await testReturnType(iterable())
    await testReturnType(iterable(), {})
    await testReturnType(iterable(), {
      followDynamicImports: false
    })
    await testReturnType(iterable(), {
      transform: ({ code }) => code.trim()
    })
    await testReturnType(iterable(), {
      parseImports: () => []
    })
    await testReturnType(iterable(), {
      followDynamicImports: false,
      transform: ({ code }) => code,
      parseImports: () => []
    })
  }
}

test()
