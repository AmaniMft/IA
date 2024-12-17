const Plateau = require('../src/game/Plateau');
const { minimax } = require('../src/ai/MinMax');
const { alphaBeta } = require('../src/ai/AlphaBeta');

// Fonction pour jouer un tour avec un algorithme spécifique
function jouerTour(plateau, joueur, algo, profondeur) {
    const mouvements = [];
    for (let ligne = 0; ligne < plateau.TAILLE_PLATEAU; ligne++) {
        for (let colonne = 0; colonne < plateau.TAILLE_PLATEAU; colonne++) {
            if (plateau.plateau[ligne][colonne] === joueur) {
                const valides = plateau.getMouvementsValides(ligne, colonne);
                valides.forEach(m => mouvements.push([[ligne, colonne], m]));
            }
        }
    }

    if (mouvements.length === 0) return null; // Aucun mouvement possible

    let meilleurMouvement = null;

    // Sélectionne le meilleur mouvement selon l'algorithme
    if (algo === 'minimax') {
        let meilleurScore = joueur === 1 ? -Infinity : Infinity;

        for (let mouvement of mouvements) {
            const copiePlateau = plateau.copier();
            copiePlateau.deplacerPiece(mouvement[0], mouvement[1]);
            const score = minimax(copiePlateau, profondeur, joueur === 2);

            if (joueur === 1 && score > meilleurScore) {
                meilleurScore = score;
                meilleurMouvement = mouvement;
            } else if (joueur === 2 && score < meilleurScore) {
                meilleurScore = score;
                meilleurMouvement = mouvement;
            }
        }
    } else if (algo === 'alphabeta') {
        let meilleurScore = joueur === 1 ? -Infinity : Infinity;

        for (let mouvement of mouvements) {
            const copiePlateau = plateau.copier();
            copiePlateau.deplacerPiece(mouvement[0], mouvement[1]);
            const score = alphaBeta(copiePlateau, profondeur, -Infinity, Infinity, joueur === 2);

            if (joueur === 1 && score > meilleurScore) {
                meilleurScore = score;
                meilleurMouvement = mouvement;
            } else if (joueur === 2 && score < meilleurScore) {
                meilleurScore = score;
                meilleurMouvement = mouvement;
            }
        }
    }

    return meilleurMouvement;
}

// Fonction principale pour l'IA contre IA
function iaContreIa() {
    const plateau = new Plateau();
    let tour = 1;

    console.log("Début de la partie : IA contre IA !");
    plateau.afficherPlateau();

    while (true) {
        console.log(`\n=== Tour ${tour} : IA Noirs (Joueur 1) ===`);
        let mouvementNoirs = jouerTour(plateau, 1, 'minimax', 3);
        if (mouvementNoirs) {
            plateau.deplacerPiece(mouvementNoirs[0], mouvementNoirs[1]);
            console.log(`IA Noirs joue : de ${mouvementNoirs[0]} vers ${mouvementNoirs[1]}`);
            plateau.afficherPlateau();
        } else {
            console.log("IA Noirs ne peut plus jouer. IA Blancs gagne !");
            break;
        }

        console.log(`\n=== Tour ${tour} : IA Blancs (Joueur 2) ===`);
        let mouvementBlancs = jouerTour(plateau, 2, 'alphabeta', 3);
        if (mouvementBlancs) {
            plateau.deplacerPiece(mouvementBlancs[0], mouvementBlancs[1]);
            console.log(`IA Blancs joue : de ${mouvementBlancs[0]} vers ${mouvementBlancs[1]}`);
            plateau.afficherPlateau();
        } else {
            console.log("IA Blancs ne peut plus jouer. IA Noirs gagne !");
            break;
        }

        tour++;
        if (tour > 100) {
            console.log("Partie terminée : Limite de tours atteinte.");
            break;
        }
    }

    console.log("Fin de la partie.");
}

iaContreIa();
