const Pion = require('./Pion');

class Plateau {
    constructor() {
        this.TAILLE_PLATEAU = 10;
        this.plateau = this.creerPlateau();
        this.joueurActuel = 1; // 1: Noir, 2: Blanc
        this.mouvementsObligatoires = [];
        this.statistiques = {
            nbCoups: 0,
            prises: { 1: 0, 2: 0 },
            tempsReflexion: { 1: 0, 2: 0 }
        };
        this.historique = []; // Pour annuler les coups
    }

    creerPlateau() {
        const plateau = Array(this.TAILLE_PLATEAU).fill().map(() => Array(this.TAILLE_PLATEAU).fill(null));
        
        // Placement des pions noirs (en haut)
        for (let ligne = 0; ligne < 4; ligne++) {
            for (let colonne = 0; colonne < this.TAILLE_PLATEAU; colonne++) {
                if ((ligne + colonne) % 2 === 1) {
                    plateau[ligne][colonne] = new Pion(1);
                }
            }
        }
        
        // Placement des pions blancs (en bas)
        for (let ligne = this.TAILLE_PLATEAU - 4; ligne < this.TAILLE_PLATEAU; ligne++) {
            for (let colonne = 0; colonne < this.TAILLE_PLATEAU; colonne++) {
                if ((ligne + colonne) % 2 === 1) {
                    plateau[ligne][colonne] = new Pion(2);
                }
            }
        }
        
        return plateau;
    }

    getMouvementsValides(position) {
        if (!position || !Array.isArray(position) || position.length !== 2) {
            return [];
        }

        const [ligne, colonne] = position;
        if (!this.estPositionValide([ligne, colonne])) {
            return [];
        }

        const pion = this.plateau[ligne][colonne];
        if (!pion || pion.couleur !== this.joueurActuel) {
            return [];
        }

        // Vérifie d'abord s'il y a des prises obligatoires
        const prises = this.getPrisesPossibles([ligne, colonne], false);
        if (prises.length > 0) {
            return prises;
        }

        const mouvements = [];
        const directions = pion.estDame ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
            pion.couleur === 1 ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];

        for (const [dLigne, dColonne] of directions) {
            const nouvelleLigne = ligne + dLigne;
            const nouvelleColonne = colonne + dColonne;

            if (this.estPositionValide([nouvelleLigne, nouvelleColonne]) && 
                !this.plateau[nouvelleLigne][nouvelleColonne]) {
                mouvements.push({
                    de: [ligne, colonne],
                    vers: [nouvelleLigne, nouvelleColonne],
                    prises: []
                });
            }
        }

        return mouvements;
    }

    getPrisesPossibles(position, checkMultiples = true) {
        if (!position || !Array.isArray(position) || position.length !== 2) {
            return [];
        }

        const [ligne, colonne] = position;
        if (!this.estPositionValide([ligne, colonne])) {
            return [];
        }

        const pion = this.plateau[ligne][colonne];
        if (!pion || pion.couleur !== this.joueurActuel) {
            return [];
        }

        const prises = [];
        const directions = pion.estDame ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
            pion.couleur === 1 ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];

        for (const [dLigne, dColonne] of directions) {
            const nouvLigne = ligne + 2 * dLigne;
            const nouvColonne = colonne + 2 * dColonne;
            const lignePrise = ligne + dLigne;
            const colonnePrise = colonne + dColonne;

            if (this.estPositionValide([nouvLigne, nouvColonne]) &&
                this.plateau[lignePrise][colonnePrise]?.couleur === (3 - pion.couleur) &&
                !this.plateau[nouvLigne][nouvColonne]) {
                
                // Prise simple
                prises.push({
                    de: [ligne, colonne],
                    vers: [nouvLigne, nouvColonne],
                    prises: [[lignePrise, colonnePrise]]
                });

                // Vérifie les prises multiples seulement si demandé
                if (checkMultiples) {
                    const prisesSuivantes = this.getPrisesPossibles([nouvLigne, nouvColonne], false);
                    for (const priseSuivante of prisesSuivantes) {
                        prises.push({
                            de: [ligne, colonne],
                            vers: priseSuivante.vers,
                            prises: [[lignePrise, colonnePrise], ...priseSuivante.prises]
                        });
                    }
                }
            }
        }

        return prises;
    }

    estPartieTerminee() {
        // Compte les pions de chaque joueur
        let pionsNoirs = 0;
        let pionsBlancs = 0;

        for (let i = 0; i < this.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < this.TAILLE_PLATEAU; j++) {
                const pion = this.plateau[i][j];
                if (pion) {
                    if (pion.couleur === 1) pionsNoirs++;
                    else if (pion.couleur === 2) pionsBlancs++;
                }
            }
        }

        // Vérifie si un joueur n'a plus de pions
        if (pionsNoirs === 0 || pionsBlancs === 0) {
            return true;
        }

        // Vérifie si le joueur actuel a des mouvements possibles
        let mouvementPossible = false;
        for (let i = 0; i < this.TAILLE_PLATEAU && !mouvementPossible; i++) {
            for (let j = 0; j < this.TAILLE_PLATEAU && !mouvementPossible; j++) {
                const pion = this.plateau[i][j];
                if (pion && pion.couleur === this.joueurActuel) {
                    // Vérifier les prises possibles
                    const prises = this.getPrisesPossibles([i, j], false);
                    if (prises.length > 0) {
                        mouvementPossible = true;
                        break;
                    }

                    // Vérifier les mouvements simples
                    const directions = pion.estDame ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
                        pion.couleur === 1 ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];

                    for (const [dLigne, dColonne] of directions) {
                        const nouvelleLigne = i + dLigne;
                        const nouvelleColonne = j + dColonne;

                        if (this.estPositionValide([nouvelleLigne, nouvelleColonne]) && 
                            !this.plateau[nouvelleLigne][nouvelleColonne]) {
                            mouvementPossible = true;
                            break;
                        }
                    }
                }
            }
        }

        return !mouvementPossible;
    }

    getTousMouvementsPossibles() {
        const prisesObligatoires = this.getToutesPrisesObligatoires();
        if (prisesObligatoires.length > 0) {
            return prisesObligatoires;
        }

        const mouvements = [];
        for (let i = 0; i < this.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < this.TAILLE_PLATEAU; j++) {
                const pion = this.plateau[i][j];
                if (pion && pion.couleur === this.joueurActuel) {
                    const mouvementsPion = this.getMouvementsValides([i, j]);
                    mouvements.push(...mouvementsPion);
                }
            }
        }
        return mouvements;
    }

    getToutesPrisesObligatoires() {
        const prises = [];
        for (let i = 0; i < this.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < this.TAILLE_PLATEAU; j++) {
                const pion = this.plateau[i][j];
                if (pion && pion.couleur === this.joueurActuel) {
                    const prisesPion = this.getPrisesPossibles([i, j]);
                    if (prisesPion.length > 0) {
                        prises.push(...prisesPion);
                    }
                }
            }
        }
        return prises;
    }

    getMouvementsPossiblesPourJoueur(joueur) {
        const mouvements = [];
        const prises = [];

        // Parcourir toutes les cases du plateau
        for (let ligne = 0; ligne < this.TAILLE_PLATEAU; ligne++) {
            for (let colonne = 0; colonne < this.TAILLE_PLATEAU; colonne++) {
                const piece = this.plateau[ligne][colonne];
                if (piece && piece.couleur === joueur) {
                    // Vérifier les prises possibles pour cette pièce
                    const prisesPosition = this.getPrisesPossibles([ligne, colonne]);
                    if (prisesPosition.length > 0) {
                        prises.push(...prisesPosition);
                    }
                }
            }
        }

        // S'il y a des prises possibles, elles sont obligatoires
        if (prises.length > 0) {
            return prises;
        }

        // S'il n'y a pas de prises, chercher les mouvements simples
        for (let ligne = 0; ligne < this.TAILLE_PLATEAU; ligne++) {
            for (let colonne = 0; colonne < this.TAILLE_PLATEAU; colonne++) {
                const piece = this.plateau[ligne][colonne];
                if (piece && piece.couleur === joueur) {
                    const mouvementsPosition = this.getMouvementsValides([ligne, colonne]);
                    mouvements.push(...mouvementsPosition);
                }
            }
        }

        return mouvements;
    }

    deplacerPiece(mouvement) {
        const { de, vers, prises = [] } = mouvement;
        
        // Sauvegarder l'état actuel avant le mouvement
        this.historique.push({
            plateau: this.clonePlateau(),
            joueurActuel: this.joueurActuel,
            mouvementsObligatoires: [...this.mouvementsObligatoires],
            statistiques: { ...this.statistiques }
        });

        // Effectuer le mouvement
        const piece = this.plateau[de[0]][de[1]];
        this.plateau[de[0]][de[1]] = null;
        this.plateau[vers[0]][vers[1]] = piece;

        // Mettre à jour la position de la pièce
        piece.ligne = vers[0];
        piece.colonne = vers[1];

        // Gérer les prises
        if (prises && prises.length > 0) {
            prises.forEach(prise => {
                this.plateau[prise[0]][prise[1]] = null;
                this.statistiques.prises[this.joueurActuel]++;
            });
        }

        // Promotion en dame si nécessaire
        if (this.doitEtrePromu(this.plateau[vers[0]][vers[1]], vers[0])) {
            this.plateau[vers[0]][vers[1]].promouvoir();
        }

        // Mettre à jour les statistiques
        this.statistiques.nbCoups++;

        // Changer de joueur
        this.joueurActuel = this.joueurActuel === 1 ? 2 : 1;

        // Mettre à jour les mouvements obligatoires
        this.mouvementsObligatoires = this.calculerMouvementsObligatoires();

        return true;
    }

    annulerDernierCoup() {
        if (this.historique.length === 0) {
            return false;
        }

        // Restaurer l'état précédent
        const dernierEtat = this.historique.pop();
        this.plateau = dernierEtat.plateau;
        this.joueurActuel = dernierEtat.joueurActuel;
        this.mouvementsObligatoires = dernierEtat.mouvementsObligatoires;
        this.statistiques = dernierEtat.statistiques;

        return true;
    }

    clonePlateau() {
        // Vérifier si this.plateau existe
        if (!this.plateau) {
            return Array(this.TAILLE_PLATEAU)
                .fill()
                .map(() => Array(this.TAILLE_PLATEAU).fill(null));
        }

        // Créer un nouveau tableau avec la bonne taille
        const nouveauPlateau = Array(this.TAILLE_PLATEAU)
            .fill()
            .map(() => Array(this.TAILLE_PLATEAU).fill(null));

        // Copier les pions existants
        for (let i = 0; i < this.TAILLE_PLATEAU; i++) {
            // Vérifier si la ligne existe
            if (!this.plateau[i]) continue;
            
            for (let j = 0; j < this.TAILLE_PLATEAU; j++) {
                // Vérifier si la case existe
                if (!this.plateau[i][j]) continue;
                
                const pionOriginal = this.plateau[i][j];
                if (pionOriginal) {
                    // Créer une copie profonde du pion
                    const pionCopie = new Pion(pionOriginal.couleur);
                    pionCopie.estDame = pionOriginal.estDame;
                    pionCopie.ligne = i;
                    pionCopie.colonne = j;
                    nouveauPlateau[i][j] = pionCopie;
                }
            }
        }

        return nouveauPlateau;
    }

    clone() {
        const nouveauPlateau = new Plateau();
        nouveauPlateau.TAILLE_PLATEAU = this.TAILLE_PLATEAU;
        nouveauPlateau.plateau = this.clonePlateau();
        nouveauPlateau.joueurActuel = this.joueurActuel;
        nouveauPlateau.mouvementsObligatoires = [...this.mouvementsObligatoires];
        nouveauPlateau.statistiques = JSON.parse(JSON.stringify(this.statistiques));
        nouveauPlateau.historique = [];  // Ne pas copier l'historique
        return nouveauPlateau;
    }

    copierPlateau() {
        const nouveauPlateau = new Plateau();
        nouveauPlateau.TAILLE_PLATEAU = this.TAILLE_PLATEAU;
        nouveauPlateau.plateau = this.clonePlateau();
        nouveauPlateau.joueurActuel = this.joueurActuel;
        nouveauPlateau.mouvementsObligatoires = [...this.mouvementsObligatoires];
        nouveauPlateau.statistiques = JSON.parse(JSON.stringify(this.statistiques));
        return nouveauPlateau;
    }

    doitEtrePromu(pion, ligne) {
        return !pion.estDame && (
            (pion.couleur === 1 && ligne === this.TAILLE_PLATEAU - 1) ||
            (pion.couleur === 2 && ligne === 0)
        );
    }

    getGagnant() {
        if (!this.estPartieTerminee()) {
            return null;
        }

        let pionsNoirs = 0;
        let pionsBlancs = 0;

        // Compte les pions de chaque couleur
        for (let i = 0; i < this.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < this.TAILLE_PLATEAU; j++) {
                const pion = this.plateau[i][j];
                if (pion) {
                    if (pion.couleur === 1) pionsNoirs++;
                    else pionsBlancs++;
                }
            }
        }

        if (pionsNoirs === 0) return 2;
        if (pionsBlancs === 0) return 1;

        // Si un joueur n'a plus de mouvements possibles
        let mouvementsPossibles = false;
        for (let i = 0; i < this.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < this.TAILLE_PLATEAU; j++) {
                const pion = this.plateau[i][j];
                if (pion && pion.couleur === this.joueurActuel) {
                    if (this.getMouvementsValides([i, j]).length > 0) {
                        mouvementsPossibles = true;
                        break;
                    }
                }
            }
            if (mouvementsPossibles) break;
        }

        return mouvementsPossibles ? null : (3 - this.joueurActuel);
    }

    estPositionValide([ligne, colonne]) {
        return ligne >= 0 && ligne < this.TAILLE_PLATEAU &&
               colonne >= 0 && colonne < this.TAILLE_PLATEAU;
    }

    getStatistiques() {
        return {
            nbCoups: this.statistiques.nbCoups,
            prises: { ...this.statistiques.prises },
            tempsReflexion: { ...this.statistiques.tempsReflexion }
        };
    }

    calculerMouvementsObligatoires() {
        const mouvementsObligatoires = [];
        const pieces = this.getPiecesJoueur(this.joueurActuel);

        // Vérifier les prises possibles pour chaque pièce
        pieces.forEach(piece => {
            const prises = this.getPrisesPossibles([piece.ligne, piece.colonne]);
            if (prises.length > 0) {
                mouvementsObligatoires.push(...prises);
            }
        });

        return mouvementsObligatoires;
    }

    getPiecesJoueur(joueur) {
        const pieces = [];
        for (let i = 0; i < this.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < this.TAILLE_PLATEAU; j++) {
                if (this.plateau[i][j] && this.plateau[i][j].couleur === joueur) {
                    pieces.push({
                        ligne: i,
                        colonne: j,
                        ...this.plateau[i][j]
                    });
                }
            }
        }
        return pieces;
    }
}

module.exports = Plateau;
