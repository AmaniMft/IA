class BaseAI {
    constructor(profondeurMax, heuristicFn = null) {
        this.profondeurMax = profondeurMax;
        this.heuristicFn = heuristicFn;
        this.resetStats();
    }

    resetStats() {
        this.nodesExplored = 0;
        this.evaluationCount = 0;
        this.startTime = 0;
        this.endTime = 0;
        this.prunedNodes = 0;
        this.totalNodes = 0;
    }

    measurePerformance(fn) {
        this.startTime = performance.now();
        this.nodesExplored = 0;
        this.evaluationCount = 0;
        this.prunedNodes = 0;
        this.totalNodes = 0;
        const result = fn();
        this.endTime = performance.now();
        return result;
    }

    getNodesExplored() {
        return this.nodesExplored;
    }

    incrementNodesExplored() {
        this.nodesExplored++;
        this.totalNodes++;
    }

    incrementPrunedNodes() {
        this.prunedNodes++;
    }

    getPruningEfficiency() {
        return this.totalNodes > 0 ? (this.prunedNodes / this.totalNodes) * 100 : 0;
    }

    getEvaluationCount() {
        return this.evaluationCount;
    }

    incrementEvaluationCount() {
        this.evaluationCount++;
    }

    getExecutionTime() {
        return this.endTime - this.startTime;
    }

    evaluatePosition(plateau, joueur) {
        this.incrementEvaluationCount();
        if (this.heuristicFn) {
            return this.heuristicFn(plateau, joueur);
        }
        
        // Heuristique par défaut si aucune n'est spécifiée
        let score = 0;
        for (let i = 0; i < plateau.taille; i++) {
            for (let j = 0; j < plateau.taille; j++) {
                const piece = plateau.getPiece(i, j);
                if (piece) {
                    const valeur = piece.estDame ? 3 : 1;
                    score += piece.joueur === joueur ? valeur : -valeur;
                }
            }
        }
        return score;
    }

    findBestMove(plateau) {
        throw new Error("La méthode findBestMove doit être implémentée par les classes filles");
    }
}

module.exports = BaseAI;
