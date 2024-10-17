export const timer = ms => new Promise(res => setTimeout(res, ms));

export const drawPathInConsole = async function (node) {
  let path = [];
  let output = '';

  // while the node has a parent, mark the path and push it to the path array
  while (node.parent != null) {
    node.path = true;
    path.push(node);
    node = node.parent;
  }
  console.log('Path : ');
  //display path in console in reverse order (goal to start) with an arrow between nodes except for the last one
  path.reverse().map((node, i, arr) => { if (arr.length - 1 === i) process.stdout.write(`[${node.id}]`); else process.stdout.write(`[${node.id}] -> `); });
  console.log('');
  console.log('');
}