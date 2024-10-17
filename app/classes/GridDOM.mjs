import { Grid } from './Grid.mjs';
import { nodeUpdateEventTarget } from '../events.mjs';

export class GridDOM extends Grid {

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
        this.options = options;
    }

    /**
     * Render the grid to the DOM
     */
    render() {
        if (typeof window === "object") { //Make sure we are in a web browser by testing for the window object

            //create a <table> HTML element
            let htmlTableGrid = document.createElement('table');
            htmlTableGrid.className = 'grid';
            htmlTableGrid.id = 'grid';

            //add event listeners to detect mouse drag over grid (to toggle walls' nodes)
            let mouseDown = false;
            document.addEventListener('mousedown', () => mouseDown = true);
            document.addEventListener('mouseup', () => mouseDown = false);

            //create html table with this.width and this.height cells
            for (let i = 0; i < this.height; i++) { // create this.height rows

                let tr = htmlTableGrid.appendChild(document.createElement('tr'));

                for (let j = 0; j < this.width; j++) { // create this.width cells

                    let td = tr.appendChild(document.createElement('td'));

                    let node = this.get(this.getId(j, i)); //get the node by coordinates
                    td.id = node.id; //set the cell id to the node id
                    for (let key in node) { //set data attributes for each node, for example, data-wall="false"
                        let value = node[key];
                        td.dataset[key] = value;
                    }

                    if (node.visited) td.classList.add('visited'); //add visited class if the node has already been visited
                    if (node.path) td.classList.add('path'); //add path class if the node is already part of the path

                    if (!node.wall) { //if the node is not a wall (if it is a wall, it will be displayed as a black cell)

                        let innerHTML = '#' + node.id; //display node id in the <td> element

                        if (this.options.cost) innerHTML += '<br>' + node.cost; //display node cost if cost options is true
                        //  innerHTML += '<br>' + '[' + j + ',' + i + ']'; //display node id and coordinates

                        if (this.root && node.id === this.root.id) { //if the node is the root node, add root class and display
                            td.classList.add('root');
                            innerHTML = 'Start <br>' + innerHTML;
                        }

                        if (this.goal && node.id === this.goal.id) { //if the node is the goal node, add goal class and display
                            td.classList.add('goal');
                            innerHTML = 'Goal <br>' + innerHTML;
                        }

                        let innerDiv = document.createElement('div'); //create a div element to display the node id and cost
                        innerDiv.innerHTML = innerHTML; //set the innerHTML of the div element

                        td.appendChild(innerDiv); //append the div element to the <td> element
                    }

                    //add event listener to toggle walls
                    let self = this; //save the current this context to a variable to use in the event listeners

                    td.addEventListener('click', function (event) { //add click event listener to toggle walls
                        if (event.target.classList.contains('root') || event.target.classList.contains('goal')) return; //do not toggle root or goal nodes
                        let node = self.get(event.target.id); //get the node by the cell id
                        self.wallToggle(node, event.target); //toggle the wall status of the node
                        nodeUpdateEventTarget.node = node; //set the node to the nodeUpdateEventTarget
                        nodeUpdateEventTarget.dispatchEvent(new Event('nodeUpdateEvent', node)); //dispatch a nodeUpdateEvent with the node
                    });

                    td.addEventListener('mouseover', function (event) { //add mouseover event listener to toggle walls
                        if (event.target.classList.contains('root') || event.target.classList.contains('goal')) return; //do not toggle root or goal nodes
                        if (mouseDown) { //if the mouse is down (mouse drag), toggle the wall status of the node
                            let node = self.get(event.target.id); //get the node by the cell id
                            self.wallToggle(node, event.target); //toggle the wall status of the node
                            nodeUpdateEventTarget.node = node; //set the node to the nodeUpdateEventTarget
                            nodeUpdateEventTarget.dispatchEvent(new Event('nodeUpdateEvent', node)); //dispatch a nodeUpdateEvent with the node
                        }
                    });
                }
            }

            //cleanup previous grid and stats elements
            if (document.getElementById('grid')) document.getElementById('grid').remove();
            if (document.getElementById('stats')) document.getElementById('stats').remove();

            //append grid to the DOM
            document.getElementById('grid-container').appendChild(htmlTableGrid);


        }
    }

    wallToggle(node, target) {
        node.wall = !node.wall;
        if (node.wall) {
            target.classList.add('wall');
            target.dataset.wall = true;
        }
        else {
            target.classList.remove('wall');
            target.dataset.wall = false;
        }
    }
}