const BaseAI = require('./BaseAI');

class MinMax extends BaseAI {
    constructor(maxDepth = 4, heuristicFn = null) {
        super(maxDepth, heuristicFn);
        this.maxDepth = maxDepth;
        this.nodesExplored = 0;
    }

    findBestMove(plateau) {
        return this.measurePerformance(() => {
            const joueur = plateau.joueurActuel;
            let meilleurScore = -Infinity;
            let meilleurMouvement = null;

            // Récupère tous les mouvements possibles
            const mouvementsPossibles = plateau.getMouvementsPossiblesPourJoueur(joueur);
            
            if (mouvementsPossibles.length === 0) {
                return null;
            }

            // Pour chaque mouvement possible
            for (const mouvement of mouvementsPossibles) {
                // Crée une copie du plateau
                const plateauTemp = plateau.copierPlateau();
                
                try {
                    // Effectue le mouvement
                    plateauTemp.deplacerPiece(mouvement);
                    
                    // Évalue le score pour ce mouvement
                    const score = this.minmax(plateauTemp, this.maxDepth - 1, false, joueur);
                    
                    // Met à jour le meilleur mouvement si nécessaire
                    if (score > meilleurScore) {
                        meilleurScore = score;
                        meilleurMouvement = mouvement;
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

    minmax(plateau, profondeur, estMax, joueurInitial) {
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
                const score = this.minmax(plateauTemp, profondeur - 1, false, joueurInitial);
                meilleurScore = Math.max(meilleurScore, score);
            }
            return meilleurScore;
        } else {
            let pireScore = Infinity;
            for (const mouvement of mouvementsPossibles) {
                const plateauTemp = plateau.copierPlateau();
                plateauTemp.deplacerPiece(mouvement);
                const score = this.minmax(plateauTemp, profondeur - 1, true, joueurInitial);
                pireScore = Math.min(pireScore, score);
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

    measurePerformance(func) {
        const startTime = Date.now();
        const result = func();
        const endTime = Date.now();
        console.log(`Temps d'exécution : ${endTime - startTime}ms`);
        console.log(`Noeuds explorés : ${this.nodesExplored}`);
        return result;
    }

    incrementNodesExplored() {
        this.nodesExplored++;
    }
}

module.exports = MinMax;