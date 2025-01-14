// main.js
const Plateau = require('../src/game/Plateau');
const JouerAleatoire = require('../src/game/JoeurAleatoire');

// Vérification des méthodes disponibles sur Plateau
const plateau = new Plateau();
console.log("Méthodes disponibles sur l'objet Plateau :", Object.keys(plateau));

// Fonction pour jouer un tour avec un joueur aléatoire
function jouerTour(plateau, joueur) {
    const mouvements = plateau.getMouvementsTous(joueur); // Vérifiez que cette méthode existe
    if (mouvements.length === 0) return null; // Aucun mouvement possible

    // Sélectionner un mouvement aléatoire
    const choix = Math.floor(Math.random() * mouvements.length);
    return mouvements[choix];
}

// Fonction principale : Joueur Aléatoire contre Joueur Aléatoire
function aleatoireVsAleatoire() {
    let tour = 1;
    let joueur = 1; // 1 pour Noir, 2 pour Blanc

    console.log("Début de la partie : Joueur Aléatoire contre Joueur Aléatoire !");
    plateau.afficherPlateau();

    while (true) {
        console.log(`\n=== Tour ${tour} : Joueur ${joueur === 1 ? 'Noirs' : 'Blancs'} ===`);
        const mouvement = jouerTour(plateau, joueur);

        if (mouvement) {
            plateau.deplacerPiece(mouvement[0], mouvement[1]);
            console.log(`Joueur ${joueur === 1 ? 'Noirs' : 'Blancs'} joue : de ${mouvement[0]} à ${mouvement[1]}`);
            plateau.afficherPlateau();
        } else {
            console.log(`Joueur ${joueur === 1 ? 'Noirs' : 'Blancs'} ne peut plus jouer. Joueur ${joueur === 2 ? 'Noirs' : 'Blancs'} gagne !`);
            break;
        }

        joueur = joueur === 1 ? 2 : 1; // Alterner les joueurs
        tour++;

        if (tour > 100) {
            console.log("Partie terminée : Limite de tours atteinte.");
            break;
        }
    }

    console.log("Fin de la partie.");
}

// Lancer le test
aleatoireVsAleatoire();
