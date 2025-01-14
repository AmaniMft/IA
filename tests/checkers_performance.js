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
        this.memoryUsage = {
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
                    this.results.minmax[configKey] = 
                        await this.testMatch(minmax, alphaBeta, boardSize);
                    
                    // Test AlphaBeta vs MinMax
                    console.log('\nAlphaBeta vs MinMax :');
                    this.results.alphaBeta[configKey] = 
                        await this.testMatch(alphaBeta, minmax, boardSize);
                    
                    // Test LasVegas vs AlphaBeta
                    console.log('\nLasVegas vs AlphaBeta :');
                    this.results.lasVegas[configKey] = 
                        await this.testMatch(lasVegas, alphaBeta, boardSize);
                    
                    // Test MonteCarlo vs AlphaBeta
                    console.log('\nMonteCarlo vs AlphaBeta :');
                    this.results.monteCarlo[configKey] = 
                        await this.testMatch(monteCarlo, alphaBeta, boardSize);
                }
            }
        }
        
        this.printResults();
    }

    async testMatch(player1, player2, boardSize) {
        const results = {
            executionTime: 0,
            nodesExplored: 0,
            memoryUsed: 0,
            winRate: 0,
            totalGames: 0,
            pruningEfficiency: 0
        };

        const totalGames = config.PERFORMANCE_TEST_CONFIG.NUM_GAMES;
        console.log(`Début des ${totalGames} parties...`);
        
        const startMemoryBaseline = process.memoryUsage().heapUsed;
        
        for (let i = 0; i < totalGames; i++) {
            if (i % 100 === 0) {
                console.log(`Progression : ${i}/${totalGames} parties`);
            }
            
            const plateau = new Plateau();
            plateau.TAILLE_PLATEAU = boardSize;
            
            const startMemory = process.memoryUsage().heapUsed;
            const gameResults = await this.playGame(player1, player2, plateau);
            const endMemory = process.memoryUsage().heapUsed;
            
            results.executionTime += gameResults.executionTime;
            results.nodesExplored += gameResults.nodesExplored;
            results.memoryUsed += endMemory - startMemory;
            
            if (gameResults.winner === 1) {
                results.winRate++;
            }
            
            if (player1 instanceof AlphaBeta) {
                results.pruningEfficiency += gameResults.pruningEfficiency;
            }
            
            results.totalGames++;
        }

        const endMemoryBaseline = process.memoryUsage().heapUsed;
        results.baselineMemoryUsage = endMemoryBaseline - startMemoryBaseline;

        // Calcul des moyennes
        if (results.totalGames > 0) {
            results.executionTime /= results.totalGames;
            results.nodesExplored /= results.totalGames;
            results.memoryUsed /= results.totalGames;
            results.winRate = (results.winRate / results.totalGames) * 100;
            if (player1 instanceof AlphaBeta) {
                results.pruningEfficiency /= results.totalGames;
            }
        }

        return results;
    }

    async playGame(player1, player2, plateau) {
        const results = {
            executionTime: 0,
            nodesExplored: 0,
            pruningEfficiency: 0,
            winner: null
        };
        
        const startTime = Date.now();
        
        while (!plateau.estPartieTerminee()) {
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
            
            if (currentPlayer instanceof AlphaBeta) {
                results.pruningEfficiency = currentPlayer.getPruningEfficiency();
            }
            
            plateau.deplacerPiece(move);
        }
        
        results.winner = plateau.getGagnant();
        return results;
    }

    printResults() {
        console.log('\n=== RÉSULTATS DES TESTS ===\n');

        // 1. Comparaison des algorithmes
        console.log('1. COMPARAISON DES ALGORITHMES');
        console.log('==============================');
        
        for (const [config, minmaxResults] of Object.entries(this.results.minmax)) {
            const alphaBetaResults = this.results.alphaBeta[config];
            const lasVegasResults = this.results.lasVegas[config];
            const monteCarloResults = this.results.monteCarlo[config];
            
            console.log(`\nConfiguration: ${config}`);
            
            // Temps d'exécution
            console.log('\nTemps d\'exécution moyen:');
            console.log(`MinMax: ${minmaxResults.executionTime.toFixed(2)}ms`);
            console.log(`AlphaBeta: ${alphaBetaResults.executionTime.toFixed(2)}ms`);
            console.log(`LasVegas: ${lasVegasResults.executionTime.toFixed(2)}ms`);
            console.log(`MonteCarlo: ${monteCarloResults.executionTime.toFixed(2)}ms`);
            
            // Nœuds explorés
            console.log('\nNœuds explorés en moyenne:');
            console.log(`MinMax: ${minmaxResults.nodesExplored.toFixed(0)}`);
            console.log(`AlphaBeta: ${alphaBetaResults.nodesExplored.toFixed(0)}`);
            console.log(`LasVegas: ${lasVegasResults.nodesExplored.toFixed(0)}`);
            console.log(`MonteCarlo: ${monteCarloResults.nodesExplored.toFixed(0)}`);
            
            // Utilisation mémoire
            console.log('\nUtilisation mémoire moyenne:');
            console.log(`MinMax: ${(minmaxResults.memoryUsed / 1024 / 1024).toFixed(2)}MB`);
            console.log(`AlphaBeta: ${(alphaBetaResults.memoryUsed / 1024 / 1024).toFixed(2)}MB`);
            console.log(`LasVegas: ${(lasVegasResults.memoryUsed / 1024 / 1024).toFixed(2)}MB`);
            console.log(`MonteCarlo: ${(monteCarloResults.memoryUsed / 1024 / 1024).toFixed(2)}MB`);
            
            // Taux de victoire
            console.log('\nTaux de victoire:');
            console.log(`MinMax: ${minmaxResults.winRate.toFixed(1)}%`);
            console.log(`AlphaBeta: ${alphaBetaResults.winRate.toFixed(1)}%`);
            console.log(`LasVegas: ${lasVegasResults.winRate.toFixed(1)}%`);
            console.log(`MonteCarlo: ${monteCarloResults.winRate.toFixed(1)}%`);
            
            // Efficacité de l'élagage (AlphaBeta uniquement)
            if (alphaBetaResults.pruningEfficiency) {
                console.log(`\nEfficacité de l'élagage Alpha-Beta: ${alphaBetaResults.pruningEfficiency.toFixed(1)}%`);
            }
        }

        // 2. Impact de la profondeur
        this.printDepthImpact();

        // 3. Impact de la taille de la grille
        this.printGridSizeImpact();
    }

    printDepthImpact() {
        console.log('\n2. IMPACT DE LA PROFONDEUR');
        console.log('==========================');
        
        const depths = config.PERFORMANCE_TEST_CONFIG.DEPTHS;
        const baseDepth = depths[0];
        
        for (const size of config.PERFORMANCE_TEST_CONFIG.BOARD_SIZES) {
            console.log(`\nTaille du plateau: ${size}x${size}`);
            
            for (const heuristic of config.PERFORMANCE_TEST_CONFIG.HEURISTICS) {
                console.log(`\nHeuristique: ${heuristic}`);
                
                const baseConfig = `${size}x${size}_d${baseDepth}_${heuristic}`;
                const baseResults = {
                    minmax: this.results.minmax[baseConfig],
                    alphaBeta: this.results.alphaBeta[baseConfig],
                    lasVegas: this.results.lasVegas[baseConfig],
                    monteCarlo: this.results.monteCarlo[baseConfig]
                };
                
                for (let i = 1; i < depths.length; i++) {
                    const depth = depths[i];
                    const config = `${size}x${size}_d${depth}_${heuristic}`;
                    
                    console.log(`\nProfondeur ${depth} vs ${baseDepth}:`);
                    
                    for (const [algo, results] of Object.entries(this.results)) {
                        const currentResults = results[config];
                        const baseAlgoResults = baseResults[algo];
                        
                        const timeIncrease = currentResults.executionTime / baseAlgoResults.executionTime;
                        const nodeIncrease = currentResults.nodesExplored / baseAlgoResults.nodesExplored;
                        const memoryIncrease = currentResults.memoryUsed / baseAlgoResults.memoryUsed;
                        
                        console.log(`\n${algo}:`);
                        console.log(`Augmentation temps: ${timeIncrease.toFixed(2)}x`);
                        console.log(`Augmentation nœuds: ${nodeIncrease.toFixed(2)}x`);
                        console.log(`Augmentation mémoire: ${memoryIncrease.toFixed(2)}x`);
                        console.log(`Taux de victoire: ${currentResults.winRate.toFixed(1)}%`);
                    }
                }
            }
        }
    }

    printGridSizeImpact() {
        console.log('\n3. IMPACT DE LA TAILLE DE LA GRILLE');
        console.log('==================================');
        
        const sizes = config.PERFORMANCE_TEST_CONFIG.BOARD_SIZES;
        const baseSize = sizes[0];
        
        for (const depth of config.PERFORMANCE_TEST_CONFIG.DEPTHS) {
            console.log(`\nProfondeur: ${depth}`);
            
            for (const heuristic of config.PERFORMANCE_TEST_CONFIG.HEURISTICS) {
                console.log(`\nHeuristique: ${heuristic}`);
                
                const baseConfig = `${baseSize}x${baseSize}_d${depth}_${heuristic}`;
                const baseResults = {
                    minmax: this.results.minmax[baseConfig],
                    alphaBeta: this.results.alphaBeta[baseConfig],
                    lasVegas: this.results.lasVegas[baseConfig],
                    monteCarlo: this.results.monteCarlo[baseConfig]
                };
                
                for (let i = 1; i < sizes.length; i++) {
                    const size = sizes[i];
                    const config = `${size}x${size}_d${depth}_${heuristic}`;
                    
                    console.log(`\nTaille ${size}x${size} vs ${baseSize}x${baseSize}:`);
                    
                    for (const [algo, results] of Object.entries(this.results)) {
                        const currentResults = results[config];
                        const baseAlgoResults = baseResults[algo];
                        
                        const timeIncrease = currentResults.executionTime / baseAlgoResults.executionTime;
                        const nodeIncrease = currentResults.nodesExplored / baseAlgoResults.nodesExplored;
                        const memoryIncrease = currentResults.memoryUsed / baseAlgoResults.memoryUsed;
                        
                        console.log(`\n${algo}:`);
                        console.log(`Augmentation temps: ${timeIncrease.toFixed(2)}x`);
                        console.log(`Augmentation nœuds: ${nodeIncrease.toFixed(2)}x`);
                        console.log(`Augmentation mémoire: ${memoryIncrease.toFixed(2)}x`);
                        console.log(`Taux de victoire: ${currentResults.winRate.toFixed(1)}%`);
                    }
                }
            }
        }
    }

    async compareHeuristics() {
        console.log('\n=== Comparaison des Heuristiques ===');
        const results = {};
        
        for (const boardSize of config.PERFORMANCE_TEST_CONFIG.BOARD_SIZES) {
            for (const depth of config.PERFORMANCE_TEST_CONFIG.DEPTHS) {
                const basicHeuristic = Heuristics.getHeuristic('BASIC');
                const advancedHeuristic = Heuristics.getHeuristic('ADVANCED');
                
                const alphaBetaBasic = new AlphaBeta(depth, basicHeuristic);
                const alphaBetaAdvanced = new AlphaBeta(depth, advancedHeuristic);
                
                console.log(`\nTest sur plateau ${boardSize}x${boardSize}, profondeur ${depth}`);
                const result = await this.testMatch(alphaBetaBasic, alphaBetaAdvanced, boardSize);
                
                results[`${boardSize}x${boardSize}_d${depth}`] = {
                    basicWins: result.player1Wins,
                    advancedWins: result.player2Wins,
                    draws: result.draws,
                    avgTime: result.averageTime
                };
            }
        }
        return results;
    }

    async compareAlphaBetaGain() {
        console.log('\n=== Comparaison MinMax vs AlphaBeta (gain de l\'élagage) ===');
        const results = {};
        
        for (const boardSize of config.PERFORMANCE_TEST_CONFIG.BOARD_SIZES) {
            for (const depth of config.PERFORMANCE_TEST_CONFIG.DEPTHS) {
                const heuristic = Heuristics.getHeuristic('ADVANCED');
                
                const minmax = new MinMax(depth, heuristic);
                const alphaBeta = new AlphaBeta(depth, heuristic);
                
                console.log(`\nTest sur plateau ${boardSize}x${boardSize}, profondeur ${depth}`);
                const result = await this.testMatch(minmax, alphaBeta, boardSize);
                
                results[`${boardSize}x${boardSize}_d${depth}`] = {
                    nodesExploredMinMax: minmax.getNodesExplored(),
                    nodesExploredAlphaBeta: alphaBeta.getNodesExplored(),
                    pruningGain: ((minmax.getNodesExplored() - alphaBeta.getNodesExplored()) / minmax.getNodesExplored()) * 100,
                    timeGain: ((result.player1Time - result.player2Time) / result.player1Time) * 100
                };
            }
        }
        return results;
    }

    printDetailedResults() {
        console.log('\n=== Résultats Détaillés des Tests ===\n');
        
        // Effet de la profondeur
        console.log('1. Effet de la profondeur sur les performances :');
        for (const size of config.PERFORMANCE_TEST_CONFIG.BOARD_SIZES) {
            console.log(`\nTaille du plateau : ${size}x${size}`);
            for (const depth of config.PERFORMANCE_TEST_CONFIG.DEPTHS) {
                const key = `${size}x${size}_d${depth}_ADVANCED`;
                const result = this.results.alphaBeta[key];
                if (result) {
                    console.log(`  Profondeur ${depth}:`);
                    console.log(`    - Temps moyen: ${result.averageTime.toFixed(2)}ms`);
                    console.log(`    - Nœuds explorés: ${result.nodesExplored}`);
                }
            }
        }
        
        // Effet de la taille de la grille
        console.log('\n2. Effet de la taille de la grille :');
        for (const depth of config.PERFORMANCE_TEST_CONFIG.DEPTHS) {
            console.log(`\nProfondeur : ${depth}`);
            for (const size of config.PERFORMANCE_TEST_CONFIG.BOARD_SIZES) {
                const key = `${size}x${size}_d${depth}_ADVANCED`;
                const result = this.results.alphaBeta[key];
                if (result) {
                    console.log(`  Taille ${size}x${size}:`);
                    console.log(`    - Temps moyen: ${result.averageTime.toFixed(2)}ms`);
                    console.log(`    - Mémoire utilisée: ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
                }
            }
        }
    }
}

module.exports = CheckersPerformanceTester;
