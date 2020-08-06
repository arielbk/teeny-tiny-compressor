/**
 * Basic compilation of Lisp-like function calls to C-like function calls:
 * (add 3 4) => add(3, 4)
 * (add 3 (subtract 9 7)) => add(3, subtract(9, 7))
 */

const tokenizer = require('./tokenizer');
const parser = require('./parser');
const transformer = require('./transformer');
const codeGenerator = require('./codeGenerator');

 /**
  * The steps are as follows:
  *   1. input  => tokenizer   => tokens
  *   2. tokens => parser      => ast
  *   3. ast    => transformer => newAst
  *   4. newAst => generator   => output
  */

function compiler(input) {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  const newAst = transformer(ast);

  return codeGenerator(newAst);
}

const compiled = compiler('(add 3 (subtract 9 7))');
console.log(compiled); // add(3, subtract(9, 7));
