module.exports = {
    // Configuration des tests de performance
    PERFORMANCE_TEST_CONFIG: {
        NUM_GAMES: 100,            // Nombre de parties à jouer
        DEPTHS: [2, 3, 4],         // Différentes profondeurs à tester
        BOARD_SIZES: [6, 8],       // Tailles de plateau (6x6 et 8x8)
        TIMEOUT_MS: 30000          // Timeout pour chaque partie (30 secondes)
    },
    
    // Configuration des métriques à collecter
    METRICS: {
        EXECUTION_TIME: true,      // Temps d'exécution
        MEMORY_USAGE: true,        // Utilisation de la mémoire
        NODES_EXPLORED: true,      // Nombre de nœuds explorés
        WIN_RATE: true,            // Taux de victoire
        DRAW_RATE: true,           // Taux de match nul
        MOVES_PER_GAME: true,      // Nombre moyen de coups par partie
        PIECES_CAPTURED: true      // Nombre moyen de pièces capturées
    }
};
