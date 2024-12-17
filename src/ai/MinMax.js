
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


function minimax(plateau, profondeur, joueurMaximisant) {
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
            const score = minimax(copiePlateau, profondeur - 1, false);
            maxEval = Math.max(maxEval, score);

        }
        return maxEval;

    } else {
            let minEval = Infinity;
            for (let mouvement of mouvements) {
                const [depart, arrivee] = mouvement;
        
                // Crée une copie propre de l'objet Plateau
                const copiePlateau = new Plateau();
                copiePlateau.plateau = plateau.plateau.map(row => [...row]); // Copie profonde du tableau
        
                // Effectue le mouvement sur la copie
                copiePlateau.deplacerPiece(depart, arrivee);
        
                // Appelle minimax récursivement
                const score = minimax(copiePlateau, profondeur - 1, true);
                minEval = Math.min(minEval, score);
            }
            return minEval;
        
        }
}

module.exports = { minimax };
