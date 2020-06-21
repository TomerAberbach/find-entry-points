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

/// <reference types="node"/>

/**
 * The options type for {@link findEntryPoints} and {@link findSingleEntryPoints}.
 */
export interface Options {
  /**
   * Determines if dynamic imports (with constant module specifiers) are followed
   * when constructing dependency graphs in {@link findEntryPoints} and {@link findSingleEntryPoints}.
   */
  readonly followDynamicImports?: boolean
}

export const findEntryPoints: {
  /**
   * Finds the logical entry point JavaScript filename groups in `iterable`.
   * @param iterable Sync or async iterable of JavaScript filenames.
   * @param options Options that determine the imports used to construct a dependency graph from `iterable`.
   * @returns The groups of JavaScript filenames in `iterable`, such that each file in each group directly or
   *   transitively imports every other file in its group and is not imported by any file in `iterable`
   *   outside its group. In other words, the strongly connected components with in-degree 0 of the dependency
   *   graph formed by the filenames in `iterable`.
   */
  (
    iterable: AsyncIterable<string> | Iterable<string>,
    options?: Options
  ): Promise<string[][]>
}

export const findSingleEntryPoints: {
  /**
   * Finds the logical entry point JavaScript filenames in `iterable`.
   * @param iterable Sync or async iterable of JavaScript filenames.
   * @param options Options that determine the imports used to construct a dependency graph from `iterable`.
   * @returns The JavaScript filenames in `iterable` that are not imported by any file in `iterable`. In other
   *   words, the vertices with in-degree 0 of the dependency graph formed by the filenames in `iterable`.
   */
  (
    iterable: AsyncIterable<string> | Iterable<string>,
    options?: Options
  ): Promise<string[]>
}
