module.exports = {
    PERFORMANCE_TEST_CONFIG: {
        NUM_GAMES: 1000,          // Augmenté à 1000 parties comme demandé
        DEPTHS: [2, 3, 4, 5],     // Plus de profondeurs pour mieux analyser l'impact
        BOARD_SIZES: [6, 8, 10],  // Différentes tailles pour analyser l'impact
        TIMEOUT_MS: 60000,        // Augmenté pour gérer plus de parties
        HEURISTICS: [
            'BASIC',
            'ADVANCED'
        ]
    }
};
