import * as ts from 'typescript'
import { purgeMapGetters } from './transformers/purgeMapGetters'
import { purgeMapMutations } from './transformers/purgeMapMutations'
import { purgeMapActions } from './transformers/purgeMapActions'

export function purge(source: string): string {
  const sourceFile = ts.createSourceFile(
    'index.ts',
    source,
    ts.ScriptTarget.ESNext
  )
  const result = ts.transform(sourceFile, [
    purgeMapGetters,
    purgeMapMutations,
    purgeMapActions,
  ])
  result.dispose()

  const printer = ts.createPrinter()
  const output = printer.printFile(result.transformed[0] as ts.SourceFile)
  return output
}
