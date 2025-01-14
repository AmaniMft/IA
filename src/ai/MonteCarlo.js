const BaseAI = require('./BaseAI');

class Node {
    constructor(move = null, parent = null) {
        this.move = move;
        this.parent = parent;
        this.children = [];
        this.wins = 0;
        this.visits = 0;
        this.untriedMoves = [];
    }

    // Sélection du meilleur enfant selon UCB1
    getBestChild(explorationConstant) {
        return this.children.reduce((best, child) => {
            const ucb1 = (child.wins / child.visits) + 
                        explorationConstant * Math.sqrt(Math.log(this.visits) / child.visits);
            return ucb1 > best.score ? { node: child, score: ucb1 } : best;
        }, { node: null, score: Number.NEGATIVE_INFINITY }).node;
    }

    // Ajout d'un enfant
    addChild(move) {
        const child = new Node(move, this);
        this.children.push(child);
        return child;
    }
}

class MonteCarlo extends BaseAI {
    constructor(maxDepth = 3, heuristicFn = null) {
        super(maxDepth, heuristicFn);
        this.maxIterations = 1000;
        this.explorationConstant = Math.sqrt(2);
    }

    findBestMove(plateau) {
        this.nodesExplored = 0;
        const mouvementsPossibles = plateau.getMouvementsPossiblesPourJoueur(plateau.joueurActuel);
        
        if (mouvementsPossibles.length === 0) {
            return null;
        }

        // Création du nœud racine
        const rootNode = new Node();
        rootNode.untriedMoves = [...mouvementsPossibles];

        // Exécution des itérations MCTS
        for (let i = 0; i < this.maxIterations; i++) {
            const plateauCopie = plateau.clone();
            const selectedNode = this.select(rootNode, plateauCopie);
            const expandedNode = this.expand(selectedNode, plateauCopie);
            const result = this.simulate(plateauCopie);
            this.backpropagate(expandedNode, result);
        }

        // Sélection du meilleur mouvement
        const bestChild = rootNode.children.reduce((best, child) => {
            return (child.visits > best.visits) ? child : best;
        });

        return bestChild.move;
    }

    // Sélection : descente dans l'arbre
    select(node, plateau) {
        while (node.untriedMoves.length === 0 && node.children.length > 0) {
            node = node.getBestChild(this.explorationConstant);
            if (node.move) {
                plateau.deplacerPiece(node.move);
            }
        }
        return node;
    }

    // Expansion : ajout d'un nouveau nœud
    expand(node, plateau) {
        if (node.untriedMoves.length === 0) {
            return node;
        }

        const randomIndex = Math.floor(Math.random() * node.untriedMoves.length);
        const move = node.untriedMoves.splice(randomIndex, 1)[0];
        plateau.deplacerPiece(move);
        
        return node.addChild(move);
    }

    // Simulation : partie aléatoire jusqu'à la fin
    simulate(plateau) {
        const joueurInitial = plateau.joueurActuel;
        let depth = this.maxDepth;

        while (!plateau.estPartieTerminee() && depth > 0) {
            const mouvementsPossibles = plateau.getMouvementsPossiblesPourJoueur(plateau.joueurActuel);
            if (mouvementsPossibles.length === 0) break;

            const randomMove = mouvementsPossibles[Math.floor(Math.random() * mouvementsPossibles.length)];
            plateau.deplacerPiece(randomMove);
            this.nodesExplored++;
            depth--;
        }

        // Évaluation de la position finale
        const score = this.heuristicFn(plateau, joueurInitial);
        return score > 0 ? 1 : (score < 0 ? 0 : 0.5);
    }

    // Rétropropagation : mise à jour des statistiques
    backpropagate(node, result) {
        while (node !== null) {
            node.visits++;
            node.wins += result;
            node = node.parent;
        }
    }

    // Méthode pour obtenir des statistiques sur l'arbre de recherche
    getTreeStats() {
        return {
            totalNodes: this.nodesExplored,
            averageBranchingFactor: this.children ? this.children.length : 0,
            maxDepthReached: this.maxDepth
        };
    }
}

module.exports = MonteCarlo;