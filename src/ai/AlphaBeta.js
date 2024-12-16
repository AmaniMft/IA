const Plateau = require('../game/Plateau');

function evaluation(plateau) {
    let noirs = 0, blancs = 0;
    for (let ligne of plateau.plateau) {
        for (let caseJeu of ligne) {
            if (caseJeu === 1) noirs++;
            else if (caseJeu === 2) blancs++;
        }
    }
    return noirs - blancs; // Différence entre les pions noirs et blancs
}

function alphaBeta(plateau, profondeur, alpha, beta, joueurMaximisant) {
    if (profondeur === 0) {
        return evaluation(plateau); // Retourne la valeur heuristique
    }

    const mouvements = [];
    for (let ligne = 0; ligne < plateau.TAILLE_PLATEAU; ligne++) {
        for (let colonne = 0; colonne < plateau.TAILLE_PLATEAU; colonne++) {
            if (plateau.plateau[ligne][colonne] === (joueurMaximisant ? 1 : 2)) {
                mouvements.push(...plateau.getMouvementsValides(ligne, colonne).map(m => [[ligne, colonne], m]));
            }
        }
    }

    if (joueurMaximisant) {
        let maxEval = -Infinity;
        for (let mouvement of mouvements) {
            const [depart, arrivee] = mouvement;
            const copiePlateau = new Plateau();
            copiePlateau.plateau = plateau.plateau.map(row => [...row]);
            copiePlateau.deplacerPiece(depart, arrivee);

            const score = alphaBeta(copiePlateau, profondeur - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, score);
            alpha = Math.max(alpha, score);

            if (beta <= alpha) {
                break; // Élagage
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let mouvement of mouvements) {
            const [depart, arrivee] = mouvement;
            const copiePlateau = new Plateau();
            copiePlateau.plateau = plateau.plateau.map(row => [...row]);
            copiePlateau.deplacerPiece(depart, arrivee);

            const score = alphaBeta(copiePlateau, profondeur - 1, alpha, beta, true);
            minEval = Math.min(minEval, score);
            beta = Math.min(beta, score);

            if (beta <= alpha) {
                break; // Élagage
            }
        }
        return minEval;
    }
}

module.exports = { alphaBeta };
