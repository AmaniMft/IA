const MinMax = require('../src/ai/MinMax');
const AlphaBeta = require('../src/ai/AlphaBeta');
const Plateau = require('../src/game/Plateau');
const Heuristics = require('../src/ai/heuristics');
const { TEST_CONFIG } = require('./config');

class CheckersPerformance {
    constructor() {
        this.results = {
            heuristicTests: [],
            depthTests: [],
            algorithmTests: [],
            gridSizeTests: []
        };
    }

    async runAllTests() {
        console.log("=== TESTS DE PERFORMANCE DES DAMES ===\n");

        await this.compareHeuristics();
        await this.testDepthEffect();
        await this.compareAlgorithms();
        await this.testGridSizes();

        this.generateFinalReport();
    }

    async compareHeuristics() {
        console.log("1. COMPARAISON DES HEURISTIQUES");
        const heuristics = [
            { name: "basic", function: "basic" },
            { name: "position", function: "position" }
        ];

        for (const heuristic of heuristics) {
            console.log(`\nTest heuristique: ${heuristic.name}`);
            const results = await this.playGames({
                heuristic: heuristic.function,
                depth: TEST_CONFIG.DEFAULT_DEPTH,
                algorithm: 'alphaBeta',
                games: TEST_CONFIG.GAMES_PER_TEST,
                batchSize: TEST_CONFIG.BATCH_SIZE
            });
            
            this.results.heuristicTests.push({
                heuristic: heuristic.name,
                ...results
            });
        }
    }

    async testDepthEffect() {
        console.log("\n2. EFFET DE LA PROFONDEUR");
        const depths = [2, 3, 4, 5];

        for (const depth of depths) {
            console.log(`\nTest profondeur: ${depth}`);
            const results = await this.playGames({
                heuristic: "position",
                depth: depth,
                algorithm: 'alphaBeta',
                games: TEST_CONFIG.GAMES_PER_TEST,
                batchSize: TEST_CONFIG.BATCH_SIZE
            });

            this.results.depthTests.push({
                depth: depth,
                ...results
            });
        }
    }

    async compareAlgorithms() {
        console.log("\n3. MINMAX VS ALPHA-BETA");
        const algorithms = ['minmax', 'alphaBeta'];

        for (const algo of algorithms) {
            console.log(`\nTest algorithme: ${algo}`);
            const results = await this.playGames({
                heuristic: "position",
                depth: TEST_CONFIG.DEFAULT_DEPTH,
                algorithm: algo,
                games: TEST_CONFIG.GAMES_PER_TEST,
                batchSize: TEST_CONFIG.BATCH_SIZE
            });

            this.results.algorithmTests.push({
                algorithm: algo,
                ...results
            });
        }
    }

    async testGridSizes() {
        console.log("\n4. IMPACT TAILLE DU PLATEAU");
        const sizes = [6, 8, 10];

        for (const size of sizes) {
            console.log(`\nTest taille: ${size}x${size}`);
            const results = await this.playGames({
                heuristic: "position",
                depth: TEST_CONFIG.DEFAULT_DEPTH,
                algorithm: 'alphaBeta',
                gridSize: size,
                games: TEST_CONFIG.GAMES_PER_TEST,
                batchSize: TEST_CONFIG.BATCH_SIZE
            });

            this.results.gridSizeTests.push({
                size: size,
                ...results
            });
        }
    }

    async playGames(config) {
        let totalWins = 0;
        let totalTime = 0;
        let totalMemory = 0;
        let totalNodes = 0;
        
        const batches = Math.ceil(config.games / config.batchSize);

        for (let batch = 0; batch < batches; batch++) {
            console.log(`  Lot ${batch + 1}/${batches}`);
            
            const startMemory = process.memoryUsage().heapUsed;
            const startTime = performance.now();

            for (let game = 0; game < config.batchSize; game++) {
                const gameResult = await this.playSingleGame(config);
                totalWins += gameResult.winner === 1 ? 1 : 0;
                totalNodes += gameResult.nodesExplored;
            }

            totalTime += performance.now() - startTime;
            totalMemory += process.memoryUsage().heapUsed - startMemory;
        }

        return {
            wins: totalWins,
            winRate: (totalWins / config.games) * 100,
            avgTime: totalTime / config.games,
            avgMemory: totalMemory / config.games,
            avgNodes: totalNodes / config.games
        };
    }

    createPlayer(config) {
        const AIClass = config.algorithm === 'minmax' ? MinMax : AlphaBeta;
        return new AIClass(config.depth, Heuristics[config.heuristic]);
    }

    async playSingleGame(config) {
        const player1 = this.createPlayer(config);
        const player2 = this.createPlayer({...config, algorithm: 'alphaBeta'});
        const plateau = new Plateau(config.gridSize || TEST_CONFIG.DEFAULT_BOARD_SIZE);

        let moves = 0;
        let nodesExplored = 0;
        
        while (!plateau.estPartieTerminee() && moves < 200) {
            const currentPlayer = plateau.joueurActuel === 1 ? player1 : player2;
            const move = await currentPlayer.findBestMove(plateau);
            
            if (!move) break;
            
            nodesExplored += currentPlayer.getNodesExplored();
            plateau.deplacerPiece(move);
            moves++;
        }

        return {
            winner: plateau.getGagnant(),
            nodesExplored
        };
    }

    generateFinalReport() {
        console.log("\n=== RAPPORT FINAL ===");

        // 1. Rapport heuristiques
        console.log("\n1. Comparaison des heuristiques:");
        this.results.heuristicTests.forEach(result => {
            console.log(`\n${result.heuristic}:`);
            console.log(`- Taux de victoire: ${result.winRate.toFixed(1)}%`);
            console.log(`- Temps moyen: ${result.avgTime.toFixed(2)}ms`);
            console.log(`- Nœuds explorés: ${Math.round(result.avgNodes)}`);
            console.log(`- Mémoire moyenne: ${(result.avgMemory/1024/1024).toFixed(2)}MB`);
        });

        // 2. Rapport profondeurs
        console.log("\n2. Impact de la profondeur:");
        this.results.depthTests.forEach(result => {
            console.log(`\nProfondeur ${result.depth}:`);
            console.log(`- Taux de victoire: ${result.winRate.toFixed(1)}%`);
            console.log(`- Temps moyen: ${result.avgTime.toFixed(2)}ms`);
            console.log(`- Nœuds explorés: ${Math.round(result.avgNodes)}`);
            console.log(`- Mémoire moyenne: ${(result.avgMemory/1024/1024).toFixed(2)}MB`);
        });

        // 3. Rapport algorithmes
        console.log("\n3. MinMax vs Alpha-Beta:");
        const [minmax, alphaBeta] = this.results.algorithmTests;
        const speedup = (minmax.avgTime - alphaBeta.avgTime) / minmax.avgTime * 100;
        console.log(`Gain en temps avec Alpha-Beta: ${speedup.toFixed(1)}%`);
        console.log(`Réduction des nœuds: ${((1 - alphaBeta.avgNodes/minmax.avgNodes)*100).toFixed(1)}%`);
        console.log(`Différence mémoire: ${((alphaBeta.avgMemory - minmax.avgMemory)/1024/1024).toFixed(2)}MB`);

        // 4. Rapport tailles
        console.log("\n4. Impact de la taille du plateau:");
        this.results.gridSizeTests.forEach(result => {
            console.log(`\nTaille ${result.size}x${result.size}:`);
            console.log(`- Temps moyen: ${result.avgTime.toFixed(2)}ms`);
            console.log(`- Mémoire moyenne: ${(result.avgMemory/1024/1024).toFixed(2)}MB`);
            console.log(`- Nœuds explorés: ${Math.round(result.avgNodes)}`);
        });
    }
}

module.exports = CheckersPerformance;
