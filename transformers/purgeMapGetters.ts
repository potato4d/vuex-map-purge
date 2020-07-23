import * as ts from 'typescript'
import { getVuexArguments } from './utils/vuex-extraction'

const CATCH_KEYWORD = 'computed'
const UTIL_KEYWORD = 'mapGetters'

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

export const purgeMapGetters = <T extends ts.Node>(
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
          const fallback = ts.createNodeArray([...before, current])
          // mapGetters always used with spread operator
          if (!ts.isSpreadAssignment(current)) {
            return fallback
          }

          if (!ts.isCallExpression(current.expression)) {
            return fallback
          }

          const maybeMapGetters: ts.CallExpression = current.expression
          if (!ts.isIdentifier(maybeMapGetters.expression)) {
            return fallback
          }

          const maybeMapGettersCallName: ts.Identifier =
            maybeMapGetters.expression
          if (maybeMapGettersCallName.escapedText !== UTIL_KEYWORD) {
            return fallback
          }

          const mapGetters = maybeMapGetters
          let list: ts.NodeArray<ts.Expression> = ts.createNodeArray()
          let prefix: string

          try {
            const r = getVuexArguments(mapGetters.arguments)
            prefix = r[0] ? `${r[0]}/` : ''
            list = r[1]
          } catch (e) {
            return fallback
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
                [],
                undefined,
                ts.createBlock([
                  ts.createReturn(
                    ts.createElementAccess(
                      ts.createPropertyAccess(
                        ts.createPropertyAccess(ts.createThis(), '$store'),
                        'getters'
                      ),
                      ts.createStringLiteral(`${prefix}${arg.text}`)
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
