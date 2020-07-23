import * as ts from 'typescript'
import cheerio from 'cheerio'
import _glob from 'glob'
import { promisify } from 'util'
import { promises as fs } from 'fs'
const glob = promisify(_glob)
import * as Core from './core'

async function run() {
  const files = await glob(`${process.argv[2]}`)
  await Promise.all([
    files.map(async (path) => {
      console.log(path)
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
    }),
  ])
}

run()
