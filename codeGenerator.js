/**
 * The Code Generator
 * Pieces together the transformed ast into a string of code
*/

// called recursively
module.exports = function codeGenerator(node) {

  // output depends on the type of node
  switch (node.type) {

    // for the `Program` node we map through each node and generate lines of code
    case 'Program':
      return node.body.map(codeGenerator).join('\n');

    // for an expression statement we move into the nested expression
    case 'ExpressionStatement':
      return codeGenerator(node.expression) + ';';

    // for a call expression => fnName(arg1, arg2);
    case 'CallExpression':
      return `${codeGenerator(node.callee)}(${node.arguments.map(codeGenerator).join(', ')})`;

    // Indentifier just returns the name
    case 'Identifier':
      return node.name;

    // NumberLiterals just return their value
    case 'NumberLiteral':
      return Number(node.value);

    // StringLiterals return their value with quotation marks around
    case 'StringLiteral':
      return `"${node.value}"`;

    // an unknown node type throws an error
    default:
      throw new TypeError(`Unknown type: ${node.type}`);
  }
} 