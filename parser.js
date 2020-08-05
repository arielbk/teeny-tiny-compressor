/**
 * The Parser (turns our tokens into an AST — abstract syntax tree)
 */

module.exports = function parser(tokens) {
  // another cursor
  let current = 0;

  // this time we use recursion rather than an iterating while loop
  function walk() {
    let token = tokens[current];

    // split token types into different nodes

    if (token.type === 'number') {
      current++;

      return {
        type: 'NumberLiteral',
        value: token.value,
      }
    }

    if (token.type === 'string') {
      current++;

      return {
        type: 'StringLiteral',
        value: token.value,
      }
    }

    // we look for CallExpressions here, started by on open parenthesis
    if (token.type === 'paren' && token.value === '(') {
      // skip the opening parenthesis
      token = tokens[++current];

      // we create a base node for the CallExpression with the name
      let node = {
        type: 'CallExpression',
        name: token.value,
        params: [],
      };
      // and move past the 'name token
      token = tokens[++current];

      // Now comes the tricky recursive part
      // Every call in it's own set of parentheses will be a nested node
      while(
        (token.type !== 'paren') ||
        (token.type === 'paren' && token.value !== ')')
      ) {
        // we call walk fn and push it into the current nodes 'params'
        node.params.push(walk());
        // and then set out current token again
        token = tokens[current];
      }

      // skip the closing parenthesis
      current++;

      return node;
    }

    // throw an error for any unknown tokens
    throw new TypeError(`Unknown token: ${token.type}`);
  }

  // initialize the AST with a root 'Program' node
  let ast = {
    type: 'Program',
    body: [],
  };

  // finally we can walk through our tokens, and build our AST
  while (current < tokens.length) {
    ast.body.push(walk());
  }
  return ast;
};
