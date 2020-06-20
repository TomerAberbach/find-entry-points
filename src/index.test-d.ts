import { join } from 'path'
import { expectType } from 'tsd'
import { findEntryPoints, findSingleEntryPoints } from './index'
;(async () => {
  const filenames = [`a.js`, `b.js`, `c.js`].map(name =>
    join(__dirname, `fixtures/1`, name)
  )

  async function* asyncFilenames() {
    for await (const filename of filenames) {
      yield filename
    }
  }

  expectType<string[][]>(await findEntryPoints(filenames))
  expectType<string[][]>(await findEntryPoints(filenames[Symbol.iterator]()))
  expectType<string[][]>(await findEntryPoints(asyncFilenames()))

  expectType<string[][]>(
    await findEntryPoints(filenames, { followDynamicImports: true })
  )
  expectType<string[][]>(
    await findEntryPoints(filenames[Symbol.iterator](), {
      followDynamicImports: true
    })
  )
  expectType<string[][]>(
    await findEntryPoints(asyncFilenames(), { followDynamicImports: true })
  )

  expectType<string[]>(await findSingleEntryPoints(filenames))
  expectType<string[]>(
    await findSingleEntryPoints(filenames[Symbol.iterator]())
  )
  expectType<string[]>(await findSingleEntryPoints(asyncFilenames()))

  expectType<string[]>(
    await findSingleEntryPoints(filenames, { followDynamicImports: true })
  )
  expectType<string[]>(
    await findSingleEntryPoints(filenames[Symbol.iterator](), {
      followDynamicImports: true
    })
  )
  expectType<string[]>(
    await findSingleEntryPoints(asyncFilenames(), {
      followDynamicImports: true
    })
  )
})()
