import * as ts from 'typescript'
import { getVuexArguments } from './utils/vuex-extraction'

const CATCH_KEYWORD = 'methods'
const UTIL_KEYWORD = 'mapMutations'

function isMethods(node: ts.Node): boolean {
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
    if (!isMethods(node)) {
      return node
    }
    const propAssignment: ts.PropertyAssignment = node
    if (!ts.isObjectLiteralExpression(propAssignment.initializer)) {
      return node
    }
    const initializer: ts.ObjectLiteralExpression = propAssignment.initializer

    initializer.properties = ts.createNodeArray<ts.ObjectLiteralElementLike>(
      initializer.properties.reduce((before, current) => {
        const fallback = ts.createNodeArray<ts.ObjectLiteralElementLike>([
          ...before,
          current,
        ])
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
        let list: ts.NodeArray<ts.Expression> = ts.createNodeArray()
        let prefix: string

        try {
          const r = getVuexArguments(mapMutations.arguments)
          prefix = r[0] ? `${r[0]}/` : ''
          list = r[1]
        } catch (e) {
          return fallback
        }

        return ts.createNodeArray<ts.ObjectLiteralElementLike>([
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
        ])
      }, ts.createNodeArray<ts.ObjectLiteralElementLike>())
    )

    return node
  }
  return ts.visitNode(rootNode, visit)
}
