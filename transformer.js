/**
 * The Transformer
 * - transforms our AST by passing it to the Traverser with a visitor function
 */

const traverser = require('./traverser');

// transformer revices the lisp ast
module.exports = function transformer(ast) {

  // initialize our new ast
  let newAst = {
    type: 'Program',
    body: [],
  };

  // apparently this part is hacky but works
  // context is just a reference from the old ast to the new ast
  ast._context = newAst.body;

  // call traverser with the ast and a visitor we define here
  traverser(ast, {

    NumberLiteral: {
      // visit on enter
      enter(node, parent) {
        // push to the parent context
        parent._context.push({
          type: 'NumberLiteral',
          value: node.value,
        });
      },
    },

    // same thing for StringLiteral
    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value: node.value,
        });
      },
    },

    // CallExpression is the tricky one
    CallExpression: {
      enter(node, parent) {

        // initialize CallExpression node with 'Identifier'
        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name,
          },
          arguments: [],
        };

        // create a new context on the original to push arguments
        node._context = expression.arguments;

        // if parent node is not also CallExpression we wrap it in an ExpressionStatement
        if (parent.type !== 'CallExpression') {
          expression = {
            type: 'ExpressionStatement',
            expression: expression,
          };
        }

        // push to the parent context
        parent._context.push(expression);
      },
    }
  });

  // return the new, transformed ast
  return newAst;
}