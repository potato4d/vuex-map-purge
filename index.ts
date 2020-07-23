import * as ts from "typescript";
import cheerio from "cheerio";

const sfc = `<template></template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'

export default Vue.extend({
  computed: {
    ...mapGetters(['user']),
    ...mapGetters('ui', ['isEditorView'])
  }
})
</script>
`;

const purgeMapFunction = <T extends ts.Node>(
  context: ts.TransformationContext
) => (rootNode: T) => {
  function visit(node: ts.Node): ts.Node {
    node = ts.visitEachChild(node, visit, context);
    if (node.kind === ts.SyntaxKind.PropertyAssignment) {
      const propAssignment: ts.PropertyAssignment = node as any;
      if ((propAssignment.name as any).escapedText === "computed") {
        (propAssignment.initializer as any).properties = (propAssignment.initializer as any).properties.reduce(
          (before: any, current: any) => {
            let name = "";
            try {
              name = current.expression.expression.escapedText;
            } catch (e) {}
            if (name === "mapGetters") {
              const mapGetters: ts.CallExpression = current.expression;
              const [namespaceOrList, listOrNull] = mapGetters.arguments;
              let prefix: string;
              let list: any = [];

              if (namespaceOrList.kind === ts.SyntaxKind.StringLiteral) {
                // namespaced mapping
                const ns: ts.StringLiteral = namespaceOrList as any;
                const l: ts.ArrayLiteralExpression = listOrNull as any;
                prefix = `${ns.text}/`;
                list = l.elements;
              } else {
                // root mapping
                const l: ts.ArrayLiteralExpression = namespaceOrList as any;
                prefix = "";
                list = l.elements;
              }
              return [
                ...before,
                ...list.map((arg: any) => {
                  return ts.createMethod(
                    undefined,
                    undefined,
                    undefined,
                    ts.createIdentifier((arg as any).text),
                    undefined,
                    undefined,
                    [],
                    undefined,
                    ts.createBlock([
                      ts.createReturn(
                        ts.createElementAccess(
                          ts.createPropertyAccess(
                            ts.createPropertyAccess(ts.createThis(), "$store"),
                            "getters"
                          ),
                          `${prefix}${arg.text}` as any
                        )
                      ),
                    ])
                  );
                }),
              ];
            } else {
              return [...before, current];
            }
          },
          []
        );
      }
    }
    return node;
  }
  return ts.visitNode(rootNode, visit);
};

async function run() {
  const $ = cheerio.load(sfc);
  const src = $("script")!.html();
  if (!src) {
    return;
  }
  const sourceFile = ts.createSourceFile(
    "index.ts",
    src,
    ts.ScriptTarget.ESNext
  );
  const result = ts.transform(sourceFile, [purgeMapFunction]);
  result.dispose();

  const printer = ts.createPrinter();
  console.log(printer.printFile(result.transformed[0] as ts.SourceFile));
}

run();
