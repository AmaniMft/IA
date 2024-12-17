const { performance } = require('perf_hooks');
const Plateau = require('./game/Plateau');
const { lasVegas } = require('./ai/LasVegas');
const { alphaBeta } = require('./ai/AlphaBeta');

// Fonction pour jouer un mouvement avec un algorithme spécifique
function jouerIA(plateau, joueur, algo, profondeur = 3, simulations = 50) {
    const mouvements = plateau.getMouvementsTous(joueur);
    if (mouvements.length === 0) return null;

    let meilleurMouvement = mouvements[0];
    let meilleurScore = joueur === 1 ? -Infinity : Infinity;

    mouvements.forEach(mvt => {
        const copie = plateau.copier();
        copie.deplacerPiece(mvt[0], mvt[1]);
        let score = 0;

        if (algo === 'lasvegas') {
            score = lasVegas(copie, joueur === 1, simulations).score;
        } else if (algo === 'alphabeta') {
            score = alphaBeta(copie, profondeur, -Infinity, Infinity, joueur !== 1);
        }

        if ((joueur === 1 && score > meilleurScore) || (joueur === 2 && score < meilleurScore)) {
            meilleurScore = score;
            meilleurMouvement = mvt;
        }
    });

    return meilleurMouvement;
}

// Fonction pour faire jouer deux algorithmes entre eux
function testerMatch(ia1, ia2, repetitions = 1000, profondeur = 3) {
    let victoiresIA1 = 0;
    let victoiresIA2 = 0;
    let egalites = 0;
    let tempsTotal = 0;

    console.log(`\n--- Match entre ${ia1} et ${ia2} (${repetitions} parties) ---`);

    for (let i = 0; i < repetitions; i++) {
        const plateau = new Plateau();
        const debut = performance.now();

        for (let tour = 0; tour < 50; tour++) { // Limite de tours par partie
            const joueur = tour % 2 === 0 ? 1 : 2;
            const algo = joueur === 1 ? ia1 : ia2;
            const mouvement = jouerIA(plateau, joueur, algo, profondeur);
            if (!mouvement) break; // Partie terminée
            plateau.deplacerPiece(mouvement[0], mouvement[1]);
        }

        const fin = performance.now();
        tempsTotal += fin - debut;

        // Déterminer le vainqueur
        if (plateau.partieGagnee(1)) victoiresIA1++;
        else if (plateau.partieGagnee(2)) victoiresIA2++;
        else egalites++;

        if ((i + 1) % 100 === 0) {
            console.log(`  Progression : ${i + 1}/${repetitions} parties terminées...`);
        }
    }

    const tempsMoyen = tempsTotal / repetitions;

    console.log(`\n--- Résultats ---`);
    console.log(`Victoires de ${ia1} : ${victoiresIA1}`);
    console.log(`Victoires de ${ia2} : ${victoiresIA2}`);
    console.log(`Égalités : ${egalites}`);
    console.log(`Temps total : ${tempsTotal.toFixed(2)} ms`);
    console.log(`Temps moyen par partie : ${tempsMoyen.toFixed(2)} ms`);
}

// Lancer un match entre Las Vegas et Alpha-Bêta
function lancerMatch() {
    const repetitions = 1000;
    const profondeur = 3;

    testerMatch('lasvegas', 'alphabeta', repetitions, profondeur);
}

lancerMatch();
