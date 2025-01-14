const BaseAI = require('./BaseAI');

class AlphaBeta extends BaseAI {
    constructor(maxDepth = 4) {
        super(maxDepth);
        this.maxDepth = maxDepth;
        this.nodesExplored = 0;
    }

    findBestMove(plateau) {
        return this.measurePerformance(() => {
            const joueur = plateau.joueurActuel;
            let meilleurScore = -Infinity;
            let meilleurMouvement = null;
            const alpha = -Infinity;
            const beta = Infinity;

            // Récupère tous les mouvements possibles
            const mouvementsPossibles = this.getTousMouvementsPossibles(plateau);
            
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
                    }
                } catch (error) {
                    console.log('Erreur lors de l\'évaluation du mouvement:', error);
                    continue;
                }
            }

            return meilleurMouvement;
        });
    }

    alphaBeta(plateau, profondeur, alpha, beta, estMax, joueurInitial) {
        this.nodesExplored++;
        
        // Vérifie d'abord si la partie est terminée
        if (plateau.estPartieTerminee()) {
            const gagnant = plateau.getGagnant();
            if (gagnant === joueurInitial) return 1000 + profondeur;
            if (gagnant === (3 - joueurInitial)) return -1000 - profondeur;
            return 0; // Match nul
        }

        // Si on atteint la profondeur maximale
        if (profondeur === 0) {
            return this.evaluerPosition(plateau, joueurInitial);
        }

        const mouvementsPossibles = this.getTousMouvementsPossibles(plateau);

        // Si aucun mouvement possible
        if (mouvementsPossibles.length === 0) {
            return estMax ? -1000 - profondeur : 1000 + profondeur;
        }

        if (estMax) {
            let valeur = -Infinity;
            for (const mouvement of mouvementsPossibles) {
                try {
                    const plateauTemp = plateau.copierPlateau();
                    const continuerPrise = plateauTemp.deplacerPiece(mouvement);
                    
                    // Si prise multiple, reste au même niveau de profondeur
                    const nouvelleProf = continuerPrise ? profondeur : profondeur - 1;
                    const score = this.alphaBeta(plateauTemp, nouvelleProf, alpha, beta, !estMax, joueurInitial);
                    
                    valeur = Math.max(valeur, score);
                    alpha = Math.max(alpha, valeur);
                    
                    if (beta <= alpha) {
                        break; // Coupure beta
                    }
                } catch (error) {
                    continue;
                }
            }
            return valeur;
        } else {
            let valeur = Infinity;
            for (const mouvement of mouvementsPossibles) {
                try {
                    const plateauTemp = plateau.copierPlateau();
                    const continuerPrise = plateauTemp.deplacerPiece(mouvement);
                    
                    // Si prise multiple, reste au même niveau de profondeur
                    const nouvelleProf = continuerPrise ? profondeur : profondeur - 1;
                    const score = this.alphaBeta(plateauTemp, nouvelleProf, alpha, beta, !estMax, joueurInitial);
                    
                    valeur = Math.min(valeur, score);
                    beta = Math.min(beta, valeur);
                    
                    if (beta <= alpha) {
                        break; // Coupure alpha
                    }
                } catch (error) {
                    continue;
                }
            }
            return valeur;
        }
    }

    getTousMouvementsPossibles(plateau) {
        // Vérifie d'abord s'il y a des prises obligatoires
        const prisesObligatoires = plateau.getToutesPrisesObligatoires();
        if (prisesObligatoires.length > 0) {
            return prisesObligatoires;
        }

        // Si pas de prises obligatoires, retourne tous les mouvements simples
        return plateau.getTousMouvementsPossibles();
    }

    evaluerPosition(plateau, joueur) {
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
        const mouvementsPossibles = this.getTousMouvementsPossibles(plateau);
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
}

module.exports = AlphaBeta;