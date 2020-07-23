import * as ts from 'typescript'

type VuexPair = [string | null, ts.NodeArray<ts.Expression>]

export function getVuexArguments(args: ts.NodeArray<ts.Expression>): VuexPair {
  const [namespaceOrList, listOrNull] = args

  let namespace: string | null = null
  let list: ts.NodeArray<ts.Expression> = ts.createNodeArray()

  if (ts.isStringLiteral(namespaceOrList)) {
    // namespaced mapping
    const ns: ts.StringLiteral = namespaceOrList
    if (!ts.isArrayLiteralExpression(listOrNull)) {
      throw new Error('Unexpected node')
    }
    const l: ts.ArrayLiteralExpression = listOrNull
    namespace = `${ns.text}`
    list = l.elements
  } else {
    // root mapping
    if (!ts.isArrayLiteralExpression(namespaceOrList)) {
      throw new Error('Unexpected node')
    }
    const l: ts.ArrayLiteralExpression = namespaceOrList
    namespace = null
    list = l.elements
  }

  return [namespace, list]
}
