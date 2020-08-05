/**
 * Following along with the super tiny compiler (https://github.com/jamiebuilds/the-super-tiny-compiler)
 * Definitely check it out!
 * 
 * This seems like a really good exercise even just to understand how code is parsed and executed,
 * it brings to mind what I've read on JavaScript interpretation
 * 
 * Basic compilation of Lisp-like function calls to C-like function calls:
 * (add 3 4) => add(3, 4)
 * (add 3 (subtract 9 7)) => add(3, subtract(9, 7))
 */

/**
 * Tokenizer (the first phase of lexical analysis)
 */

function tokenizer(input) {
  // tracking our position like a cursor
  let current = 0;
  // to push our tokens to
  let tokens = [];

  // loop that ends when we reach end of input
  while (current < input.length) {
    // store the current character
    let char = input[current];

    // check for parentheses
    if (char === '(' || char === ')') {
      tokens.push({
        type: 'paren',
        value: char,
      });
      // and move on
      current++;
      continue;
    }

    // check for whitespace - it does not need to be tokenized but it's important as a separator
    let WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    // check for numbers -- different because it could be any number of characters
    let NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      // our number value to push digits to
      let value = '';

      // keep on pushing to value while current char is a digit
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current]; // increments current AND THEN returns the new char
      }

      // push number to our tokens array
      tokens.push({ type: 'number', value });

      continue;
    }

    // check for any strings surrounded by quotes
    if (char === '"') {
      // our string value to push characters to
      let value = '';

      // skip the opening quotation mark
      char = input[++current];

      // iterate until we reach the end of the string
      while (char !== '"') {
        value += char;
        char = input[++current];
      }

      // skip the closing quotation mark
      char = input[++current];

      // add the final string to tokens array
      tokens.push({ type: 'string', value });

      continue;
    }

    // 'name' token that represents names of functions
    let LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      // value to push function name characters to
      let value = '';

      // iterating until we reach the end of the name
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      // pushing the 'name' token to our array
      tokens.push({ type: 'name', value });

      continue;
    }

    // If the type of token is not found, throw an error
    throw new TypeError(`Unknown character: ${char}`);
  }

  // tokenizer funcitons returns our tokens array
  return tokens;
}

/**
 * The Parser (turns our tokens into an AST — abstract syntax tree)
 */
function parser(tokens) {
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

/**
 * The Traverser
 * 
 * (uses a 'visitor' model, where the visitor enters the node,
 * and exits the node when it's done with all child nodes)
 */
function traverser(ast, visitor) {

  // function to allow us to iterate an array and traverse its nodes
  function traverseArray(array, parent) {
    array.forEach(child => {
      traverseNode(child, parent);
    })
  }

  // traverses a node, contains the parent so that it can be passed to visitor methods
  function traverseNode(node, parent) {

    // get visitor methods for this type
    let methods = visitor[node.type];

    // call enter method if available
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    // take action according to current node type
    switch (node.type) {
      // for the top level program we will traverse into our nodes
      case 'Program':
        traverseArray(node.body, node);
        break;

      // CallExpressions have their params traversed in the same way
      case 'CallExpression':
        traverseArray(node.params, node);
        break;

      // NumberLiteral and StringLiteral do not have child nodes to traverse
      case 'NumberLiteral':
      case 'StringLiteral':
        break;

      // throw error if there's an unrecognized node type
      default:
        throw new TypeError(`Unknown node type: ${node.type}`);
    }

    // if applicable, call the exit method for this node type
    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  // begin traversing nodes with our root ast, and no parent visitor
  traverseNode(ast, null);
}

/**
 * The Transformer
 * - transforms our AST by passing it to the Traverser with a visitor function
 */
// transformer revices the lisp ast
function transformer(ast) {

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
          type: 'StringLiteral',
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




const tokens = tokenizer('(add 3 (subtract 9 7))');

const parsed = parser(tokens);
const prettyParsed = JSON.stringify(parsed, null, 2);
console.log(prettyParsed);

const transformed = transformer(parsed);
const prettyTransformed = JSON.stringify(transformed, null, 2);
console.log(prettyTransformed);

