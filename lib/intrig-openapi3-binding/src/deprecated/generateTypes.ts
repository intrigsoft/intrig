import {IntrigSourceConfig} from "@intrig/cli-common";
import generate, {OpenAPI3} from 'openapi-typescript'
import * as ts from 'typescript'
import {ScriptKind, ScriptTarget} from 'typescript'

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

export async function generateTypes(source: IntrigSourceConfig, _path: string, document: OpenAPI3) {
  let ast = await generate(document, {

  });

  let componentsNode: ts.InterfaceDeclaration = ast.find(a => ts.isInterfaceDeclaration(a) && a.name.text === "components");

  for (let dirNode of componentsNode.members) {
    if (ts.isPropertySignature(dirNode)) {
      let dir = getPropertySignatureName(dirNode)
      if (ts.isTypeLiteralNode(dirNode.type)) {
        for (let interfaceNode of dirNode.type.members) {
          if (ts.isPropertySignature(interfaceNode)) {
            let typeName = getPropertySignatureName(interfaceNode);

            if (ts.isTypeLiteralNode(interfaceNode.type)) {
              let members = interfaceNode.type.members;

              function transformType(node: ts.Node) {
                if (ts.isArrayTypeNode(node)) {
                  return ts.factory.createArrayTypeNode(transformType(node.elementType))
                } else {
                  let p = extractPath(node);
                  if (p.length) {
                    return ts.factory.createTypeReferenceNode(p.pop())
                  }
                }
                return node;
              }

              let newMembers = members.map(a => {
                if (ts.isPropertySignature(a)) {
                  return ts.factory.createPropertySignature(
                    a.modifiers,
                    a.name,
                    a.questionToken,
                    transformType(a.type)
                  )
                }
                return a
              });

              let interfaceDeclaration = ts.factory.createInterfaceDeclaration(
                [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
                ts.factory.createIdentifier(typeName),
                undefined,
                undefined,
                [
                  ...newMembers
                ]
              );

              let sourceFile = ts.createSourceFile(
                `${typeName}.d.ts`,
                '',
                ScriptTarget.Latest,
                false,
                ScriptKind.TS
              );

              let content = printer.printNode(ts.EmitHint.Unspecified, interfaceDeclaration, sourceFile);
              console.log(content);
            }
          }
        }
      }
    }
  }
}
// ts.isIndexedAccessTypeNode(node) && ts.isLiteralTypeNode(node.indexType) && ts.isStringLiteral(node.indexType.literal) && node.indexType.literal.text
//ts.isIndexedAccessTypeNode(node) && ts.isIndexedAccessTypeNode(node.objectType) && ts.isLiteralTypeNode(node.objectType.indexType) && ts.isStringLiteral(node.objectType.indexType.literal) && node.objectType.indexType.literal.text
function extractPath(node: ts.Node): string[] {
  if (ts.isIndexedAccessTypeNode(node)) {
    let text: string;
    if (ts.isLiteralTypeNode(node.indexType) && ts.isStringLiteral(node.indexType.literal)) {
      text = node.indexType.literal.text;
    }
    return [
      ...extractPath(node.objectType),
      text
    ].filter(Boolean)
  }
  return []
}

function getPropertySignatureName(propertySignature: ts.PropertySignature): string {
  const name = propertySignature.name;

  if (ts.isIdentifier(name)) {
    // Use escapedText for Identifiers
    return name.escapedText.toString();
  } else if (ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  } else if (ts.isComputedPropertyName(name)) {
    return "[computed]";
  }

  return "<unknown>";
}
