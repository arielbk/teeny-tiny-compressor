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

