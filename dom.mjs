import { GridDOM } from './app/classes/GridDOM.mjs';
import * as algorithms from './app/algorithms/algorithms.mjs';
import { nodeUpdateEventTarget, statsEventTarget } from './app/events.mjs';

if (typeof window === "object") { //Make sure we are in a web browser window

  // variables
  let grid;
  let options = {
    width: 10,
    height: 10,
    console: true,
    heuristic: 'manhattanDistance',
    root: 53,
    goal: 95,
    walls: [54,55,56,57,58,59,64,74,84,83,82,81],
    // cost: true,
    // time: false,
  }

  // Function to create a new grid
  let newGrid = async function () {
    grid = new GridDOM(options);
    grid.render();
  }

  // Function to reset grid
  let resetGrid = async function (clearWalls = false) {
    if(clearWalls) options.walls = [];
    grid.clear(clearWalls);
    grid.render();
    
  }

  newGrid(options);  //Create a new grid

  let statsDiv = document.getElementById('statsDiv'); //Get stats div

  // Events listeners

  //Trigger algorithms when algorithms buttons are clicked
  Array.prototype.forEach.call(document.querySelectorAll('.algorithms'), function (button, index) { //For each button with CSS class .algorithms
    button.addEventListener('click', async function () { //Add event listener to button
      //disable all buttons
      Array.prototype.forEach.call(document.querySelectorAll('button'), function (button, index) {
        button.disabled = true;
      });
      
      await resetGrid(); //Reset grid
      await algorithms.algorithms.get(button.id)(grid, options); //Run algorithm

      //enable all buttons
      Array.prototype.forEach.call(document.querySelectorAll('button'), function (button, index) {
        button.disabled = false;
      });
    });
  });

  document.getElementById('initRandom').addEventListener('click', function () { //On "Randomize" button click
    resetGrid(true); //Reset grid
    //generate random options
    options.cost = Math.random() > 0.5;
    options.heuristic = Math.random() > 0.5 ? 'manhattanDistance' : 'euclideanDistance';
    options.width = Math.floor(Math.random() * 15) + 5;
    options.height = Math.floor(Math.random() * 15) + 5;
    options.root = Math.floor(Math.random() * options.width * options.height);
    options.goal = Math.floor(Math.random() * options.width * options.height);
    let randomWalls = Math.floor(Math.random() * options.width * options.height);
    options.walls = Math.random() > 0.8 ? Array.from({ length: randomWalls }, () => Math.floor(Math.random() * options.width * options.height)) : [];
    newGrid(options); //Create new grid
  });

  //On "Initialize Grid" button click, create a new grid with specified options
  document.getElementById('init').addEventListener('click', function () {
    options.root = parseInt(document.getElementById('root').value);
    options.goal = parseInt(document.getElementById('goal').value);
    options.cost = document.getElementById('cost').checked;
    newGrid(options);
  });

  //On "Reset Grid" button click, reset grid to initial state
  document.getElementById('reset').addEventListener('click', function () {
    resetGrid(true);
  });

  //On "Reset Grid" button click, reset grid to initial state
  document.getElementById('resetKeep').addEventListener('click', function () {
    resetGrid();
  });

  //Listen to nodeUpdateEvent to update node in DOM (add visited and path classes to corresponding <td>)
  nodeUpdateEventTarget.addEventListener('nodeUpdateEvent', (e) => {
    if(options.console) console.log('nodeUpdateEvent', e.currentTarget.node);
    let node = e.currentTarget.node;
    if (node) {
      for (let key in node) {
        let value = node[key];
        if (value) document.getElementById(node.id).dataset[key] = value;
      }
      if (node.visited) document.getElementById(node.id).classList.add('visited');
      if (node.path) document.getElementById(node.id).classList.add('path');
    }
  }, false);

  //Listen to statsEvent to display search statistics
  statsEventTarget.addEventListener('statsEvent', (e) => {
    if(options.console) console.log('statsEvent', e.currentTarget);
    let pathCost = 0;

    if (e.currentTarget.goal) { //if goal is found, draw path
      let node = e.currentTarget.goal; //start from goal
      while (node.parent != null) {  //until current node has parent, we must follow
        pathCost += node.cost; //increment
        node.path = true; //mark node as part of the path
        node = node.parent; //move to parent node
        document.getElementById(node.id).classList.add('path'); //add path class to node in DOM
      }
    }

    //Whether goal is found or not, display statistics
    statsDiv.innerHTML = '';
    let p = document.createElement('p');
    p.innerHTML = e.currentTarget.stats.algorithm+' : '+e.currentTarget.stats.message+'<br/>';
    p.innerHTML += 'Nodes visited : ' + e.currentTarget.stats.nodesVisited+'<br/>';
    if (pathCost) p.innerHTML += 'Path cost : ' + pathCost;
    statsDiv.appendChild(p);

  }, false);

  //Update grid width and height
  document.getElementById('width').addEventListener('change', (event) => {
    options.width = parseInt(event.target.value);
  });
  document.getElementById('height').addEventListener('change', (event) => {
    options.height = parseInt(event.target.value);
  });

  //Update nodes slowly to view search process
  document.getElementById('time').addEventListener('change', (event) => {
    if (event.currentTarget.checked) options.time = 100;
    else options.time = false;
  });

  //Add cost to nodes for Dijkstra and A* algorithms
  document.getElementById('cost').addEventListener('change', (event) => {
    options.cost = event.currentTarget.checked;
  });

  document.getElementsByName('heuristic').forEach((radio) => {
    radio.addEventListener('change', (event) => {
      options.heuristic = event.currentTarget.value;
    });
  });

  document.getElementById('console').addEventListener('change', (event) => {
    options.console = event.currentTarget.checked;
  });

}