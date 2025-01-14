// tester_performance.js
const { performance } = require('perf_hooks');
const Plateau = require('../game/Plateau');
const { minimax } = require('../ai/MinMax');
const { monteCarlo } = require('../ai/MonteCarlo');

// Fonction pour jouer un tour avec un algorithme spécifique
function jouerIA(plateau, joueur, algo, profondeur = 3, simulations = 100) {
    const mouvements = plateau.getMouvementsTous(joueur); // Obtenir les mouvements valides
    if (mouvements.length === 0) return null;

    let mouvementChoisi = mouvements[0]; // Par défaut
    if (algo === 'minimax') {
        let meilleurScore = joueur === 1 ? -Infinity : Infinity;
        for (let mvt of mouvements) {
            const copie = plateau.copier();
            copie.deplacerPiece(mvt[0], mvt[1]);
            const score = minimax(copie, profondeur, joueur === 1);
            if ((joueur === 1 && score > meilleurScore) || (joueur === 2 && score < meilleurScore)) {
                meilleurScore = score;
                mouvementChoisi = mvt;
            }
        }
    } else if (algo === 'montecarlo') {
        const result = monteCarlo(plateau, joueur === 1, simulations);
        mouvementChoisi = result.mouvement;
    }
    return mouvementChoisi;
}

// Fonction pour une partie entre Minimax et Monte Carlo
function jouerPartie(profondeur = 3, simulations = 100) {
    const plateau = new Plateau();
    let joueur = 1;
    let tours = 0;

    while (true) {
        const mouvements = plateau.getMouvementsTous(joueur);
        if (mouvements.length === 0) {
            return joueur === 1 ? 'Monte Carlo' : 'Minimax'; 
            
        }

        const algo = joueur === 1 ? 'minimax' : 'montecarlo';
        const mouvement = jouerIA(plateau, joueur, algo, profondeur, simulations);

        if (mouvement) plateau.deplacerPiece(mouvement[0], mouvement[1]);

        joueur = joueur === 1 ? 2 : 1; // Changement de joueur
        tours++;
        if (tours > 200) return 'Egalité'; // Pour éviter des parties infinies
    }
}

// Fonction principale pour les tests
function testerPerformances(nbParties = 1000, profondeur = 3, simulations = 100) {
    let victoiresMinimax = 0;
    let victoiresMonteCarlo = 0;
    let egalites = 0;
    let tempsTotal = 0;

    console.log(`\n--- Test : Minimax vs Monte Carlo sur ${nbParties} parties ---\n`);

    for (let i = 0; i < nbParties; i++) {
        const debut = performance.now();
        const resultat = jouerPartie(profondeur, simulations);
        const fin = performance.now();

        tempsTotal += (fin - debut);

        if (resultat === 'Minimax') victoiresMinimax++;
        else if (resultat === 'Monte Carlo') victoiresMonteCarlo++;
        else egalites++;

        if ((i + 1) % 100 === 0) {
            console.log(`  Progression : ${i + 1}/${nbParties} parties jouées...`);
        }
    }

    console.log(`\n--- Résultats ---`);
    console.log(`Victoires Minimax      : ${victoiresMinimax}`);
    console.log(`Victoires Monte Carlo  : ${victoiresMonteCarlo}`);
    console.log(`Égalités               : ${egalites}`);
    console.log(`Temps total            : ${(tempsTotal / 1000).toFixed(2)} secondes`);
    console.log(`Temps moyen/partie     : ${(tempsTotal / nbParties).toFixed(2)} ms`);
}

// Exécution des tests
testerPerformances(1000, 3, 100);
