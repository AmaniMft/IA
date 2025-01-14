const CheckersPerformance = require('./checkers_performance');

async function runTests() {
    console.log('Démarrage des tests de performance...\n');
    
    const tester = new CheckersPerformance();
    
    try {
        await tester.runAllTests();
    } catch (error) {
        console.error('Erreur pendant les tests:', error);
        process.exit(1);
    }
}

runTests();
