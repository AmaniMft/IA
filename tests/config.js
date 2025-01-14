module.exports = {
    PERFORMANCE_TEST_CONFIG: {
        NUM_GAMES: 10,            // Réduit à 10 parties pour des tests rapides
        DEPTHS: [2, 3],          // Limité à 2 profondeurs
        BOARD_SIZES: [8],        // Une seule taille de plateau
        TIMEOUT_MS: 10000,       // Timeout réduit
        HEURISTICS: [
            'BASIC',
            'ADVANCED'
        ]
    }
};
