const CheckersPerformance = require('./checkers_performance');

async function runTests() {
    console.log('=== TESTS DE PERFORMANCE DES DAMES ===\n');
    const tester = new CheckersPerformance();
    
    try {
        // 1. Comparaison des heuristiques
        await tester.compareHeuristics(50);  // 50 parties pour chaque paire d'heuristiques
        
        // 2. Test de l'effet de la profondeur
        await tester.testDepthEffect(4, 20);  // Jusqu'à profondeur 4, 20 parties par profondeur
        
        // 3. Test de l'effet de la taille
        await tester.testGridSizes([6, 8, 10], 20);  // 20 parties par taille
        
        console.log('\nTous les tests sont terminés !');
    } catch (error) {
        console.error('Erreur pendant les tests:', error);
    }
}

runTests();
