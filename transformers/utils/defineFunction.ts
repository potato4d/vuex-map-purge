import * as ts from 'typescript'

export function getReturnType(isTypeScript: boolean) {
  if (isTypeScript) {
    return ts.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
  } else {
    return undefined
  }
}

export function getPayloadParameter(isTypeScript: boolean) {
  if (isTypeScript) {
    return [
      ts.createParameter(
        undefined,
        undefined,
        undefined,
        ts.createIdentifier('payload'),
        ts.createToken(ts.SyntaxKind.QuestionToken),
        ts.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        undefined
      ),
    ]
  } else {
    return [ts.createParameter([], [], undefined, 'payload')]
  }
}
