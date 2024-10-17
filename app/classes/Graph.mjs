/**
 * Represents a graph object
 */
export class Graph {

    /**
     * Builds a graph object
     * @param {Object} options {
     * root: Node, root node,
     * goal: Node, goal node,
     * nodes: [Node], array of nodes,
     * }
     */
    constructor(options) {
        
        this.nodes = options?.nodes?options.nodes:[];

        this.root = options?.root ? (typeof options.root === 'number' ? this.get(options.root) : options.root) : null; //set the root node, default to the first node
        this.goal = options?.goal ? (typeof options.goal === 'number' ? this.get(options.goal) : options.goal) : null; //set the goal node, default to the last node

        this.root?this.addNode(this.root):null;
        this.goal?this.addNode(this.goal):null;
    }

    /**
     * Add a node to the graph
     * @param {Node} node - the node to add
     */
    addNode(node) {
        if(!this.contains(node)) this.nodes.push(node);
    }

    /**
     * Remove a node from the graph
     * @param {Node} node - the node to remove
     */
    removeNode(node) {
        this.nodes = this.nodes.filter(n => n !== node);
    }

    /**
     * Check if a node is in the graph
     * @param {Node} node - the node to check
     * @returns {boolean} - true if the node is in the graph
     */
    contains(node) {
        return this.nodes.includes(node);
    }

    /**
     * Get the number of nodes in the graph
     * @returns {number} - the number of nodes in the graph
     */
    get length() {
        return this.nodes.length;
    }

    /**
     * Get a node from the graph by index
     * @param {number} index - the index of the node
     * @returns {Node} - the node at the index
     * @returns {null} - if the index is out of bounds
     */
    get(index) {
        if(typeof this.nodes[index] === 'undefined') return null;
        return this.nodes[index];
    }

    /**
     * Get a node from the graph by id
     * @param {number} id - the id of the node
     * @returns {Node} - the node with the id
     * @returns {null} - if the node is not in the graph
     */
    getById(id) {
        return this.nodes.find(node => node.id === id);
    }

    /**
     * Call the clear method on each node
     */
    clear() {
        this.nodes.map(node => { node.clear(); });
    }

    /**
     * Discover node children from graph
     * @param {Node} node - the node to get children from
     * @returns {Array} - an array of nodes that are children of the node
     */
    getChildren(node) {
        return this.nodes.filter(n => n.parent === node); //filter nodes that have the current node as parent
    }

    getEdges(node) {
        return this.nodes.filter(n => n.children.includes(node));
    }

    /**
     * Get a random node from the graph
     * @param {Object} options {
     * notRoot: boolean, true if the node should not be the root node,
     * notGoal: boolean, true if the node should not be the goal node,
     * }
     * @returns {Node} - a random node from the graph
     */
    getRandomNode(options) {
        let node = this.nodes[Math.floor(Math.random() * this.nodes.length)];
        if(options?.notRoot && options?.notGoal) while(node === this.root || node === this.goal) node = this.nodes[Math.floor(Math.random() * this.nodes.length)];
        else if(options?.notRoot) while(node === this.root) node = this.nodes[Math.floor(Math.random() * this.nodes.length)];
        else if(options?.notGoal) while(node === this.goal) node = this.nodes[Math.floor(Math.random() * this.nodes.length)];
        return node;
    }

    /**
     * Set a random root node
     */
    setRandomRoot() {
        this.root = this.getRandomNode({ notGoal: true });
    }

    /**
     * Set a random goal node
     */
    setRandomGoal() {
        this.goal = this.getRandomNode({ notRoot: true });
    }

    /**
     * Clear the children of each node
     */
    clearChildren() {
        this.nodes.map(node => { node.clearChildren(); });
    }

    /**
     * Add an edge between two nodes
     * Add the nodes if they are not in the graph
     * @param {Node} node1 - the first node
     * @param {Node} node2 - the second
     */
    addEdge(node1, node2) {
        if(!this.contains(node1)) this.addNode(node1);
        if(!this.contains(node2)) this.addNode(node2);
        node1.addChild(node2);
        node2.addChild(node1);
    }

    /**
     * Remove an edge between two nodes
     * @param {Node} node1 - the first node
     * @param {Node} node2 - the second
     */
    removeEdge(node1, node2) {
        node1.removeChild(node2);
        node2.removeChild(node1);
    }

    /**
     * Add a child to a node
     * @param {Node} parent - the parent node
     * @param {Node} child - the child node
     */
    addChild(parent, child) {
        if(!this.contains(parent)) this.addNode(parent);
        if(!this.contains(child)) this.addNode(child);
        parent.addChild(child);
        child.addParent(parent);
    }

    /**
     * Remove a child from a node
     * @param {Node} parent - the parent node
     * @param {Node} child - the child node
     */
    removeChild(parent, child) {
        parent.children = parent.children.filter(n => n !== child);
        child.parent = null;
    }

    toAdjacencyMatrix() {
        let str = '';
        this.nodes.map(node => {
            let row = [];
            this.nodes.map(n => {
                node.children.includes(n) ? row.push('1') : row.push('0');
            });
            str += row.join(' ') + '\n';
        });
        return str;
    }
    
    toAdjacencyList() {
        let str = '';
        this.nodes.map(node => {
            node.children.length === 0 ? str += `${node.id}\n` : str += `${node.id} : ${node.children.map(n => n.id).join(', ')}\n`;
        });
        return str;
    }

    toTreeView() {
        let buffer = [];
        this.toTreeViewPrintRecursive(buffer, "", "");
        return buffer.join('');
    }

    toTreeViewPrintRecursive(buffer, prefix, childrenPrefix, node = this.root) {
        buffer.push(prefix);
        buffer.push(node.id);
        buffer.push('\n');
        let children = this.getChildren(node);
        for (let i = 0; i < children.length; i++) {
            let next = children[i];
            if (i < children.length - 1) {
                this.toTreeViewPrintRecursive(buffer, childrenPrefix + "├── ", childrenPrefix + "│   ", next);
            } else {
                this.toTreeViewPrintRecursive(buffer, childrenPrefix + "└── ", childrenPrefix + "    ", next);
            }
        }
    }

    toString() {
        let isOriented = this.nodes.filter(node => node.parent).length > 0;
        let str = '';
        this.nodes.map(node => {
            str += node.id + (isOriented ? ' -> ' + node.children.map(n => n.id).join(', ') : ' -- ' + this.getEdges(node).map(n => n.id).join(', ')) + '\n';

        });
        return str;
    }
}