import * as functions from '../functions.mjs';
import { nodeUpdateEventTarget, statsEventTarget } from '../events.mjs';

export function bestfirst(graph, options) {

  let algorithm = 'BestFirst';
  statsEventTarget.stats = { 'algorithm': algorithm, 'message': 'not yet implemented !', 'nodesVisited': 0};
  statsEventTarget.goal = false;
  statsEventTarget.dispatchEvent(new Event('statsEvent'));

  return;

};