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
import { transform } from '@swc/core'
import { findEntryPoints } from './index'

const fixturePath = name => join(__dirname, `fixtures`, name)

const fixtureFilenames = name => getAllFiles.async(fixturePath(name))

const sortEntryPoints = entryPoints => {
  entryPoints.forEach(entryPoint => entryPoint.sort())
  entryPoints.sort((a, b) => a[0].localeCompare(b[0]))
  return entryPoints
}

const macro = async (t, fixtureName, expectedEntryPoints, options = {}) => {
  const entryPoints = await findEntryPoints(
    fixtureFilenames(fixtureName),
    options
  )
  t.deepEqual(
    sortEntryPoints(entryPoints),
    sortEntryPoints(expectedEntryPoints)
  )
}

// eslint-disable-next-line default-param-last
macro.title = (providedTitle = ``, fixtureName) =>
  `${providedTitle} fixture ${fixtureName}`.trim()

test(macro, `normal/1`, [[fixturePath(`normal/1/b.js`)]])

test(macro, `normal/2`, [[fixturePath(`normal/2/d.js`)]])

test(macro, `normal/3`, [
  [
    fixturePath(`normal/3/a.js`),
    fixturePath(`normal/3/b.js`),
    fixturePath(`normal/3/c.js`)
  ]
])

test(macro, `normal/4`, [
  [fixturePath(`normal/4/a.js`)],
  [fixturePath(`normal/4/c.js`)]
])

test(macro, `normal`, [
  [fixturePath(`normal/1/b.js`)],
  [fixturePath(`normal/2/d.js`)],
  [
    fixturePath(`normal/3/a.js`),
    fixturePath(`normal/3/b.js`),
    fixturePath(`normal/3/c.js`)
  ],
  [fixturePath(`normal/4/a.js`)],
  [fixturePath(`normal/4/c.js`)]
])

test(macro, `jsx`, [[fixturePath(`jsx/a.js`)]], {
  transform: async ({ path, code }) =>
    (
      await transform(code, {
        filename: path,
        jsc: { parser: { jsx: true } }
      })
    ).code
})
