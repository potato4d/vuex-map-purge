import * as ts from 'typescript'

export function __purgeTest(
  source: string,
  transformers: ts.TransformerFactory<ts.SourceFile>[]
): string {
  const sourceFile = ts.createSourceFile(
    'index.ts',
    source,
    ts.ScriptTarget.ESNext
  )
  const result = ts.transform(sourceFile, transformers)
  result.dispose()

  const printer = ts.createPrinter()
  const output = printer.printFile(result.transformed[0] as ts.SourceFile)
  return output
}
