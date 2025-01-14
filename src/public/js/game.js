class GameUI {
    constructor() {
        this.board = document.getElementById('board');
        this.status = document.getElementById('status');
        this.movesList = document.getElementById('movesList');
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.gameMode = document.getElementById('gameMode').value;
        this.aiAlgorithm = document.getElementById('aiAlgorithm').value;
        this.difficulty = parseInt(document.getElementById('difficulty').value);
        this.currentBoard = null;
        this.isAIThinking = false;
        this.gameRunning = false;

        this.initializeEventListeners();
        this.newGame();
    }

    initializeEventListeners() {
        document.getElementById('newGame').addEventListener('click', () => {
            this.gameRunning = false;
            setTimeout(() => this.newGame(), 100);
        });
        
        document.getElementById('gameMode').addEventListener('change', (e) => {
            this.gameMode = e.target.value;
            this.gameRunning = false;
            setTimeout(() => this.newGame(), 100);
        });
        
        document.getElementById('aiAlgorithm').addEventListener('change', (e) => {
            this.aiAlgorithm = e.target.value;
            if (this.gameMode === 'ai-ai') {
                this.gameRunning = false;
                setTimeout(() => this.newGame(), 100);
            }
        });
        
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = parseInt(e.target.value);
        });
    }

    async initializeBoard() {
        this.board.innerHTML = '';
        const table = document.createElement('div');
        table.className = 'board';
        
        // Crée les cases du plateau
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const square = document.createElement('div');
                square.className = `case ${(i + j) % 2 === 1 ? 'case-noire' : 'case-blanche'}`;
                square.dataset.row = i;
                square.dataset.col = j;
                square.addEventListener('click', (e) => this.handleSquareClick(e));
                table.appendChild(square);
            }
        }
        
        this.board.appendChild(table);
        await this.updateBoard(this.currentBoard);
    }

    async handleSquareClick(e) {
        if (this.gameMode === 'ai-ai' || this.isAIThinking || !this.gameRunning) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const clickedSquare = this.currentBoard[row][col];

        // Si on clique sur une case possible
        if (this.possibleMoves.some(move => move.vers[0] === row && move.vers[1] === col)) {
            const move = this.possibleMoves.find(move => move.vers[0] === row && move.vers[1] === col);
            const success = await this.makeMove(move);
            this.clearHighlights();
            this.selectedPiece = null;
            this.possibleMoves = [];
            
            if (success && this.gameMode === 'human-ai' && this.gameRunning) {
                this.status.textContent = "L'IA réfléchit...";
                this.isAIThinking = true;
                await this.makeAIMove();
                this.isAIThinking = false;
            }
        } 
        // Si on clique sur une pièce
        else if (clickedSquare && clickedSquare.couleur === 1) {
            try {
                const response = await fetch('/api/move-options', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ position: [row, col] })
                });
                const data = await response.json();
                
                if (data.error) {
                    this.showError(data.error);
                    return;
                }
                
                this.clearHighlights();
                this.selectedPiece = [row, col];
                this.possibleMoves = data.moves;
                this.highlightMoves(data.moves);
            } catch (error) {
                this.showError('Erreur lors de la récupération des mouvements');
            }
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        this.status.innerHTML = '';
        this.status.appendChild(errorDiv);
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    clearHighlights() {
        const squares = document.querySelectorAll('.case');
        squares.forEach(square => {
            square.classList.remove('highlight');
            square.classList.remove('selected');
        });
    }

    highlightMoves(moves) {
        if (!moves || !Array.isArray(moves)) return;
        
        // Highlight la pièce sélectionnée
        if (this.selectedPiece) {
            const [row, col] = this.selectedPiece;
            const selectedSquare = document.querySelector(`.case[data-row="${row}"][data-col="${col}"]`);
            if (selectedSquare) {
                selectedSquare.classList.add('selected');
            }
        }

        // Highlight les mouvements possibles
        moves.forEach(move => {
            if (move && move.vers && Array.isArray(move.vers)) {
                const [row, col] = move.vers;
                const square = document.querySelector(`.case[data-row="${row}"][data-col="${col}"]`);
                if (square) {
                    square.classList.add('highlight');
                }
            }
        });
    }

    async makeMove(move) {
        if (!this.gameRunning) return false;
        
        try {
            const response = await fetch('/api/move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(move)
            });
            const result = await response.json();
            
            if (result.error) {
                this.showError(result.error);
                return false;
            }
            
            this.currentBoard = result.board;
            await this.updateBoard(result.board);
            this.updateStatistics(result.statistics);
            this.addMoveToHistory(move);
            
            if (result.gameOver) {
                this.handleGameOver(result.winner);
                this.gameRunning = false;
            }
            return true;
        } catch (error) {
            this.showError('Erreur lors du mouvement');
            return false;
        }
    }

    async makeAIMove() {
        if (!this.gameRunning) return false;
        
        try {
            const response = await fetch('/api/ai-move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    algorithm: this.aiAlgorithm,
                    difficulty: this.difficulty
                })
            });
            const result = await response.json();
            
            if (result.error) {
                this.showError(result.error);
                return false;
            }
            
            this.currentBoard = result.board;
            await this.updateBoard(result.board);
            this.updateStatistics(result.statistics);
            if (result.move) {
                this.addMoveToHistory(result.move);
            }
            
            if (result.gameOver) {
                this.handleGameOver(result.winner);
                this.gameRunning = false;
            } else {
                this.status.textContent = "À votre tour";
            }
            return true;
        } catch (error) {
            this.showError('Erreur lors du coup de l\'IA');
            return false;
        }
    }

    updateStatistics(stats) {
        if (!stats) return;
        
        document.getElementById('nbCoups').textContent = stats.nbCoups;
        document.getElementById('prisesNoir').textContent = stats.prises[1];
        document.getElementById('prisesBlanc').textContent = stats.prises[2];
        document.getElementById('tempsNoir').textContent = `${Math.round(stats.tempsReflexion[1] / 1000)}s`;
        document.getElementById('tempsBlanc').textContent = `${Math.round(stats.tempsReflexion[2] / 1000)}s`;
    }

    async updateBoard(boardState) {
        if (!boardState) return;
        
        const squares = document.querySelectorAll('.case');
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = boardState[row][col];
            
            // Supprime l'ancien pion s'il existe
            const oldPiece = square.querySelector('.pion');
            if (oldPiece) square.removeChild(oldPiece);
            
            // Ajoute le nouveau pion si nécessaire
            if (piece) {
                const pieceDiv = document.createElement('div');
                pieceDiv.className = `pion pion-${piece.couleur === 1 ? 'noir' : 'blanc'}`;
                if (piece.estDame) pieceDiv.classList.add('dame');
                square.appendChild(pieceDiv);
            }
        });
    }

    addMoveToHistory(move) {
        if (!move || !move.de || !move.vers) return;
        
        const moveElement = document.createElement('div');
        moveElement.className = 'move';
        moveElement.textContent = `${move.de[0]},${move.de[1]} → ${move.vers[0]},${move.vers[1]}`;
        if (move.prises && move.prises.length > 0) {
            moveElement.textContent += ` (${move.prises.length} prise${move.prises.length > 1 ? 's' : ''})`;
        }
        this.movesList.insertBefore(moveElement, this.movesList.firstChild);
    }

    handleGameOver(winner) {
        let message = "Partie terminée ! ";
        if (winner === 0) {
            message += "Match nul !";
        } else {
            message += `Les ${winner === 1 ? 'Noirs' : 'Blancs'} ont gagné !`;
        }
        this.status.textContent = message;
        this.gameRunning = false;
    }

    async newGame() {
        try {
            this.gameRunning = false;
            this.isAIThinking = false;
            
            const response = await fetch('/api/new-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    gameMode: this.gameMode
                })
            });
            const result = await response.json();
            
            if (result.error) {
                this.showError(result.error);
                return;
            }
            
            this.currentBoard = result.board;
            this.selectedPiece = null;
            this.possibleMoves = [];
            this.isAIThinking = false;
            
            await this.initializeBoard();
            this.movesList.innerHTML = '';
            this.updateStatistics({
                nbCoups: 0,
                prises: { 1: 0, 2: 0 },
                tempsReflexion: { 1: 0, 2: 0 }
            });
            
            this.gameRunning = true;
            
            if (this.gameMode === 'human-ai') {
                this.status.textContent = "À votre tour (pions noirs)";
            } else if (this.gameMode === 'ai-ai') {
                this.status.textContent = "Partie IA vs IA";
                this.runAIGame();
            }
        } catch (error) {
            this.showError('Erreur lors de la création d\'une nouvelle partie');
        }
    }

    async runAIGame() {
        this.gameRunning = true;
        this.status.textContent = "Partie IA vs IA en cours...";
        
        while (this.gameRunning) {
            const response = await fetch('/api/game-status');
            const status = await response.json();
            
            if (status.gameOver) {
                this.handleGameOver(status.winner);
                break;
            }
            
            this.status.textContent = `L'IA ${status.currentPlayer === 1 ? 'Noire' : 'Blanche'} réfléchit...`;
            this.isAIThinking = true;
            const success = await this.makeAIMove();
            this.isAIThinking = false;
            
            if (!success || !this.gameRunning) break;
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

window.addEventListener('load', () => {
    const game = new GameUI();
});
