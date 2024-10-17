import * as functions from '../functions.mjs';
import { nodeUpdateEventTarget, statsEventTarget } from '../events.mjs';

export function dijkstra(graph, options) {

  let algorithm = 'Dijkstra';
  statsEventTarget.stats = { 'algorithm': algorithm, 'message': 'not yet implemented !', 'nodesVisited': 0};
  statsEventTarget.goal = false;
  statsEventTarget.dispatchEvent(new Event('statsEvent'));

  return;
};