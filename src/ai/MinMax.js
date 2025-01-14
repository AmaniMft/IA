const BaseAI = require('./BaseAI');

class MinMax extends BaseAI {
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
                
                // Évalue le score pour ce mouvement
                const score = this.minmax(plateauTemp, this.maxDepth - 1, false, joueur);
                
                // Met à jour le meilleur mouvement si nécessaire
                if (score > meilleurScore) {
                    meilleurScore = score;
                    meilleurMouvement = mouvement;
                }
            }

            return meilleurMouvement;
        });
    }

    minmax(plateau, profondeur, estMax, joueurInitial) {
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

    evaluerPosition(plateau, joueurInitial) {
        let score = 0;
        const facteurDame = 2.5; // Une dame vaut 2.5 fois plus qu'un pion
        const facteurPosition = 0.1; // Bonus pour les positions avancées
        const facteurCentre = 0.05; // Bonus pour le contrôle du centre
        const facteurProtection = 0.15; // Bonus pour les pions protégés

        for (let i = 0; i < plateau.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < plateau.TAILLE_PLATEAU; j++) {
                const pion = plateau.plateau[i][j];
                if (!pion) continue;

                // Score de base pour chaque pièce
                let valeurPiece = pion.estDame ? facteurDame : 1;
                
                // Ajuste le score selon le joueur
                if (pion.couleur !== joueurInitial) {
                    valeurPiece = -valeurPiece;
                }

                // Bonus pour l'avancement des pions (pas pour les dames)
                if (!pion.estDame) {
                    const avancement = pion.couleur === 1 ? 
                        i / plateau.TAILLE_PLATEAU : 
                        (plateau.TAILLE_PLATEAU - 1 - i) / plateau.TAILLE_PLATEAU;
                    valeurPiece += avancement * facteurPosition;
                }

                // Bonus pour le contrôle du centre
                const distanceCentreX = Math.abs(j - plateau.TAILLE_PLATEAU / 2);
                const distanceCentreY = Math.abs(i - plateau.TAILLE_PLATEAU / 2);
                const bonusCentre = (plateau.TAILLE_PLATEAU / 2 - Math.max(distanceCentreX, distanceCentreY)) * facteurCentre;
                valeurPiece += bonusCentre;

                // Bonus pour les pions protégés
                if (!pion.estDame && this.estPionProtege(plateau, i, j)) {
                    valeurPiece += facteurProtection;
                }

                score += valeurPiece;
            }
        }

        // Bonus pour les prises disponibles
        const prisesDisponibles = plateau.getToutesPrisesObligatoires().length;
        if (plateau.joueurActuel === joueurInitial) {
            score += prisesDisponibles * 0.3;
        } else {
            score -= prisesDisponibles * 0.3;
        }

        return score;
    }

    estPionProtege(plateau, ligne, colonne) {
        const pion = plateau.plateau[ligne][colonne];
        if (!pion || pion.estDame) return false;

        const direction = pion.couleur === 1 ? 1 : -1;
        const colonneGauche = colonne - 1;
        const colonneDroite = colonne + 1;

        // Vérifie si le pion est sur le bord
        if (colonneGauche < 0 || colonneDroite >= plateau.TAILLE_PLATEAU) {
            return true;
        }

        // Vérifie si le pion est protégé par un autre pion allié
        const ligneArriere = ligne - direction;
        if (ligneArriere >= 0 && ligneArriere < plateau.TAILLE_PLATEAU) {
            const pionGauche = plateau.plateau[ligneArriere][colonneGauche];
            const pionDroit = plateau.plateau[ligneArriere][colonneDroite];
            if ((pionGauche && pionGauche.couleur === pion.couleur) ||
                (pionDroit && pionDroit.couleur === pion.couleur)) {
                return true;
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
}

module.exports = MinMax;