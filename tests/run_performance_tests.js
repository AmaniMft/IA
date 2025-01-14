const CheckersPerformance = require('./checkers_performance');

async function runTests() {
    console.log('=== TESTS DE PERFORMANCE DES DAMES (1000 parties) ===\n');
    const tester = new CheckersPerformance();
    
    try {
        // 1. Comparaison des heuristiques (1000 parties pour chaque paire)
        console.log('Test des heuristiques (1000 parties par paire)...');
        await tester.compareHeuristics(1000);
        
        // 2. Test de l'effet de la profondeur (200 parties par profondeur)
        console.log('\nTest de l\'effet de la profondeur (200 parties par profondeur)...');
        await tester.testDepthEffect(4, 200);
        
        // 3. Test de l'effet de la taille (100 parties par taille)
        console.log('\nTest de l\'effet de la taille (100 parties par taille)...');
        await tester.testGridSizes([6, 8, 10], 100);
        
        console.log('\nTous les tests sont terminés !');
    } catch (error) {
        console.error('Erreur pendant les tests:', error);
    }
}

runTests();
