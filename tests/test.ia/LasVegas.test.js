const Plateau = require('../../src/game/Plateau');
const { lasVegas } = require('../../src/ai/LasVegas');

describe('IA Las Vegas', () => {
    test('Las Vegas trouve un mouvement valide', () => {
        const plateau = new Plateau();
        const iterations = 20;

        const resultat = lasVegas(plateau, true, iterations);
        console.log(`Mouvement choisi : ${JSON.stringify(resultat.mouvement)}, Score : ${resultat.evaluation}`);

        expect(resultat.mouvement).toBeDefined();
        expect(typeof resultat.evaluation).toBe('number');
    });
});
