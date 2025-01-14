const BaseAI = require('./BaseAI');

class LasVegas extends BaseAI {
    constructor(maxDepth = 3, heuristicFn = null) {
        super(maxDepth, heuristicFn);
        this.maxAttempts = 50; // Réduit le nombre de tentatives
        this.maxRecursionDepth = 5; // Limite la profondeur de récursion
    }

    findBestMove(plateau) {
        this.nodesExplored = 0;
        const mouvementsPossibles = plateau.getMouvementsPossiblesPourJoueur(plateau.joueurActuel);
        
        if (mouvementsPossibles.length === 0) {
            return null;
        }

        let bestMove = null;
        let bestScore = Number.NEGATIVE_INFINITY;
        let attempts = 0;

        while (attempts < this.maxAttempts) {
            // Sélection aléatoire d'un mouvement
            const randomIndex = Math.floor(Math.random() * mouvementsPossibles.length);
            const move = mouvementsPossibles[randomIndex];

            // Simulation du mouvement
            plateau.deplacerPiece(move);
            const score = this.lasVegasSearch(plateau, 0, plateau.joueurActuel);
            plateau.annulerDernierCoup();

            // Mise à jour du meilleur coup si nécessaire
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
                
                // Si on trouve un très bon coup, on peut s'arrêter plus tôt
                if (score > 900) {
                    break;
                }
            }

            attempts++;
        }

        return bestMove;
    }

    lasVegasSearch(plateau, currentDepth, joueurInitial) {
        this.nodesExplored++;

        // Protection contre la récursion trop profonde
        if (currentDepth >= this.maxRecursionDepth) {
            return this.evaluatePosition(plateau, joueurInitial);
        }

        // Conditions de terminaison
        if (plateau.estPartieTerminee()) {
            return this.evaluatePosition(plateau, joueurInitial);
        }

        const mouvementsPossibles = plateau.getMouvementsPossiblesPourJoueur(plateau.joueurActuel);
        
        if (mouvementsPossibles.length === 0) {
            return this.evaluatePosition(plateau, joueurInitial);
        }

        // Sélection aléatoire d'un seul mouvement à explorer
        const randomIndex = Math.floor(Math.random() * mouvementsPossibles.length);
        const selectedMove = mouvementsPossibles[randomIndex];

        plateau.deplacerPiece(selectedMove);
        const score = -this.lasVegasSearch(plateau, currentDepth + 1, joueurInitial);
        plateau.annulerDernierCoup();

        return score;
    }

    selectRandomMoves(moves, count) {
        const shuffled = [...moves];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    }

    evaluatePosition(plateau, joueurInitial) {
        const score = this.heuristicFn(plateau, joueurInitial);
        return plateau.joueurActuel === joueurInitial ? score : -score;
    }
}

module.exports = LasVegas;