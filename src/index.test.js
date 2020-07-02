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

import { inspect } from 'util'
import { join } from 'path'
import test from 'ava'
import getAllFiles from 'get-all-files'
import { transform } from '@swc/core'
import { findEntryPoints, findSingleEntryPoints } from './index'

const sortEntryPoints = entryPoints => {
  entryPoints.forEach(entryPoint => entryPoint.sort())
  entryPoints.sort((a, b) => a[0].localeCompare(b[0]))
  return entryPoints
}

const macro = async (t, fixtureName, { options, expected, expectedSingle }) => {
  const fixturePath = join(__dirname, `fixtures`, fixtureName)

  expected = sortEntryPoints(
    expected.map(group => group.map(name => join(fixturePath, name)))
  )
  const actualEntryPoints = sortEntryPoints(
    await findEntryPoints(getAllFiles.async(fixturePath), options)
  )
  t.deepEqual(actualEntryPoints, expected)

  expectedSingle = expectedSingle.map(name => join(fixturePath, name)).sort()
  const actualSingleEntryPoints = (
    await findSingleEntryPoints(getAllFiles.async(fixturePath), options)
  ).sort()
  t.deepEqual(actualSingleEntryPoints, expectedSingle)
}

// eslint-disable-next-line default-param-last
macro.title = (providedTitle = ``, fixtureName, { options }) =>
  `${providedTitle} fixture ${fixtureName}; options: ${inspect(options)}`.trim()

test(macro, `normal/1`, {
  expected: [[`b.js`]],
  expectedSingle: [`b.js`]
})

test(macro, `normal/1`, {
  options: { followDynamicImports: false },
  expected: [[`b.js`], [`c.js`]],
  expectedSingle: [`b.js`, `c.js`]
})

test(macro, `normal/1`, {
  options: {
    parseImports: ({ file }) => [file.path]
  },
  expected: [[`a.js`], [`b.js`], [`c.js`]],
  expectedSingle: []
})

test(macro, `normal/1`, {
  options: {
    transform: ({ code }) => code.trim(),
    parseImports: ({ path }) => [path]
  },
  expected: [[`a.js`], [`b.js`], [`c.js`]],
  expectedSingle: [`a.js`, `b.js`, `c.js`]
})

test(macro, `normal/2`, {
  expected: [[`d.js`]],
  expectedSingle: [`d.js`]
})

test(macro, `normal/3`, {
  expected: [[`a.js`, `b.js`, `c.js`]],
  expectedSingle: []
})

test(macro, `normal/4`, {
  expected: [[`a.js`], [`c.js`]],
  expectedSingle: [`a.js`, `c.js`]
})

test(macro, `normal`, {
  expected: [
    [`1/b.js`],
    [`2/d.js`],
    [`3/a.js`, `3/b.js`, `3/c.js`],
    [`4/a.js`],
    [`4/c.js`]
  ],
  expectedSingle: [`1/b.js`, `2/d.js`, `4/a.js`, `4/c.js`]
})

test(macro, `jsx`, {
  options: {
    transform: async ({ path, code }) =>
      (
        await transform(code, {
          filename: path,
          jsc: { parser: { jsx: true } }
        })
      ).code
  },
  expected: [[`a.js`]],
  expectedSingle: [`a.js`]
})
