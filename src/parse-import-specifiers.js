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

import parseImports from 'parse-imports'

const ignoredTypes = new Set([`builtin`, `invalid`])

async function* parseImportSpecifiers({ followDynamicImports, file }) {
  const code = await file.read()

  for (const { isDynamicImport, moduleSpecifier } of await parseImports(code, {
    resolveFrom: file.path
  })) {
    // Skip dynamic imports if not enabled
    if (isDynamicImport && !followDynamicImports) {
      continue
    }

    if (ignoredTypes.has(moduleSpecifier.type)) {
      continue
    }

    const { resolved } = moduleSpecifier

    if (resolved != null) {
      yield resolved
    }
  }
}

export default parseImportSpecifiers
