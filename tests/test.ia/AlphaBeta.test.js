const Plateau = require('../../src/game/Plateau');
const { alphaBeta } = require('../../src/ai/AlphaBeta');

describe('IA Alpha-Beta', () => {
    test('Évaluation Alpha-Bêta pour un plateau initial (profondeur 1)', () => {
        const plateau = new Plateau();
        const profondeur = 1;

        const evaluation = alphaBeta(plateau, profondeur, -Infinity, Infinity, true);
        console.log(`Évaluation Alpha-Bêta (profondeur 1) : ${evaluation}`);

        expect(typeof evaluation).toBe('number');
    });

    test('Évaluation Alpha-Bêta pour un plateau initial (profondeur 3)', () => {
        const plateau = new Plateau();
        const profondeur = 3;

        const evaluation = alphaBeta(plateau, profondeur, -Infinity, Infinity, true);
        console.log(`Évaluation Alpha-Bêta (profondeur 3) : ${evaluation}`);

        expect(typeof evaluation).toBe('number');
    });
});
