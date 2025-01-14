let gameBoard = null;
let selectedPiece = null;
let possibleMoves = [];
let currentPlayer = 1;
let gameMode = 'pvp'; // 'pvp', 'pve', 'eve'
let aiAlgorithm = 'MinMax';
let aiDifficulty = 4;
let gameInProgress = false;

// Initialisation du jeu
async function initGame() {
    try {
        const response = await fetch('/api/new-game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de l\'initialisation du jeu');
        }

        const data = await response.json();
        gameBoard = data.board;
        currentPlayer = data.currentPlayer;
        gameInProgress = true;
        selectedPiece = null;
        possibleMoves = [];
        
        updateBoard();
        updateGameInfo();

        if (gameMode === 'eve') {
            setTimeout(makeAIMove, 1000);
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du jeu:', error);
        showError('Erreur lors de l\'initialisation du jeu');
    }
}

// Mise à jour de l'affichage du plateau
function updateBoard() {
    const board = document.getElementById('board');
    if (!board || !gameBoard) return;

    board.innerHTML = '';

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            const cell = document.createElement('div');
            cell.className = `cell ${(i + j) % 2 === 0 ? 'light' : 'dark'}`;
            cell.dataset.row = i;
            cell.dataset.col = j;

            const piece = gameBoard[i][j];
            if (piece) {
                const pieceDiv = document.createElement('div');
                pieceDiv.className = `piece player${piece.couleur}${piece.estDame ? ' dame' : ''}`;
                cell.appendChild(pieceDiv);
            }

            if (selectedPiece && selectedPiece[0] === i && selectedPiece[1] === j) {
                cell.classList.add('selected');
            }

            if (possibleMoves.some(move => move.vers[0] === i && move.vers[1] === j)) {
                cell.classList.add('possible-move');
            }

            cell.addEventListener('click', () => handleCellClick(i, j));
            board.appendChild(cell);
        }
    }
}

// Gestion du clic sur une cellule
async function handleCellClick(row, col) {
    if (!gameInProgress || gameMode === 'eve' || (gameMode === 'pve' && currentPlayer === 2)) {
        return;
    }

    try {
        if (!selectedPiece) {
            // Sélection d'une pièce
            if (gameBoard[row][col]?.couleur === currentPlayer) {
                selectedPiece = [row, col];
                await getMoveOptions(row, col);
                updateBoard();
            }
        } else {
            // Tentative de déplacement
            const move = possibleMoves.find(m => 
                m.vers[0] === row && m.vers[1] === col
            );

            if (move) {
                await makeMove(move);
                selectedPiece = null;
                possibleMoves = [];
                updateBoard();

                if (gameMode === 'pve' && currentPlayer === 2) {
                    setTimeout(makeAIMove, 500);
                }
            } else {
                // Désélection ou nouvelle sélection
                selectedPiece = null;
                possibleMoves = [];
                if (gameBoard[row][col]?.couleur === currentPlayer) {
                    handleCellClick(row, col);
                } else {
                    updateBoard();
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors du clic:', error);
        showError('Action invalide');
    }
}

// Obtention des mouvements possibles
async function getMoveOptions(row, col) {
    try {
        const response = await fetch('/api/move-options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: [row, col] })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des mouvements');
        }

        const data = await response.json();
        possibleMoves = data.moves;
    } catch (error) {
        console.error('Erreur lors de la récupération des mouvements:', error);
        showError('Impossible de récupérer les mouvements possibles');
        possibleMoves = [];
    }
}

// Effectuer un mouvement
async function makeMove(move) {
    try {
        const response = await fetch('/api/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(move)
        });

        if (!response.ok) {
            throw new Error('Mouvement invalide');
        }

        const data = await response.json();
        gameBoard = data.board;
        currentPlayer = data.currentPlayer;
        
        updateBoard();
        updateGameInfo();
        updateStatistics(data.statistics);

        if (data.gameOver) {
            handleGameOver(data.winner);
        }

        return data.canContinue;
    } catch (error) {
        console.error('Erreur lors du mouvement:', error);
        showError('Mouvement invalide');
        return false;
    }
}

// Faire jouer l'IA
async function makeAIMove() {
    if (!gameInProgress) return;

    try {
        const response = await fetch('/api/ai-move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                algorithm: aiAlgorithm,
                difficulty: aiDifficulty
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors du mouvement de l\'IA');
        }

        const data = await response.json();
        gameBoard = data.board;
        currentPlayer = data.currentPlayer;
        
        updateBoard();
        updateGameInfo();
        updateStatistics(data.statistics);

        if (data.gameOver) {
            handleGameOver(data.winner);
        } else if (gameMode === 'eve' && gameInProgress) {
            setTimeout(makeAIMove, 1000);
        }
    } catch (error) {
        console.error('Erreur lors du mouvement de l\'IA:', error);
        showError('Erreur lors du mouvement de l\'IA');
        gameInProgress = false;
    }
}

// Gestion de la fin de partie
function handleGameOver(winner) {
    gameInProgress = false;
    const message = winner ? 
        `Partie terminée ! Le joueur ${winner} a gagné !` : 
        'Match nul !';
    showMessage(message);
}

// Mise à jour des informations de jeu
function updateGameInfo() {
    const playerInfo = document.getElementById('player-info');
    if (playerInfo) {
        playerInfo.textContent = `Tour du joueur ${currentPlayer}`;
    }
}

// Mise à jour des statistiques
function updateStatistics(stats) {
    if (!stats) return;
    
    const elements = {
        'moves-count': stats.nbCoups,
        'captures-black': stats.prises[1],
        'captures-white': stats.prises[2]
    };

    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}

// Affichage des messages d'erreur
function showError(message) {
    // Vous pouvez personnaliser l'affichage des erreurs ici
    alert(message);
}

// Affichage des messages
function showMessage(message) {
    // Vous pouvez personnaliser l'affichage des messages ici
    alert(message);
}

// Configuration du mode de jeu
function setGameMode(mode) {
    gameMode = mode;
    initGame();
}

// Configuration de l'IA
function configureAI(algorithm, difficulty) {
    aiAlgorithm = algorithm;
    aiDifficulty = parseInt(difficulty);
}

// Initialisation au chargement de la page
window.onload = () => {
    initGame();
};
