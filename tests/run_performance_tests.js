const CheckersPerformanceTester = require('./checkers_performance');

async function runTests() {
    console.log('=== Démarrage des Tests de Performance du Jeu de Dames ===\n');
    const tester = new CheckersPerformanceTester();
    
    try {
        // Tests standards
        await tester.runTests();
        
        // Comparaison spécifique des heuristiques
        console.log('\n=== Comparaison des Heuristiques ===');
        const heuristicResults = await tester.compareHeuristics();
        
        // Comparaison du gain de l'élagage alpha-beta
        console.log('\n=== Analyse du Gain de l\'Élagage Alpha-Beta ===');
        const alphaBetaResults = await tester.compareAlphaBetaGain();
        
        // Affichage des résultats détaillés
        tester.printDetailedResults();
        
        console.log('\n=== Tests de Performance Terminés ===');
    } catch (error) {
        console.error('Erreur pendant les tests:', error);
    }
}

runTests().catch(console.error);
