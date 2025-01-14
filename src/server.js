const express = require('express');
const path = require('path');
const Plateau = require('./game/Plateau');
const MinMax = require('./ai/MinMax');
const AlphaBeta = require('./ai/AlphaBeta');

const app = express();
const port = 4000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let plateau = null;
let aiInstance = null;

// Endpoint pour créer une nouvelle partie
app.post('/api/new-game', (req, res) => {
    try {
        plateau = new Plateau();
        res.json({
            board: plateau.plateau,
            currentPlayer: plateau.joueurActuel
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint pour obtenir les options de mouvement
app.post('/api/move-options', (req, res) => {
    try {
        const { position } = req.body;
        if (!position || !Array.isArray(position) || position.length !== 2) {
            throw new Error('Position invalide');
        }

        const mouvements = plateau.getMouvementsValides(position);
        res.json({ moves: mouvements });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint pour effectuer un mouvement
app.post('/api/move', (req, res) => {
    try {
        const { de, vers, prises } = req.body;
        if (!de || !vers || !Array.isArray(de) || !Array.isArray(vers)) {
            throw new Error('Mouvement invalide');
        }

        plateau.deplacerPiece({ de, vers, prises });
        
        res.json({
            board: plateau.plateau,
            currentPlayer: plateau.joueurActuel,
            gameOver: plateau.estPartieTerminee(),
            winner: plateau.getGagnant(),
            statistics: plateau.getStatistiques()
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint pour le coup de l'IA
app.post('/api/ai-move', (req, res) => {
    try {
        const { algorithm, difficulty } = req.body;
        
        // Crée l'instance d'IA appropriée
        if (algorithm === 'MinMax') {
            aiInstance = new MinMax(difficulty);
        } else if (algorithm === 'AlphaBeta') {
            aiInstance = new AlphaBeta(difficulty);
        } else {
            throw new Error('Algorithme IA invalide');
        }

        // Trouve et effectue le meilleur mouvement
        const move = aiInstance.findBestMove(plateau);
        if (!move) {
            throw new Error('Aucun mouvement possible pour l\'IA');
        }

        plateau.deplacerPiece(move);

        res.json({
            board: plateau.plateau,
            move: move,
            currentPlayer: plateau.joueurActuel,
            gameOver: plateau.estPartieTerminee(),
            winner: plateau.getGagnant(),
            statistics: plateau.getStatistiques()
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint pour obtenir le statut du jeu
app.get('/api/game-status', (req, res) => {
    try {
        if (!plateau) {
            throw new Error('Aucune partie en cours');
        }

        res.json({
            currentPlayer: plateau.joueurActuel,
            gameOver: plateau.estPartieTerminee(),
            winner: plateau.getGagnant(),
            statistics: plateau.getStatistiques()
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
