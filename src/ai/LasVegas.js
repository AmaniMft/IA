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

function lasVegas(plateau, joueurMaximisant, iterations = 10) {
    const mouvements = [];

    // Récupérer tous les mouvements valides pour le joueur
    for (let ligne = 0; ligne < plateau.TAILLE_PLATEAU; ligne++) {
        for (let colonne = 0; colonne < plateau.TAILLE_PLATEAU; colonne++) {
            if (plateau.plateau[ligne][colonne] === (joueurMaximisant ? 1 : 2)) {
                const valides = plateau.getMouvementsValides(ligne, colonne);
                valides.forEach(m => mouvements.push([[ligne, colonne], m]));
            }
        }
    }

    let meilleurMouvement = null;
    let meilleureEvaluation = -Infinity;

    // Effectuer plusieurs itérations pour trouver le meilleur mouvement
    for (let i = 0; i < iterations; i++) {
        const mouvement = mouvements[Math.floor(Math.random() * mouvements.length)];
        const [depart, arrivee] = mouvement;

        // Crée une copie propre du plateau
        const copiePlateau = new Plateau();
        copiePlateau.plateau = plateau.plateau.map(row => [...row]);
        copiePlateau.deplacerPiece(depart, arrivee);

        // Évaluer le résultat
        const score = evaluation(copiePlateau);
        if (score > meilleureEvaluation) {
            meilleureEvaluation = score;
            meilleurMouvement = mouvement;
        }
    }

    return { mouvement: meilleurMouvement, evaluation: meilleureEvaluation };
}

module.exports = { lasVegas };
