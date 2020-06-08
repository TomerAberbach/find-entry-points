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
import test from 'ava'
import getAllFiles from 'get-all-files'
import { findEntryPoints } from './index'

const fixturePath = name => join(__dirname, `fixtures`, name)

const fixtureFilenames = name => getAllFiles.async(fixturePath(name))

const sortEntryPoints = entryPoints => {
  entryPoints.forEach(entryPoint => entryPoint.sort())
  entryPoints.sort((a, b) => a[0].localeCompare(b[0]))
  return entryPoints
}

const macro = async (t, fixtureName, expectedEntryPoints) => {
  const entryPoints = await findEntryPoints(fixtureFilenames(fixtureName))
  t.deepEqual(
    sortEntryPoints(entryPoints),
    sortEntryPoints(expectedEntryPoints)
  )
}

// eslint-disable-next-line default-param-last
macro.title = (providedTitle = ``, fixtureName) =>
  `${providedTitle} fixture ${fixtureName}`.trim()

test(macro, `1`, [[fixturePath(`1/b.js`)]])

test(macro, `2`, [[fixturePath(`2/d.js`)]])

test(macro, `3`, [
  [fixturePath(`3/a.js`), fixturePath(`3/b.js`), fixturePath(`3/c.js`)]
])

test(macro, `4`, [[fixturePath(`4/a.js`)], [fixturePath(`4/c.js`)]])

test(macro, ``, [
  [fixturePath(`1/b.js`)],
  [fixturePath(`2/d.js`)],
  [fixturePath(`3/a.js`), fixturePath(`3/b.js`), fixturePath(`3/c.js`)],
  [fixturePath(`4/a.js`)],
  [fixturePath(`4/c.js`)]
])
