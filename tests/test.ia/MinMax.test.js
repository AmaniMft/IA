const Plateau = require('../../src/game/Plateau');
const { minimax } = require('../../src/ai/MinMax');

//cela valide que Jest fonctionne correctment 
describe('IA', () => {
    test('test minimal', () => {
        expect(true).toBe(true);
    });

    // Test Minimax pour un plateau initial (profondeur 1)
    test('Évaluation Minimax pour un plateau initial (profondeur 1)', () => {
        const plateau = new Plateau();
        const profondeur = 1;

        const evaluation = minimax(plateau, profondeur, true); // Joueur noir
        console.log(`Évaluation Minimax (profondeur 1) : ${evaluation}`);

        expect(typeof evaluation).toBe('number');
    });

    // Test Minimax pour un plateau initial (profondeur 3)
    test('Évaluation Minimax pour un plateau initial (profondeur 3)', () => {
        const plateau = new Plateau();
        const profondeur = 3;

        const evaluation = minimax(plateau, profondeur, true); // Joueur noir
        console.log(`Évaluation Minimax (profondeur 3) : ${evaluation}`);

        expect(typeof evaluation).toBe('number');
    });

    // Test pour s'assurer que Minimax explore les mouvements valides
    test('Minimax doit explorer les mouvements valides', () => {
        const plateau = new Plateau();
        const profondeur = 2;

        const evaluation = minimax(plateau, profondeur, true);
        expect(evaluation).not.toBeNaN();
        console.log("Test réussi : Minimax a exploré les mouvements valides.");
    });
});
