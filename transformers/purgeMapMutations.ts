import * as ts from 'typescript'

const CATCH_KEYWORD = 'methods'
const UTIL_KEYWORD = 'mapMutations'

function isMethod(node: ts.Node): boolean {
  if (!ts.isPropertyAssignment(node)) {
    return false
  }
  const propAssignment: ts.PropertyAssignment = node

  if (!ts.isIdentifier(propAssignment.name)) {
    return false
  }
  const propAssignmentName: ts.Identifier = propAssignment.name

  if (propAssignmentName.escapedText !== CATCH_KEYWORD) {
    return false
  }
  return true
}

export const purgeMapMutations = <T extends ts.Node>(
  context: ts.TransformationContext
) => (rootNode: T) => {
  function visit(node: ts.Node): ts.Node {
    node = ts.visitEachChild(node, visit, context)

    if (!ts.isPropertyAssignment(node)) {
      return node
    }
    if (!isMethod(node)) {
      return node
    }
    const propAssignment: ts.PropertyAssignment = node
    if (!ts.isObjectLiteralExpression(propAssignment.initializer)) {
      return node
    }
    const initializer: ts.ObjectLiteralExpression = propAssignment.initializer

    initializer.properties = ts.createNodeArray<ts.ObjectLiteralElementLike>(
      initializer.properties.reduce(
        (
          before: ts.NodeArray<ts.ObjectLiteralElementLike>,
          current: ts.ObjectLiteralElementLike
        ): any => {
          const fallback = [...before, current]
          // mapMutations always used with spread operator
          if (!ts.isSpreadAssignment(current)) {
            return fallback
          }

          if (!ts.isCallExpression(current.expression)) {
            return fallback
          }

          const maybeMapMutations: ts.CallExpression = current.expression
          if (!ts.isIdentifier(maybeMapMutations.expression)) {
            return fallback
          }

          const maybeMapMutationsCallName: ts.Identifier =
            maybeMapMutations.expression
          if (maybeMapMutationsCallName.escapedText !== UTIL_KEYWORD) {
            return fallback
          }

          const mapMutations = maybeMapMutations
          const [namespaceOrList, listOrNull] = mapMutations.arguments

          let prefix: string
          let list: ts.NodeArray<ts.Expression> = ts.createNodeArray()

          if (ts.isStringLiteral(namespaceOrList)) {
            // namespaced mapping
            const ns: ts.StringLiteral = namespaceOrList
            if (!ts.isArrayLiteralExpression(listOrNull)) {
              return fallback
            }
            const l: ts.ArrayLiteralExpression = listOrNull
            prefix = `${ns.text}/`
            list = l.elements
          } else {
            // root mapping
            if (!ts.isArrayLiteralExpression(namespaceOrList)) {
              return fallback
            }
            const l: ts.ArrayLiteralExpression = namespaceOrList
            prefix = ''
            list = l.elements
          }

          return [
            ...before,
            ...list.map((arg: any) => {
              return ts.createMethod(
                undefined,
                undefined,
                undefined,
                ts.createIdentifier(arg.text),
                undefined,
                undefined,
                [ts.createParameter([], [], undefined, 'payload')],
                undefined,
                ts.createBlock([
                  ts.createReturn(
                    ts.createCall(
                      ts.createPropertyAccess(
                        ts.createPropertyAccess(ts.createThis(), '$store'),
                        'commit'
                      ),
                      undefined,
                      [
                        ts.createStringLiteral(`${prefix}${arg.text}`),
                        ts.createIdentifier('payload'),
                      ]
                    )
                  ),
                ])
              )
            }),
          ]
        },
        ts.createNodeArray()
      )
    )

    return node
  }
  return ts.visitNode(rootNode, visit)
}
