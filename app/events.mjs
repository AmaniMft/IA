/**
 * Returns an event target containing a node
 * used when a node is updated in a search algorithm
 */
export class NodeEvent extends EventTarget {
    constructor(node) {
        super();
        this._node = node;
    }
    get node() { return this._node; }
    set node(node) { this._node = node; }
};

export let nodeUpdateEventTarget = new NodeEvent();

/**
 * Returns an event target containing stats
 * used when stats are updated in a search algorithm
 */
export class StatsEvent extends EventTarget {
    constructor(stats, goal) {
        super();
        this._stats = stats;
        this._goal = goal;
    }
    get stats() { return this._stats; }
    set stats(stats) { this._stats = stats; }
    get goal() { return this._goal; }
    set goal(goal) { this._goal = goal; }
};
export let statsEventTarget = new StatsEvent();