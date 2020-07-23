#!/usr/bin/env node
import meow from 'meow'
import cheerio from 'cheerio'
import _glob from 'glob'
import { promisify } from 'util'
import { promises as fs } from 'fs'
const glob = promisify(_glob)
import * as Core from './src/core'

const cli = meow(`
  Usage
    $ vuex-map-purge '<path>'
`)

async function run(input: meow.Result<meow.AnyFlags>['input']) {
  await Promise.all(
    input.map(async (f) => {
      const files = await glob(f)
      await Promise.all([
        files.map(async (path) => {
          const sfc = await fs.readFile(path, { encoding: 'utf8' })
          const $ = cheerio.load(sfc)
          const src = $('script')!.html()
          if (!src) {
            return
          }
          const output = Core.purge(src)
          const regexp = new RegExp('<script( lang="ts")?>((.*)\\n)*</script>')
          // TODO: ソース内に `<script></script>` の文字があると破滅するので対処する
          await fs.writeFile(
            path,
            sfc.replace(regexp, `<script$1>\n${output}</script>`),
            {
              encoding: 'utf8',
            }
          )
          console.log(path)
        }),
      ])
    })
  )
}

run(cli.input)
