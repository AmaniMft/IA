import { Graph } from './Graph.mjs';
import { NodeGrid } from './NodeGrid.mjs';

/**
 * Represents a grid object
 * @param {number} width - the width of the grid
 * @param {number} height - the height of the grid
 */
export class Grid extends Graph {

    /**
     * Builds a grid object
     * @param {*} options {
     * width: number, width of the grid,
     * height: number, height of the grid,
     * walls: [number], array of node ids that are walls,
     * cost: boolean, true if the nodes should have a cost
     * root: number, root node id
     * goal: number, goal node id
     * }
     */
    constructor(options) {
        super(options);

        //set grid width and height, default to 10 x 10 if not provided
        this.width = options?.width ? options.width : 10;
        this.height = options?.height ? options.height : 10;

        //set heuristic, default to manhattanDistance
        this.heuristic = options?.heuristic ? options.heuristic : 'manhattanDistance';

        //build Grid nodes
        let id = 0; //node id
        for (let iY = 0; iY < this.height; iY++) { //loop through the grid height
            for (let iX = 0; iX < this.width; iX++) { //loop through the grid width
                let wall = options?.walls ? options.walls.includes(id) : false; //check if the node should be a wall
                let cost = options?.cost ? (Math.floor(Math.random() * 15) + 2) : 1; //set a random cost between 2 and 15 if cost is true, set to 1 if not
                let node = new NodeGrid(id, iX, iY, wall, cost); //create a new NodeGrid Object
                this.addNode(node); //add the node to the grid
                id++; //increment the node id
            }
        }

        this.root = options?.root ? (typeof options.root === 'number' ? this.get(options.root) : options.root) : this.get(0); //set the root node, default to the first node
        this.goal = options?.goal ? (typeof options.goal === 'number' ? this.get(options.goal) : options.goal) : this.get(this.nodes.length - 1); //set the goal node, default to the last node

        while (this.root === this.goal) { //if the root and goal are the same, set a new goal
            this.goal = this.getRandomNode();
        }
    }

    /**
     * discover node children from the grid (up, down, left, right)
     * @param {Node} node - the node to get children from
     * @returns {Array} - an array of nodes that are children of the node
     */
    getChildren(node) {

        let children = [];
        let { x, y } = this.getCoordinates(node.id);

        //get children only if they are next to each other within the grid width and height
        let childrenIds = [];

        if (x - 1 >= 0) childrenIds.push(this.getId(x - 1, y));
        if (x + 1 < this.width) childrenIds.push(this.getId(x + 1, y));
        if (y - 1 >= 0) childrenIds.push(this.getId(x, y - 1));
        if (y + 1 < this.height) childrenIds.push(this.getId(x, y + 1));

        // if the child exists, is not a wall, and has not already been found, we mark it as found and add it to children
        childrenIds.map((id) => {
            let child = this.getById(id);
            if (child && child.parent == null && !child.wall && !child.found && !child.visited) {
                child.found = true; //mark the child as found
                child.parent = node; //set the parent node
                child.h = child.heuristic(this.goal, this.heuristic); //set the heuristic value to the goal
                child.g = node.g + child.cost; //set the cost from the start node
                children.push(child); //add the child to the children array
            }
        });

        return children;
    }

    /**
     * Get node id from x and y coordinates in the grid
     * @param {number} x - x axis coordinate
     * @param {number} y - y axis coordinate
     * @returns {number} - the node id
     */
    getId(x, y) {
        return y * this.width + x % this.width;
    }

    /**
     * Get coordinates from node id
     * @param {number} id 
     * @returns {Object} - {x: number, y: number}
     */
    getCoordinates(id) {
        let x = id % this.width;
        let y = Math.floor(id / this.width);
        return { x: x, y: y };
    }

    /**
     * Call the clear method on each node
     * @param {boolean} clearWalls : true if walls should be cleared
     */
    clear(clearWalls = false) {
        this.nodes.map(node => { node.clear(clearWalls); });
    }

    /**
     * Display the grid as a string
     * @returns {string} - a string representation of the grid
     */
    toString() {
        let output = '';
        for (let iY = 0; iY < this.height; iY++) {
            for (let iX = 0; iX < this.width; iX++) {
                let node = this.getById(this.getId(iX, iY));
                output += node.wall ? 'X' : node.cost;
            }
            output += '\n';
        }
        return output;
    }

}