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
import { findEntryPoints, findSingleEntryPoints } from '../src/index'
;(async () => {
  const filenames = [`a.js`, `b.js`, `c.js`].map(name =>
    join(__dirname, `fixtures/normal/1`, name)
  )

  async function* asyncFilenames() {
    for await (const filename of filenames) {
      yield filename
    }
  }

  expectType<Array<Array<string>>>(await findEntryPoints(filenames))
  expectType<Array<string>>(await findSingleEntryPoints(asyncFilenames()))

  expectType<Array<Array<string>>>(await findEntryPoints(asyncFilenames(), {}))
  expectType<Array<string>>(await findSingleEntryPoints(filenames, {}))

  expectType<Array<Array<string>>>(
    await findEntryPoints(filenames, {
      followDynamicImports: false
    })
  )
  expectType<Array<string>>(
    await findSingleEntryPoints(filenames, {
      followDynamicImports: false
    })
  )

  expectType<Array<Array<string>>>(
    await findEntryPoints(asyncFilenames(), {
      transform: ({ code }) => code.trim()
    })
  )
  expectType<Array<string>>(
    await findSingleEntryPoints(filenames, {
      transform: ({ code }) => code.trim()
    })
  )

  expectType<Array<Array<string>>>(
    await findEntryPoints(filenames, {
      parseImports: () => []
    })
  )
  expectType<Array<string>>(
    await findSingleEntryPoints(filenames, {
      parseImports: () => []
    })
  )

  expectType<Array<Array<string>>>(
    await findEntryPoints(filenames, {
      followDynamicImports: false,
      transform: ({ code }) => code,
      parseImports: () => []
    })
  )
  expectType<Array<string>>(
    await findSingleEntryPoints(filenames, {
      followDynamicImports: false,
      transform: ({ code }) => code,
      parseImports: () => []
    })
  )
})()
