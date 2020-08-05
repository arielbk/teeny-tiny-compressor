/**
 * The Traverser
 * 
 * (uses a 'visitor' model, where the visitor enters the node,
 * and exits the node when it's done with all child nodes)
 */

module.exports = function traverser(ast, visitor) {

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