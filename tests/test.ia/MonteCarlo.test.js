const Plateau = require('../../src/game/Plateau');
const { monteCarlo } = require('../../src/ai/MonteCarlo');

describe('IA Monte Carlo', () => {
    test('Monte Carlo trouve un mouvement valide', () => {
        const plateau = new Plateau();
        const simulations = 50;

        const resultat = monteCarlo(plateau, true, simulations);
        console.log(`Mouvement choisi : ${JSON.stringify(resultat.mouvement)}, Score : ${resultat.evaluation}`);

        expect(resultat.mouvement).toBeDefined();
        expect(typeof resultat.evaluation).toBe('number');
    });
});
