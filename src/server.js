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
            currentPlayer: plateau.joueurActuel,
            gameOver: false,
            winner: null,
            statistics: plateau.getStatistiques()
        });
    } catch (error) {
        console.error('Erreur new-game:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint pour obtenir les options de mouvement
app.post('/api/move-options', (req, res) => {
    try {
        const { position } = req.body;
        if (!plateau) {
            throw new Error('Aucune partie en cours');
        }
        if (!position || !Array.isArray(position) || position.length !== 2) {
            throw new Error('Position invalide');
        }

        const mouvements = plateau.getMouvementsValides(position);
        res.json({ moves: mouvements });
    } catch (error) {
        console.error('Erreur move-options:', error);
        res.status(400).json({ error: error.message });
    }
});

// Endpoint pour effectuer un mouvement
app.post('/api/move', (req, res) => {
    try {
        if (!plateau) {
            throw new Error('Aucune partie en cours');
        }

        const { de, vers, prises } = req.body;
        if (!de || !vers || !Array.isArray(de) || !Array.isArray(vers)) {
            throw new Error('Mouvement invalide');
        }

        const peutContinuer = plateau.deplacerPiece({ de, vers, prises: prises || [] });
        
        res.json({
            board: plateau.plateau,
            currentPlayer: plateau.joueurActuel,
            gameOver: plateau.estPartieTerminee(),
            winner: plateau.getGagnant(),
            statistics: plateau.getStatistiques(),
            canContinue: peutContinuer
        });
    } catch (error) {
        console.error('Erreur move:', error);
        res.status(400).json({ error: error.message });
    }
});

// Endpoint pour le coup de l'IA
app.post('/api/ai-move', (req, res) => {
    try {
        if (!plateau) {
            throw new Error('Aucune partie en cours');
        }

        const { algorithm = 'MinMax', difficulty = 4 } = req.body;
        
        // Crée l'instance d'IA appropriée
        if (algorithm === 'MinMax') {
            aiInstance = new MinMax(difficulty);
        } else if (algorithm === 'AlphaBeta') {
            aiInstance = new AlphaBeta(difficulty);
        } else {
            throw new Error('Algorithme IA invalide');
        }

        // Trouve le meilleur mouvement
        const move = aiInstance.findBestMove(plateau);
        if (!move) {
            throw new Error('Aucun mouvement possible pour l\'IA');
        }

        // Effectue le mouvement
        const peutContinuer = plateau.deplacerPiece(move);

        res.json({
            board: plateau.plateau,
            move: move,
            currentPlayer: plateau.joueurActuel,
            gameOver: plateau.estPartieTerminee(),
            winner: plateau.getGagnant(),
            statistics: plateau.getStatistiques(),
            canContinue: peutContinuer
        });
    } catch (error) {
        console.error('Erreur ai-move:', error);
        res.status(400).json({ error: error.message });
    }
});

// Endpoint pour obtenir l'état du jeu
app.get('/api/game-state', (req, res) => {
    try {
        if (!plateau) {
            throw new Error('Aucune partie en cours');
        }

        res.json({
            board: plateau.plateau,
            currentPlayer: plateau.joueurActuel,
            gameOver: plateau.estPartieTerminee(),
            winner: plateau.getGagnant(),
            statistics: plateau.getStatistiques()
        });
    } catch (error) {
        console.error('Erreur game-state:', error);
        res.status(400).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
