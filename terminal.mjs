import { drawPathInConsole, timer } from './app/functions.mjs';
import { Grid } from './app/classes/Grid.mjs';
import { NodeGrid } from './app/classes/NodeGrid.mjs';
import * as algorithms from './app/algorithms/algorithms.mjs';
import { statsEventTarget } from './app/events.mjs';


let args = process.argv; //Get command line arguments

let options = {
  width: args.includes('--width')?parseInt(args[args.indexOf('--width') + 1]):10, //default grid width
  height: args.includes('--height')?parseInt(args[args.indexOf('--height') + 1]):10, //default grid height
  random: args.includes('--random'), //random grid
  runs: args.includes('--runs')?parseInt(args[args.indexOf('--runs') + 1]):5, //number of runs
  showStats: args.includes('--stats'), //show stats
  drawPath: args.includes('--path'), //draw path
  time: args.includes('--time')?parseInt(args[args.indexOf('--time') + 1]):0 //time between runs
}

//get algorithms to trigger from command line arguments if specified, default to all algorithms
let algorithmsToTrigger =
args.includes('--algo')? args[args.indexOf('--algo') + 1].split(',') : 
[
  'bfs',
  'dfs',
  'bestfirst',
  'astar',
  'dijkstra'
];

(async function () {

  //listen to statsEvent. When statsEvent is triggered, log the stats and draw the path in console if needed
  statsEventTarget.addEventListener('statsEvent', (e) => {
    if(options.showStats) console.log(e.currentTarget.stats.algorithm + ' : ' + e.currentTarget.stats.message + ' Nodes visited: ' + e.currentTarget.stats.nodesVisited);
    if(options.drawPath) drawPathInConsole(e.currentTarget.goal);
  }, false);

  let grid;

  //run the process options.runs times
  for (let i = 0; i < options.runs; i++) {

    if(options.random) {
      //Change grid size randomly each run between 5 and 100
      options.width = Math.floor(Math.random() * 100) + 5;
      options.height = Math.floor(Math.random() * 100) + 5;
    }

    grid = new Grid(options);

    //random start
    grid.root = grid.getRandomNode(options.notGoal = true);

    //sometimes add a goal outside the grid for testing
    if(Math.random() > 0.8) {
      if(options.showStats) console.log('Goal outside grid for testing');
      grid.goal = new NodeGrid(options.width * options.height + 1, options.width + 1, options.height + 1, false, 0);
    }

    // if options.showStats is true, log the grid size and the root and goal nodes before running the algorithms
    if(options.showStats) {
      console.log('==================================================');
      console.log(`  Grid ${grid.width} x ${grid.height} generated, root: [${grid.root.id}], goal: [${grid.goal.id}]`);
      console.log('==================================================');
    }

    //run all algorithms in sequence, clearing the grid each time, waiting for options.timer second between each run
    for (const algorithm of algorithmsToTrigger) {
      await grid.clear();
      await algorithms.algorithms.get(algorithm)(grid);
      if(options.time) await timer(options.time);
    }
  }

})();