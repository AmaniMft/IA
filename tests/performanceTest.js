const config = require('./config');
const GameState = require('../src/game/GameState');
const MinMax = require('../src/ai/MinMax');
const AlphaBeta = require('../src/ai/AlphaBeta');

class PerformanceTester {
    constructor() {
        this.results = {
            minmax: {},
            alphaBeta: {}
        };
    }

    async runTests() {
        console.log('Starting Performance Tests for Checkers Game...');
        
        // Test pour chaque taille de plateau
        for (const size of config.PERFORMANCE_TEST_CONFIG.BOARD_SIZES) {
            // Test pour chaque profondeur
            for (const depth of config.PERFORMANCE_TEST_CONFIG.DEPTHS) {
                console.log(`Testing board size ${size}x${size} at depth ${depth}`);
                
                // Test MinMax vs AlphaBeta
                const minmax = new MinMax(depth);
                const alphaBeta = new AlphaBeta(depth);
                
                // MinMax joue en premier
                this.results.minmax[`${size}x${size}_d${depth}`] = 
                    await this.testMatch(minmax, alphaBeta, size);
                
                // AlphaBeta joue en premier
                this.results.alphaBeta[`${size}x${size}_d${depth}`] = 
                    await this.testMatch(alphaBeta, minmax, size);
            }
        }
        
        this.printResults();
    }

    async testMatch(player1, player2, boardSize) {
        const results = {
            avgExecutionTime: 0,
            avgMemoryUsage: 0,
            avgNodesExplored: 0,
            winRate: 0,
            drawRate: 0,
            avgMovesPerGame: 0,
            avgPiecesCaptured: 0
        };

        const totalGames = config.PERFORMANCE_TEST_CONFIG.NUM_GAMES;
        
        for (let i = 0; i < totalGames; i++) {
            if (i % 10 === 0) {
                console.log(`Playing game ${i + 1}/${totalGames}`);
            }

            const gameState = new GameState(boardSize);
            const gameResults = await this.playGame(player1, player2, gameState);
            
            // Accumulate results
            results.avgExecutionTime += gameResults.executionTime;
            results.avgMemoryUsage += gameResults.memoryUsage;
            results.avgNodesExplored += gameResults.nodesExplored;
            results.avgMovesPerGame += gameResults.movesCount;
            results.avgPiecesCaptured += gameResults.piecesCaptured;
            
            if (gameResults.winner === 1) results.winRate++;
            if (gameResults.winner === 0) results.drawRate++;
            
            // Reset AI stats for next game
            player1.resetStats();
            player2.resetStats();
        }

        // Calculate averages
        for (let key in results) {
            if (key !== 'winRate' && key !== 'drawRate') {
                results[key] /= totalGames;
            }
        }
        
        results.winRate = (results.winRate / totalGames) * 100;
        results.drawRate = (results.drawRate / totalGames) * 100;

        return results;
    }

    async playGame(player1, player2, gameState) {
        const results = {
            executionTime: 0,
            memoryUsage: 0,
            nodesExplored: 0,
            movesCount: 0,
            piecesCaptured: 0,
            winner: null
        };

        const startPieces = this.countPieces(gameState);
        
        while (!gameState.isGameOver()) {
            const currentPlayer = gameState.currentPlayer === 1 ? player1 : player2;
            const move = currentPlayer.findBestMove(gameState);
            const stats = currentPlayer.getStats();
            
            results.executionTime += stats.executionTime;
            results.memoryUsage += stats.memoryUsage;
            results.nodesExplored += stats.nodesExplored;
            results.movesCount++;
            
            if (move.captures) {
                results.piecesCaptured += move.captures.length;
            }
            
            gameState.makeMove(move);
        }

        results.winner = gameState.getWinner();
        return results;
    }

    countPieces(gameState) {
        let count = 0;
        for (let row = 0; row < gameState.size; row++) {
            for (let col = 0; col < gameState.size; col++) {
                if (gameState.board[row][col] !== 0) count++;
            }
        }
        return count;
    }

    printResults() {
        console.log('\nTest Results for Checkers Game:');
        console.log('==============================');
        
        for (const [algorithm, results] of Object.entries(this.results)) {
            console.log(`\n${algorithm.toUpperCase()} Results:`);
            
            for (const [config, metrics] of Object.entries(results)) {
                console.log(`\nConfiguration: ${config}`);
                console.log(`Average Execution Time: ${metrics.avgExecutionTime.toFixed(2)}ms`);
                console.log(`Average Memory Usage: ${(metrics.avgMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
                console.log(`Average Nodes Explored: ${metrics.avgNodesExplored.toFixed(0)}`);
                console.log(`Win Rate: ${metrics.winRate.toFixed(2)}%`);
                console.log(`Draw Rate: ${metrics.drawRate.toFixed(2)}%`);
                console.log(`Average Moves per Game: ${metrics.avgMovesPerGame.toFixed(1)}`);
                console.log(`Average Pieces Captured: ${metrics.avgPiecesCaptured.toFixed(1)}`);
            }
        }
    }
}

// Export the tester
module.exports = PerformanceTester;
