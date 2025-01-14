const config = require('./config');
const Plateau = require('../src/game/Plateau');
const MinMax = require('../src/ai/MinMax');
const AlphaBeta = require('../src/ai/AlphaBeta');
const LasVegas = require('../src/ai/LasVegas');
const MonteCarlo = require('../src/ai/MonteCarlo');
const Heuristics = require('../src/ai/heuristics');

class CheckersPerformanceTester {
    constructor() {
        this.results = {
            minmax: {},
            alphaBeta: {},
            lasVegas: {},
            monteCarlo: {}
        };
    }

    async runTests() {
        console.log('\n=== Tests de Performance du Jeu de Dames ===\n');
        
        // Test pour chaque taille de plateau
        for (const boardSize of config.PERFORMANCE_TEST_CONFIG.BOARD_SIZES) {
            console.log(`\n=== Tests sur plateau ${boardSize}x${boardSize} ===`);
            
            // Test pour chaque profondeur
            for (const depth of config.PERFORMANCE_TEST_CONFIG.DEPTHS) {
                console.log(`\n--- Tests avec profondeur ${depth} ---`);
                
                // Test pour chaque heuristique
                for (const heuristic of config.PERFORMANCE_TEST_CONFIG.HEURISTICS) {
                    console.log(`\nTest avec heuristique ${heuristic}`);
                    
                    const heuristicFn = Heuristics.getHeuristic(heuristic);
                    const minmax = new MinMax(depth, heuristicFn);
                    const alphaBeta = new AlphaBeta(depth, heuristicFn);
                    const lasVegas = new LasVegas(depth, heuristicFn);
                    const monteCarlo = new MonteCarlo(depth, heuristicFn);
                    
                    const configKey = `${boardSize}x${boardSize}_d${depth}_${heuristic}`;
                    
                    // Test MinMax vs AlphaBeta
                    console.log('\nMinMax vs AlphaBeta :');
                    this.results.minmax[configKey] = await this.testMatch(minmax, alphaBeta, boardSize);
                    
                    // Test AlphaBeta vs MinMax
                    console.log('\nAlphaBeta vs MinMax :');
                    this.results.alphaBeta[configKey] = await this.testMatch(alphaBeta, minmax, boardSize);
                    
                    // Test LasVegas vs AlphaBeta
                    console.log('\nLasVegas vs AlphaBeta :');
                    this.results.lasVegas[configKey] = await this.testMatch(lasVegas, alphaBeta, boardSize);
                    
                    // Test MonteCarlo vs AlphaBeta
                    console.log('\nMonteCarlo vs AlphaBeta :');
                    this.results.monteCarlo[configKey] = await this.testMatch(monteCarlo, alphaBeta, boardSize);
                }
            }
        }
        
        this.printResults();
    }

    async testMatch(player1, player2, boardSize) {
        console.log(`Test en cours: ${player1.constructor.name} vs ${player2.constructor.name}`);
        
        const results = {
            executionTime: 0,
            nodesExplored: 0,
            memoryUsed: 0,
            winRate: 0,
            totalGames: 0,
            draws: 0
        };

        const totalGames = config.PERFORMANCE_TEST_CONFIG.NUM_GAMES;
        console.log(`Début des ${totalGames} parties...`);
        
        const startMemoryBaseline = process.memoryUsage().heapUsed;
        
        for (let i = 0; i < totalGames; i++) {
            const plateau = new Plateau();
            plateau.TAILLE_PLATEAU = boardSize;
            
            const startTime = performance.now();
            const gameResult = await this.playGame(player1, player2, plateau);
            const endTime = performance.now();
            
            const gameTimeInMs = endTime - startTime;
            results.executionTime += gameTimeInMs;
            results.nodesExplored += gameResult.nodesExplored;
            
            if (gameResult.winner === 1) {
                results.winRate++;
            } else if (gameResult.winner === null) {
                results.draws++;
            }
            
            results.totalGames++;
            
            // Afficher la progression
            console.log(`Partie ${i + 1}/${totalGames} - ${gameTimeInMs.toFixed(2)}ms - ${
                gameResult.winner === 1 ? 'Victoire' : 
                gameResult.winner === 2 ? 'Défaite' : 
                'Match nul'}`);
        }

        results.memoryUsed = process.memoryUsage().heapUsed - startMemoryBaseline;

        // Calcul des moyennes
        if (results.totalGames > 0) {
            results.executionTime /= results.totalGames;
            results.nodesExplored = Math.floor(results.nodesExplored / results.totalGames);
            results.winRate = (results.winRate / results.totalGames) * 100;
        }

        // Afficher les résultats du match
        console.log('\nRésultats du match :');
        console.log(`Temps moyen par partie: ${results.executionTime.toFixed(2)}ms`);
        console.log(`Nœuds explorés en moyenne: ${results.nodesExplored}`);
        console.log(`Taux de victoire: ${results.winRate.toFixed(1)}%`);
        console.log(`Matchs nuls: ${results.draws}`);
        console.log(`Mémoire utilisée: ${(results.memoryUsed / 1024 / 1024).toFixed(2)}MB\n`);

        return results;
    }

    async playGame(player1, player2, plateau) {
        const results = {
            executionTime: 0,
            nodesExplored: 0,
            winner: null
        };
        
        const startTime = Date.now();
        let moveCount = 0;
        const maxMoves = 100; // Pour éviter les parties infinies
        
        while (!plateau.estPartieTerminee() && moveCount < maxMoves) {
            if (Date.now() - startTime > config.PERFORMANCE_TEST_CONFIG.TIMEOUT_MS) {
                break;
            }
            
            const currentPlayer = plateau.joueurActuel === 1 ? player1 : player2;
            
            const moveStartTime = performance.now();
            const move = currentPlayer.findBestMove(plateau);
            const moveEndTime = performance.now();
            
            if (!move) break;
            
            results.executionTime += moveEndTime - moveStartTime;
            results.nodesExplored += currentPlayer.getNodesExplored();
            
            plateau.deplacerPiece(move);
            moveCount++;
        }
        
        results.winner = plateau.getGagnant();
        return results;
    }

    printResults() {
        console.log('\n=== Résultats Finaux des Tests ===\n');

        // 1. Comparaison des algorithmes
        console.log('1. Comparaison des Algorithmes :');
        for (const [config, minmaxResult] of Object.entries(this.results.minmax)) {
            console.log(`\nConfiguration: ${config}`);
            
            const alphaBetaResult = this.results.alphaBeta[config];
            const lasVegasResult = this.results.lasVegas[config];
            const monteCarloResult = this.results.monteCarlo[config];
            
            if (minmaxResult && alphaBetaResult) {
                console.log('\nMinMax vs AlphaBeta :');
                console.log(`- MinMax: ${minmaxResult.winRate.toFixed(1)}% victoires, ${minmaxResult.executionTime.toFixed(2)}ms`);
                console.log(`- AlphaBeta: ${alphaBetaResult.winRate.toFixed(1)}% victoires, ${alphaBetaResult.executionTime.toFixed(2)}ms`);
                
                const timeGain = ((minmaxResult.executionTime - alphaBetaResult.executionTime) / minmaxResult.executionTime * 100).toFixed(1);
                const nodeGain = ((minmaxResult.nodesExplored - alphaBetaResult.nodesExplored) / minmaxResult.nodesExplored * 100).toFixed(1);
                
                console.log(`\nGains avec AlphaBeta :`);
                console.log(`- Temps: ${timeGain}%`);
                console.log(`- Nœuds: ${nodeGain}%`);
            }
            
            if (lasVegasResult) {
                console.log('\nLasVegas vs AlphaBeta :');
                console.log(`- LasVegas: ${lasVegasResult.winRate.toFixed(1)}% victoires, ${lasVegasResult.executionTime.toFixed(2)}ms`);
            }
            
            if (monteCarloResult) {
                console.log('\nMonteCarlo vs AlphaBeta :');
                console.log(`- MonteCarlo: ${monteCarloResult.winRate.toFixed(1)}% victoires, ${monteCarloResult.executionTime.toFixed(2)}ms`);
            }
        }

        // 2. Impact de la profondeur
        console.log('\n2. Impact de la Profondeur :');
        for (const size of config.PERFORMANCE_TEST_CONFIG.BOARD_SIZES) {
            console.log(`\nTaille du plateau : ${size}x${size}`);
            for (const depth of config.PERFORMANCE_TEST_CONFIG.DEPTHS) {
                const key = `${size}x${size}_d${depth}_ADVANCED`;
                const result = this.results.alphaBeta[key];
                if (result) {
                    console.log(`\nProfondeur ${depth}:`);
                    console.log(`- Temps moyen: ${result.executionTime.toFixed(2)}ms`);
                    console.log(`- Nœuds explorés: ${result.nodesExplored}`);
                    console.log(`- Taux de victoire: ${result.winRate.toFixed(1)}%`);
                }
            }
        }

        // 3. Impact de l'heuristique
        console.log('\n3. Impact de l\'Heuristique :');
        for (const size of config.PERFORMANCE_TEST_CONFIG.BOARD_SIZES) {
            for (const depth of config.PERFORMANCE_TEST_CONFIG.DEPTHS) {
                console.log(`\nPlateau ${size}x${size}, Profondeur ${depth}:`);
                
                const basicKey = `${size}x${size}_d${depth}_BASIC`;
                const advancedKey = `${size}x${size}_d${depth}_ADVANCED`;
                
                const basicResult = this.results.alphaBeta[basicKey];
                const advancedResult = this.results.alphaBeta[advancedKey];
                
                if (basicResult && advancedResult) {
                    console.log('Heuristique de Base :');
                    console.log(`- Victoires: ${basicResult.winRate.toFixed(1)}%`);
                    console.log(`- Temps: ${basicResult.executionTime.toFixed(2)}ms`);
                    
                    console.log('\nHeuristique Avancée :');
                    console.log(`- Victoires: ${advancedResult.winRate.toFixed(1)}%`);
                    console.log(`- Temps: ${advancedResult.executionTime.toFixed(2)}ms`);
                }
            }
        }
    }
}

module.exports = CheckersPerformanceTester;
