const BaseAI = require('./BaseAI');

class AlphaBeta extends BaseAI {
    constructor(maxDepth = 4, heuristicFn = null) {
        super(maxDepth, heuristicFn);
        this.maxDepth = maxDepth;
        this.nodesExplored = 0;
        this.prunedNodes = 0;
    }

    findBestMove(plateau) {
        return this.measurePerformance(() => {
            const joueur = plateau.joueurActuel;
            let meilleurScore = -Infinity;
            let meilleurMouvement = null;
            let alpha = -Infinity;
            let beta = Infinity;

            // Récupère tous les mouvements possibles
            const mouvementsPossibles = plateau.getMouvementsPossiblesPourJoueur(joueur);
            
            if (mouvementsPossibles.length === 0) {
                return null;
            }

            // Pour chaque mouvement possible
            for (const mouvement of mouvementsPossibles) {
                try {
                    // Crée une copie du plateau
                    const plateauTemp = plateau.copierPlateau();
                    
                    // Effectue le mouvement
                    plateauTemp.deplacerPiece(mouvement);
                    
                    // Évalue le score pour ce mouvement
                    const score = this.alphaBeta(plateauTemp, this.maxDepth - 1, alpha, beta, false, joueur);
                    
                    // Met à jour le meilleur mouvement si nécessaire
                    if (score > meilleurScore) {
                        meilleurScore = score;
                        meilleurMouvement = mouvement;
                        alpha = Math.max(alpha, meilleurScore);
                    }
                } catch (error) {
                    console.error('Erreur lors de l\'évaluation du mouvement:', error);
                    continue;
                }
                
                this.incrementNodesExplored();
            }

            return meilleurMouvement;
        });
    }

    alphaBeta(plateau, profondeur, alpha, beta, estMax, joueurInitial) {
        this.incrementNodesExplored();

        // Si on atteint la profondeur maximale ou fin de partie
        if (profondeur === 0 || plateau.estPartieTerminee()) {
            return this.evaluatePosition(plateau, joueurInitial);
        }

        const joueurActuel = plateau.joueurActuel;
        const mouvementsPossibles = plateau.getMouvementsPossiblesPourJoueur(joueurActuel);

        // Si aucun mouvement possible
        if (mouvementsPossibles.length === 0) {
            return this.evaluatePosition(plateau, joueurInitial);
        }

        if (estMax) {
            let meilleurScore = -Infinity;
            for (const mouvement of mouvementsPossibles) {
                const plateauTemp = plateau.copierPlateau();
                plateauTemp.deplacerPiece(mouvement);
                const score = this.alphaBeta(plateauTemp, profondeur - 1, alpha, beta, false, joueurInitial);
                meilleurScore = Math.max(meilleurScore, score);
                alpha = Math.max(alpha, meilleurScore);
                
                if (beta <= alpha) {
                    this.incrementPrunedNodes();
                    break;
                }
            }
            return meilleurScore;
        } else {
            let pireScore = Infinity;
            for (const mouvement of mouvementsPossibles) {
                const plateauTemp = plateau.copierPlateau();
                plateauTemp.deplacerPiece(mouvement);
                const score = this.alphaBeta(plateauTemp, profondeur - 1, alpha, beta, true, joueurInitial);
                pireScore = Math.min(pireScore, score);
                beta = Math.min(beta, pireScore);
                
                if (beta <= alpha) {
                    this.incrementPrunedNodes();
                    break;
                }
            }
            return pireScore;
        }
    }

    evaluatePosition(plateau, joueur) {
        let score = 0;
        const adversaire = 3 - joueur;
        
        // Compte les pièces
        let piecesPropres = 0;
        let piecesAdverses = 0;
        let damesPropres = 0;
        let damesAdverses = 0;
        
        for (let i = 0; i < plateau.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < plateau.TAILLE_PLATEAU; j++) {
                const piece = plateau.plateau[i][j];
                if (piece) {
                    if (piece.couleur === joueur) {
                        if (piece.estDame) {
                            damesPropres++;
                            score += 15; // Une dame vaut plus qu'un pion
                        } else {
                            piecesPropres++;
                            score += 10;
                            // Bonus pour l'avancement vers la promotion
                            if (joueur === 1) {
                                score += i * 0.5; // Bonus pour l'avancement vers le bas
                            } else {
                                score += (plateau.TAILLE_PLATEAU - 1 - i) * 0.5; // Bonus pour l'avancement vers le haut
                            }
                        }
                        // Bonus pour le contrôle du centre
                        if (j > 2 && j < plateau.TAILLE_PLATEAU - 3) {
                            score += 1;
                        }
                    } else {
                        if (piece.estDame) {
                            damesAdverses++;
                            score -= 15;
                        } else {
                            piecesAdverses++;
                            score -= 10;
                        }
                    }
                }
            }
        }
        
        // Bonus pour la mobilité
        const mouvementsPossibles = plateau.getMouvementsPossiblesPourJoueur(joueur);
        score += mouvementsPossibles.length * 0.1;
        
        // Bonus pour la protection des pièces
        for (let i = 0; i < plateau.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < plateau.TAILLE_PLATEAU; j++) {
                const piece = plateau.plateau[i][j];
                if (piece && piece.couleur === joueur && !piece.estDame) {
                    // Vérifie si la pièce est protégée par une autre pièce
                    if (this.estPieceProtegee(plateau, i, j)) {
                        score += 2;
                    }
                }
            }
        }
        
        return score;
    }

    estPieceProtegee(plateau, ligne, colonne) {
        const piece = plateau.plateau[ligne][colonne];
        if (!piece) return false;
        
        const direction = piece.couleur === 1 ? -1 : 1;
        const positions = [
            [ligne + direction, colonne - 1],
            [ligne + direction, colonne + 1]
        ];
        
        for (const [l, c] of positions) {
            if (l >= 0 && l < plateau.TAILLE_PLATEAU && c >= 0 && c < plateau.TAILLE_PLATEAU) {
                const pieceAdjacente = plateau.plateau[l][c];
                if (pieceAdjacente && pieceAdjacente.couleur === piece.couleur) {
                    return true;
                }
            }
        }
        
        return false;
    }

    incrementNodesExplored() {
        this.nodesExplored++;
    }

    incrementPrunedNodes() {
        this.prunedNodes++;
    }
}

module.exports = AlphaBeta;