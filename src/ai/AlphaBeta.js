const BaseAI = require('./BaseAI');

class AlphaBeta extends BaseAI {
    constructor(maxDepth = 4) {
        super(maxDepth);
        this.maxDepth = maxDepth;
    }

    findBestMove(plateau) {
        return this.measurePerformance(() => {
            const joueur = plateau.joueurActuel;
            let meilleurScore = -Infinity;
            let meilleurMouvement = null;
            let alpha = -Infinity;
            let beta = Infinity;

            // Récupère tous les mouvements possibles
            const mouvementsPossibles = this.getTousMouvementsPossibles(plateau);
            
            if (mouvementsPossibles.length === 0) {
                return null;
            }

            // Pour chaque mouvement possible
            for (const mouvement of mouvementsPossibles) {
                this.nodesExplored++;
                
                // Crée une copie du plateau
                const plateauTemp = plateau.copierPlateau();
                
                // Effectue le mouvement
                plateauTemp.deplacerPiece(mouvement);
                
                // Évalue le score pour ce mouvement avec alpha-beta
                const score = this.alphaBeta(plateauTemp, this.maxDepth - 1, alpha, beta, false, joueur);
                
                // Met à jour le meilleur mouvement si nécessaire
                if (score > meilleurScore) {
                    meilleurScore = score;
                    meilleurMouvement = mouvement;
                }
                
                alpha = Math.max(alpha, score);
                
                // Coupure alpha-beta
                if (beta <= alpha) {
                    break;
                }
            }

            return meilleurMouvement;
        });
    }

    alphaBeta(plateau, profondeur, alpha, beta, estMax, joueurInitial) {
        this.nodesExplored++;
        
        // Si on atteint la profondeur maximale ou fin de partie
        if (profondeur === 0 || plateau.estPartieTerminee()) {
            return this.evaluerPosition(plateau, joueurInitial);
        }

        const mouvementsPossibles = this.getTousMouvementsPossibles(plateau);

        // Si aucun mouvement possible, c'est perdu pour le joueur actuel
        if (mouvementsPossibles.length === 0) {
            return estMax ? -1000 : 1000;
        }

        if (estMax) {
            let meilleurScore = -Infinity;
            for (const mouvement of mouvementsPossibles) {
                const plateauTemp = plateau.copierPlateau();
                plateauTemp.deplacerPiece(mouvement);
                const score = this.alphaBeta(plateauTemp, profondeur - 1, alpha, beta, false, joueurInitial);
                meilleurScore = Math.max(meilleurScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) {
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
                beta = Math.min(beta, score);
                if (beta <= alpha) {
                    break;
                }
            }
            return pireScore;
        }
    }

    getTousMouvementsPossibles(plateau) {
        const mouvements = [];
        const taille = plateau.TAILLE_PLATEAU;

        // Vérifie d'abord s'il y a des prises obligatoires
        const prisesObligatoires = plateau.getToutesPrisesObligatoires();
        if (prisesObligatoires.length > 0) {
            return prisesObligatoires;
        }

        // Si pas de prises obligatoires, cherche tous les mouvements possibles
        for (let i = 0; i < taille; i++) {
            for (let j = 0; j < taille; j++) {
                const piece = plateau.plateau[i][j];
                if (piece && piece.couleur === plateau.joueurActuel) {
                    const mouvementsPiece = plateau.getMouvementsValides([i, j]);
                    mouvements.push(...mouvementsPiece);
                }
            }
        }

        return mouvements;
    }

    evaluerPosition(plateau, joueur) {
        let score = 0;
        const VALEUR_PION = 10;
        const VALEUR_DAME = 30;
        const BONUS_CENTRE = 2;
        const BONUS_PROTECTION = 1;
        
        for (let i = 0; i < plateau.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < plateau.TAILLE_PLATEAU; j++) {
                const pion = plateau.plateau[i][j];
                if (pion) {
                    const valeurBase = pion.estDame ? VALEUR_DAME : VALEUR_PION;
                    const scoreBase = pion.couleur === joueur ? valeurBase : -valeurBase;
                    
                    // Bonus pour le contrôle du centre
                    const distanceCentre = Math.abs(i - plateau.TAILLE_PLATEAU/2) + Math.abs(j - plateau.TAILLE_PLATEAU/2);
                    const bonusCentre = (plateau.TAILLE_PLATEAU - distanceCentre) * BONUS_CENTRE;
                    
                    // Bonus pour les pions protégés
                    let bonusProtection = 0;
                    for (const [di, dj] of [[-1,-1], [-1,1], [1,-1], [1,1]]) {
                        const ni = i + di;
                        const nj = j + dj;
                        if (plateau.estPositionValide([ni, nj]) && 
                            plateau.plateau[ni][nj]?.couleur === pion.couleur) {
                            bonusProtection += BONUS_PROTECTION;
                        }
                    }
                    
                    score += scoreBase + (pion.couleur === joueur ? bonusCentre + bonusProtection : -(bonusCentre + bonusProtection));
                }
            }
        }

        // Bonus pour la mobilité
        const joueurActuelTemp = plateau.joueurActuel;
        
        plateau.joueurActuel = joueur;
        const mouvementsJoueur = this.getTousMouvementsPossibles(plateau).length;
        
        plateau.joueurActuel = 3 - joueur;
        const mouvementsAdversaire = this.getTousMouvementsPossibles(plateau).length;
        
        plateau.joueurActuel = joueurActuelTemp;
        
        score += (mouvementsJoueur - mouvementsAdversaire) * 0.5;

        return score;
    }
}

module.exports = AlphaBeta;