const { performance } = require('perf_hooks');
const Plateau = require('../game/Plateau'); 
const { lasVegas } = require('../ai/LasVegas');
const { monteCarlo } = require('../ai/MonteCarlo'); 

// Fonction pour jouer un tour avec un algorithme
function jouerIA(plateau, joueur, algo) {
    const mouvements = plateau.getMouvementsTous(joueur); // Obtenir tous les mouvements valides
    if (mouvements.length === 0) return null;

    if (algo === 'lasvegas') {
        const randomIndex = Math.floor(Math.random() * mouvements.length);
        return mouvements[randomIndex];
    } else if (algo === 'montecarlo') {
        return monteCarlo(plateau, joueur, 50); // Exemple : simulation de 50 parties pour Monte Carlo
    }
}

// Fonction pour jouer une partie entre Las Vegas et Monte Carlo
function jouerPartie() {
    const plateau = new Plateau();
    let joueur = 1;
    let tours = 0;

    while (true) {
        const mouvements = plateau.getMouvementsTous(joueur);
        if (mouvements.length === 0) {
            return joueur === 1 ? 'Monte Carlo' : 'Las Vegas'; // Le joueur bloqué perd
        }

        const algo = joueur === 1 ? 'lasvegas' : 'montecarlo';
        const mouvement = jouerIA(plateau, joueur, algo);

        if (mouvement) plateau.deplacerPiece(mouvement[0], mouvement[1]);

        joueur = joueur === 1 ? 2 : 1; // Changement de joueur
        tours++;

        if (tours > 200) return 'Egalité'; // Évite les parties infinies
    }
}

// Fonction principale pour les tests de performance
function testerPerformances(nbParties = 1000) {
    let victoiresLasVegas = 0;
    let victoiresMonteCarlo = 0;
    let egalites = 0;
    let tempsTotal = 0;

    console.log(`\n--- Test : Las Vegas vs Monte Carlo sur ${nbParties} parties ---\n`);

    for (let i = 0; i < nbParties; i++) {
        const debut = performance.now();
        const resultat = jouerPartie();
        const fin = performance.now();

        tempsTotal += (fin - debut);

        if (resultat === 'Las Vegas') victoiresLasVegas++;
        else if (resultat === 'Monte Carlo') victoiresMonteCarlo++;
        else egalites++;

        if ((i + 1) % 100 === 0) {
            console.log(`  Progression : ${i + 1}/${nbParties} parties jouées...`);
        }
    }

    console.log(`\n--- Résultats ---`);
    console.log(`Victoires Las Vegas  : ${victoiresLasVegas}`);
    console.log(`Victoires Monte Carlo: ${victoiresMonteCarlo}`);
    console.log(`Égalités             : ${egalites}`);
    console.log(`Temps total          : ${(tempsTotal / 1000).toFixed(2)} secondes`);
    console.log(`Temps moyen/partie   : ${(tempsTotal / nbParties).toFixed(2)} ms`);
}

// Exécution des tests
testerPerformances(1000);
