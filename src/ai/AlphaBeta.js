const Plateau = require('../game/Plateau');

function evaluation(plateau) {
    let noirs = 0, blancs = 0;
    for (let ligne = 0; ligne < plateau.TAILLE_PLATEAU; ligne++) {
        for (let colonne = 0; colonne < plateau.TAILLE_PLATEAU; colonne++) {
            const caseJeu = plateau.plateau[ligne][colonne];
            if (caseJeu === 1) {
                // Pion noir - ajoute un score en fonction de la position
                noirs += 1 + (ligne / plateau.TAILLE_PLATEAU); // Bonus pour les pions avancés
            } else if (caseJeu === 2) {
                // Pion blanc - ajoute un score en fonction de la position
                blancs += 1 + ((plateau.TAILLE_PLATEAU - 1 - ligne) / plateau.TAILLE_PLATEAU);
            }
        }
    }
    return noirs - blancs; // Plus le score est élevé, plus les noirs dominent
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
