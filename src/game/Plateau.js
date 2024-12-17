// src/game/Plateau.js
class Plateau {
    constructor() {
        this.TAILLE_PLATEAU = 8;
        this.plateau = this.creerPlateau();
    }

    creerPlateau() {
        // Crée un tableau 8x8 vide
        const plateau = Array(this.TAILLE_PLATEAU).fill().map(() => Array(this.TAILLE_PLATEAU).fill(0));
        
        // Place les pions noirs (1)
        for (let ligne = 0; ligne < 3; ligne++) {
            for (let colonne = 0; colonne < this.TAILLE_PLATEAU; colonne++) {
                if ((ligne + colonne) % 2 === 1) {
                    plateau[ligne][colonne] = 1;
                }
            }
        }
        
        // Place les pions blancs (2)
        for (let ligne = 5; ligne < this.TAILLE_PLATEAU; ligne++) {
            for (let colonne = 0; colonne < this.TAILLE_PLATEAU; colonne++) {
                if ((ligne + colonne) % 2 === 1) {
                    plateau[ligne][colonne] = 2;
                }
            }
        }
        
        return plateau;
    }

    afficherPlateau() {
        for (let ligne = 0; ligne < this.TAILLE_PLATEAU; ligne++) {
            console.log(this.plateau[ligne].join(' '));
        }

    }

    copier() {
        const nouveauPlateau = new Plateau();
        nouveauPlateau.plateau = this.plateau.map(row => [...row]);
        return nouveauPlateau;
    }
    

    getMouvementsValides(ligne, colonne) {
        const mouvements = [];
        const piece = this.plateau[ligne][colonne];
        
        if (!piece) return mouvements;

        // Direction du mouvement selon la couleur
        const directions = piece === 1 ? [1] : [-1];  // Noir(1) va vers le bas(+1), Blanc(2) vers le haut(-1)

        // Vérifier les mouvements simples
        for (const direction of directions) {
            const nouvelleLigne = ligne + direction;
            if (nouvelleLigne >= 0 && nouvelleLigne < this.TAILLE_PLATEAU) {
                // Vérifier diagonale gauche
                if (colonne - 1 >= 0 && this.plateau[nouvelleLigne][colonne - 1] === 0) {
                    mouvements.push([nouvelleLigne, colonne - 1]);
                }
                // Vérifier diagonale droite
                if (colonne + 1 < this.TAILLE_PLATEAU && this.plateau[nouvelleLigne][colonne + 1] === 0) {
                    mouvements.push([nouvelleLigne, colonne + 1]);
                }
            }
        }

        return mouvements;
    }

    estMouvementValide(depart, arrivee) {
        const [ligneDepart, colonneDepart] = depart;
        const mouvementsValides = this.getMouvementsValides(ligneDepart, colonneDepart);
        return mouvementsValides.some(([ligne, colonne]) => 
            ligne === arrivee[0] && colonne === arrivee[1]
        );
    }

    getMouvementsTous(joueur) {
        const mouvements = [];
        for (let ligne = 0; ligne < this.TAILLE_PLATEAU; ligne++) {
            for (let colonne = 0; colonne < this.TAILLE_PLATEAU; colonne++) {
                if (this.plateau[ligne][colonne] === joueur) {
                    const valides = this.getMouvementsValides(ligne, colonne);
                    valides.forEach(m => mouvements.push([[ligne, colonne], m]));
                }
            }
        }
        return mouvements;
    }
    

    deplacerPiece(depart, arrivee) {
        if (!this.estMouvementValide(depart, arrivee)) {
            return false;
        }

        const [ligneDepart, colonneDepart] = depart;
        const [ligneArrivee, colonneArrivee] = arrivee;

        // Effectue le déplacement
        this.plateau[ligneArrivee][colonneArrivee] = this.plateau[ligneDepart][colonneDepart];
        this.plateau[ligneDepart][colonneDepart] = 0;

        return true;
    }
}

module.exports = Plateau;
