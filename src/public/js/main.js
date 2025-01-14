let gameBoard = null;
let selectedPiece = null;
let possibleMoves = [];
let currentPlayer = 1;
let gameMode = 'pvp'; // 'pvp', 'pve', 'eve'
let aiAlgorithm = 'MinMax';
let aiDifficulty = 4;

// Initialisation du jeu
async function initGame() {
    try {
        const response = await fetch('/api/new-game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        gameBoard = data.board;
        currentPlayer = data.currentPlayer;
        updateBoard();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du jeu:', error);
    }
}

// Mise à jour de l'affichage du plateau
function updateBoard() {
    const board = document.getElementById('board');
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

    updateGameInfo();
}

// Gestion du clic sur une cellule
async function handleCellClick(row, col) {
    if (gameMode === 'eve' || (gameMode === 'pve' && currentPlayer === 2)) {
        return; // Empêche les clics pendant le tour de l'IA
    }

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
            handleCellClick(row, col);
        }
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
        const data = await response.json();
        possibleMoves = data.moves;
    } catch (error) {
        console.error('Erreur lors de la récupération des mouvements:', error);
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
        const data = await response.json();
        gameBoard = data.board;
        currentPlayer = data.currentPlayer;

        if (data.gameOver) {
            handleGameOver(data.winner);
        }
    } catch (error) {
        console.error('Erreur lors du mouvement:', error);
    }
}

// Faire jouer l'IA
async function makeAIMove() {
    try {
        const response = await fetch('/api/ai-move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                algorithm: aiAlgorithm,
                difficulty: aiDifficulty
            })
        });
        const data = await response.json();
        gameBoard = data.board;
        currentPlayer = data.currentPlayer;
        updateBoard();

        if (data.gameOver) {
            handleGameOver(data.winner);
        } else if (gameMode === 'eve') {
            setTimeout(makeAIMove, 1000);
        }
    } catch (error) {
        console.error('Erreur lors du mouvement de l\'IA:', error);
    }
}

// Gestion de la fin de partie
function handleGameOver(winner) {
    const message = winner ? 
        `Partie terminée ! Le joueur ${winner} a gagné !` : 
        'Match nul !';
    alert(message);
}

// Mise à jour des informations de jeu
function updateGameInfo() {
    const playerInfo = document.getElementById('player-info');
    if (playerInfo) {
        playerInfo.textContent = `Tour du joueur ${currentPlayer}`;
    }
}

// Configuration du mode de jeu
function setGameMode(mode) {
    gameMode = mode;
    initGame();
    if (mode === 'eve') {
        setTimeout(makeAIMove, 1000);
    }
}

// Configuration de l'IA
function configureAI(algorithm, difficulty) {
    aiAlgorithm = algorithm;
    aiDifficulty = difficulty;
}

// Initialisation au chargement de la page
window.onload = () => {
    initGame();
};
