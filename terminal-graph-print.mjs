import { Graph } from './app/classes/Graph.mjs';
import { Node } from './app/classes/Node.mjs';

let n1 = new Node(1);
let n2 = new Node(2);
let n3 = new Node(3);
let n4 = new Node(4);
let n5 = new Node(5);
let n6 = new Node(6);
let n7 = new Node(7);
let n8 = new Node(8);

let graph = new Graph({root: n1, goal: n7});

console.log('==================');
console.log('Non-oriented graph');
console.log('==================');
console.log('');
graph.addEdge(n1, n2);
graph.addEdge(n1, n3);
graph.addEdge(n2, n4);
graph.addEdge(n2, n5);
graph.addEdge(n3, n6);
graph.addEdge(n3, n7);
graph.addEdge(n7, n8);

console.log('Adjacency matrix');
console.log('');
console.log(graph.toAdjacencyMatrix());
console.log('Adjacency list');
console.log('');
console.log(graph.toAdjacencyList());
console.log('Tree view');
console.log('');
console.log(graph.toTreeView());
console.log('to String');
console.log('');
console.log(graph.toString());

graph = new Graph({root: n1, goal: n7});

console.log('==================');
console.log('Oriented graph');
console.log('==================');
graph.addChild(n1, n2);
graph.addChild(n1, n3);
graph.addChild(n2, n4);
graph.addChild(n2, n5);
graph.addChild(n3, n6);
graph.addChild(n3, n7);
graph.addChild(n7, n8);
console.log('');
console.log('Adjacency matrix');
console.log('');
console.log(graph.toAdjacencyMatrix());
console.log('Adjacency list');
console.log('');
console.log(graph.toAdjacencyList());
console.log('Tree view');
console.log('');
console.log(graph.toTreeView());
console.log('to String');
console.log('');
console.log(graph.toString());