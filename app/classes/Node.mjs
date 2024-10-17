/**
 * Represents a node object
 * If used in a 2D array, the id can be used as the index
 * If used in a grid, the x and y coordinates can be used
 * More dimensions can be added by adding more coordinates
 * @param {number} id - the node id
 * @param {number} x - the x coordinate
 * @param {number} y - the y coordinate
 * @param {boolean} wall - true if the node is a wall
 * @param {number} cost - the cost of the node
 */
export class Node {
    constructor(id, cost = 0) {
        this.id = id;
        this.cost = cost;
        this.parent = null; //parent node, for oriented graphs
        this.children = []; //children nodes for oriented graphs == edges for non-oriented graphs

        this.h = null; //heuristic value
        this.g = null; //cost from start node

        this.visited = false; //flag to indicate if the node has been visited
        this.found = false; //flag to indicate if the node has been found

        this.path = false; //flag to indicate if the node is part of the path
    }

    addChild(node) {
        if (!this.children.includes(node)) this.children.push(node);
    }

    removeChild(node) {
        this.children = this.children.filter(n => n !== node);
    }

    addParent(node) {
        this.parent = node;
    }

    contains(node) {
        return this.children.includes(node);
    }

    get length() {
        return this.children.length;
    }

    /**
     * Clear the node's properties
     */
    clear() {
        this.visited = false;
        this.found = false;
        this.path = false;
        this.h = null;
        this.g = null;
        this.parent = null;
        this.children = [];
    }

    /**
     * Clear the node's children
     */
    clearChildren() {
        this.children = [];
    }

    /**
     * Set the heuristic value for the node
     * @param {Node} nodeTarget - the target node
     * @param {Function} heuristicFunction - the heuristic function to use
     * @returns {number} - the heuristic value
     * @returns {null} - if the heuristic function is not provided
     */
    heuristic(nodeTarget, heuristicFunction) {
        if (!heuristicFunction) return null;
        this.h = heuristicFunction(this, nodeTarget);
        return this.h;
    }

}