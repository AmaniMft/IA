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


function jouerPartieAleatoire(plateau, joueurMaximisant) {
    const copiePlateau = new Plateau();
    copiePlateau.plateau = plateau.plateau.map(row => [...row]);
    let joueur = joueurMaximisant ? 1 : 2;

    for (let i = 0; i < 50; i++) { // Limite de 50 coups pour éviter des parties infinies
        const mouvements = [];
        for (let ligne = 0; ligne < copiePlateau.TAILLE_PLATEAU; ligne++) {
            for (let colonne = 0; colonne < copiePlateau.TAILLE_PLATEAU; colonne++) {
                if (copiePlateau.plateau[ligne][colonne] === joueur) {
                    const valides = copiePlateau.getMouvementsValides(ligne, colonne);
                    valides.forEach(m => mouvements.push([[ligne, colonne], m]));
                }
            }
        }

        if (mouvements.length === 0) break; // Si aucun mouvement n'est possible, la partie s'arrête

        const mouvement = mouvements[Math.floor(Math.random() * mouvements.length)];
        const [depart, arrivee] = mouvement;
        copiePlateau.deplacerPiece(depart, arrivee);

        joueur = joueur === 1 ? 2 : 1; // Changement de joueur
    }

    return evaluation(copiePlateau);
}

function monteCarlo(plateau, joueurMaximisant, simulations = 100) {
    const mouvements = [];

    // Récupérer les mouvements valides
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

    // Simuler chaque mouvement plusieurs fois
    for (const mouvement of mouvements) {
        let sommeEvaluation = 0;

        for (let i = 0; i < simulations; i++) {
            const copiePlateau = new Plateau();
            copiePlateau.plateau = plateau.plateau.map(row => [...row]);
            const [depart, arrivee] = mouvement;
            copiePlateau.deplacerPiece(depart, arrivee);

            sommeEvaluation += jouerPartieAleatoire(copiePlateau, !joueurMaximisant);
        }

        const moyenneEvaluation = sommeEvaluation / simulations;
        if (moyenneEvaluation > meilleureEvaluation) {
            meilleureEvaluation = moyenneEvaluation;
            meilleurMouvement = mouvement;
        }
    }

    return { mouvement: meilleurMouvement, evaluation: meilleureEvaluation };
}

module.exports = { monteCarlo };
