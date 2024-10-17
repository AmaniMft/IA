import { bfs } from './bfs.mjs';
import { dfs } from './dfs.mjs';
import { bestfirst } from './bestfirst.mjs';
import { astar } from './astar.mjs';
import { dijkstra } from './dijkstra.mjs';

export let algorithms = new Map();
algorithms.set('bfs', bfs);
algorithms.set('dfs', dfs);
algorithms.set('bestfirst', bestfirst);
algorithms.set('astar', astar);
algorithms.set('dijkstra', dijkstra);
