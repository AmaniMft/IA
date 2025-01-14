const MinMax = require('../src/ai/MinMax');
const AlphaBeta = require('../src/ai/AlphaBeta');
const Plateau = require('../src/game/Plateau');
const Heuristics = require('../src/ai/heuristics');

class CheckersPerformance {
    async playGame(player1, player2, size = 8) {
        const plateau = new Plateau();
        plateau.TAILLE_PLATEAU = size;
        
        let moves = 0;
        let startMemory = process.memoryUsage().heapUsed;
        let stats = {
            player1: { time: 0, nodes: 0, prunedNodes: 0 },
            player2: { time: 0, nodes: 0, prunedNodes: 0 }
        };

        while (!plateau.estPartieTerminee() && moves < 100) {
            const currentPlayer = plateau.joueurActuel === 1 ? player1 : player2;
            const statsKey = plateau.joueurActuel === 1 ? 'player1' : 'player2';
            
            const startTime = performance.now();
            const move = await currentPlayer.findBestMove(plateau);
            stats[statsKey].time += performance.now() - startTime;
            
            if (!move) break;
            
            stats[statsKey].nodes += currentPlayer.getNodesExplored();
            if (currentPlayer instanceof AlphaBeta) {
                stats[statsKey].prunedNodes += currentPlayer.prunedNodes;
            }
            
            plateau.deplacerPiece(move);
            moves++;
        }

        const memoryUsed = process.memoryUsage().heapUsed - startMemory;
        const winner = plateau.getGagnant();

        // Compter les pièces restantes
        let pieces = { player1: 0, player2: 0 };
        for (let i = 0; i < plateau.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < plateau.TAILLE_PLATEAU; j++) {
                const piece = plateau.plateau[i][j];
                if (piece) {
                    if (piece.joueur === 1) pieces.player1++;
                    else pieces.player2++;
                }
            }
        }

        return {
            winner,
            moves,
            memoryUsed,
            stats,
            pieces
        };
    }

    async compareHeuristics(numGames = 100) {
        console.log(`\n=== Test des heuristiques (${numGames} parties) ===`);
        const heuristics = ['basic', 'position', 'mobility'];
        const results = {};

        for (const h1 of heuristics) {
            for (const h2 of heuristics) {
                if (h1 === h2) continue;
                
                const player1 = new AlphaBeta(3, Heuristics[h1]);
                const player2 = new AlphaBeta(3, Heuristics[h2]);
                
                let stats = {
                    wins: 0,
                    avgTime: 0,
                    avgNodes: 0,
                    avgMoves: 0
                };

                console.log(`\nTest: ${h1} vs ${h2}`);
                for (let i = 0; i < numGames; i++) {
                    if (i % 10 === 0) process.stdout.write('.');
                    const game = await this.playGame(player1, player2);
                    if (game.winner === 1) stats.wins++;
                    stats.avgTime += game.stats.player1.time;
                    stats.avgNodes += game.stats.player1.nodes;
                    stats.avgMoves += game.moves;
                }

                stats.avgTime /= numGames;
                stats.avgNodes /= numGames;
                stats.avgMoves /= numGames;
                results[`${h1}_vs_${h2}`] = stats;
                
                console.log(`\nRésultats ${h1} vs ${h2}:`);
                console.log(`- Victoires: ${stats.wins}/${numGames} (${(stats.wins/numGames*100).toFixed(1)}%)`);
                console.log(`- Temps moyen: ${stats.avgTime.toFixed(2)}ms`);
                console.log(`- Nœuds moyens: ${Math.round(stats.avgNodes)}`);
                console.log(`- Coups moyens: ${Math.round(stats.avgMoves)}`);
            }
        }
        return results;
    }

    async testDepthEffect(maxDepth = 5, numGames = 50) {
        console.log(`\n=== Test de l'effet de la profondeur (${numGames} parties par profondeur) ===`);
        const results = {};

        for (let depth = 2; depth <= maxDepth; depth++) {
            console.log(`\nTest profondeur ${depth}:`);
            const minmax = new MinMax(depth, Heuristics.position);
            const alphaBeta = new AlphaBeta(depth, Heuristics.position);
            
            let stats = {
                minmax: { time: 0, nodes: 0, memory: 0 },
                alphaBeta: { time: 0, nodes: 0, prunedNodes: 0, memory: 0 }
            };

            for (let i = 0; i < numGames; i++) {
                if (i % 5 === 0) process.stdout.write('.');
                const game = await this.playGame(minmax, alphaBeta);
                
                stats.minmax.time += game.stats.player1.time;
                stats.minmax.nodes += game.stats.player1.nodes;
                stats.minmax.memory += game.memoryUsed;
                
                stats.alphaBeta.time += game.stats.player2.time;
                stats.alphaBeta.nodes += game.stats.player2.nodes;
                stats.alphaBeta.prunedNodes += game.stats.player2.prunedNodes;
                stats.alphaBeta.memory += game.memoryUsed;
            }

            // Moyennes
            for (const algo of ['minmax', 'alphaBeta']) {
                stats[algo].time /= numGames;
                stats[algo].nodes /= numGames;
                stats[algo].memory /= numGames;
                if (algo === 'alphaBeta') {
                    stats[algo].prunedNodes /= numGames;
                }
            }

            results[depth] = stats;
            
            console.log('\nRésultats:');
            console.log('MinMax:');
            console.log(`- Temps: ${stats.minmax.time.toFixed(2)}ms`);
            console.log(`- Nœuds: ${Math.round(stats.minmax.nodes)}`);
            console.log(`- Mémoire: ${(stats.minmax.memory/1024/1024).toFixed(2)}MB`);
            
            console.log('\nAlpha-Beta:');
            console.log(`- Temps: ${stats.alphaBeta.time.toFixed(2)}ms`);
            console.log(`- Nœuds: ${Math.round(stats.alphaBeta.nodes)}`);
            console.log(`- Nœuds élagués: ${Math.round(stats.alphaBeta.prunedNodes)}`);
            console.log(`- Mémoire: ${(stats.alphaBeta.memory/1024/1024).toFixed(2)}MB`);
            
            const speedup = ((stats.minmax.time - stats.alphaBeta.time) / stats.minmax.time * 100);
            console.log(`\nGain en performance: ${speedup.toFixed(1)}%`);
        }
        return results;
    }

    async testGridSizes(sizes = [6, 8, 10], numGames = 50) {
        console.log(`\n=== Test de l'effet de la taille (${numGames} parties par taille) ===`);
        const results = {};

        for (const size of sizes) {
            console.log(`\nTest taille ${size}x${size}:`);
            const alphaBeta = new AlphaBeta(3, Heuristics.position);
            let stats = { time: 0, nodes: 0, memory: 0, moves: 0 };

            for (let i = 0; i < numGames; i++) {
                if (i % 5 === 0) process.stdout.write('.');
                const game = await this.playGame(alphaBeta, alphaBeta, size);
                stats.time += game.stats.player1.time + game.stats.player2.time;
                stats.nodes += game.stats.player1.nodes + game.stats.player2.nodes;
                stats.memory += game.memoryUsed;
                stats.moves += game.moves;
            }

            // Moyennes
            stats.time /= (numGames * 2);  // Divisé par 2 car on compte les deux joueurs
            stats.nodes /= (numGames * 2);
            stats.memory /= numGames;
            stats.moves /= numGames;

            results[size] = stats;
            
            console.log('\nRésultats:');
            console.log(`- Temps moyen par coup: ${stats.time.toFixed(2)}ms`);
            console.log(`- Nœuds explorés par coup: ${Math.round(stats.nodes)}`);
            console.log(`- Mémoire utilisée: ${(stats.memory/1024/1024).toFixed(2)}MB`);
            console.log(`- Nombre moyen de coups: ${Math.round(stats.moves)}`);
        }
        return results;
    }
}

module.exports = CheckersPerformance;
