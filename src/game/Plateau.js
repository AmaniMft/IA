// src/game/Plateau.js
const Pion = require('./Pion');
const Dame = require('./Dame');

class Plateau {
    constructor() {
        this.TAILLE_PLATEAU = 8;
        this.plateau = this.creerPlateau();
    }

    creerPlateau() {
        const plateau = Array(this.TAILLE_PLATEAU).fill().map(() => Array(this.TAILLE_PLATEAU).fill(null));

        // Place les pions noirs (1)
        for (let ligne = 0; ligne < 3; ligne++) {
            for (let colonne = 0; colonne < this.TAILLE_PLATEAU; colonne++) {
                if ((ligne + colonne) % 2 === 1) {
                    plateau[ligne][colonne] = new Pion(1);
                }
            }
        }

        // Place les pions blancs (2)
        for (let ligne = 5; ligne < this.TAILLE_PLATEAU; ligne++) {
            for (let colonne = 0; colonne < this.TAILLE_PLATEAU; colonne++) {
                if ((ligne + colonne) % 2 === 1) {
                    plateau[ligne][colonne] = new Pion(2);
                }
            }
        }

        return plateau;
    }

    afficherPlateau() {
        console.log('\nPlateau actuel :');
        for (let ligne = 0; ligne < this.TAILLE_PLATEAU; ligne++) {
            console.log(this.plateau[ligne].map(caseJeu => {
                if (!caseJeu) return '.';
                if (caseJeu.estDame) return caseJeu.couleur === 1 ? '*' : '#'; // * pour Dame noire, # pour Dame blanche
                return caseJeu.couleur === 1 ? 'N' : 'B'; // N pour pion noir, B pour pion blanc
            }).join(' '));
        }
    }
    

    copier() {
        const nouveauPlateau = new Plateau();
        nouveauPlateau.plateau = this.plateau.map(row => row.map(piece => piece ? { ...piece } : null));
        return nouveauPlateau;
    }

    getMouvementsValides(ligne, colonne) {
        const piece = this.plateau[ligne][colonne];
        if (!piece) return [];
    
        const mouvements = [];
        const directions = piece.couleur === 1 ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];
    
        // Vérifier les captures possibles
        directions.forEach(([dx, dy]) => {
            const cibleLigne = ligne + dx;
            const cibleColonne = colonne + dy;
            const sautLigne = ligne + 2 * dx;
            const sautColonne = colonne + 2 * dy;
    
            if (
                this.estDansLesLimites(cibleLigne, cibleColonne) &&
                this.plateau[cibleLigne][cibleColonne] && // Case intermédiaire occupée
                this.plateau[cibleLigne][cibleColonne].couleur !== piece.couleur && // Pièce adverse
                this.estDansLesLimites(sautLigne, sautColonne) &&
                !this.plateau[sautLigne][sautColonne] // Case de destination vide
            ) {
                mouvements.push([sautLigne, sautColonne]);
            }
        });
    
        // Ajouter les mouvements simples (si aucune capture obligatoire n'est présente)
        if (mouvements.length === 0) {
            directions.forEach(([dx, dy]) => {
                const nouvelleLigne = ligne + dx;
                const nouvelleColonne = colonne + dy;
                if (this.estDansLesLimites(nouvelleLigne, nouvelleColonne) && !this.plateau[nouvelleLigne][nouvelleColonne]) {
                    mouvements.push([nouvelleLigne, nouvelleColonne]);
                }
            });
        }
    
        return mouvements;
    }
    

    getMouvementsTous(joueur) {
        const mouvements = [];
        for (let ligne = 0; ligne < this.TAILLE_PLATEAU; ligne++) {
            for (let colonne = 0; colonne < this.TAILLE_PLATEAU; colonne++) {
                const piece = this.plateau[ligne][colonne];
                if (piece && piece.couleur === joueur) {
                    const valides = this.getMouvementsValides(ligne, colonne);
                    valides.forEach(m => mouvements.push([[ligne, colonne], m]));
                }
            }
        }
        return mouvements;
    }

    estDansLesLimites(x, y) {
        return x >= 0 && x < this.TAILLE_PLATEAU && y >= 0 && y < this.TAILLE_PLATEAU;
    }

    deplacerPiece(depart, arrivee) {
        const [ligneDepart, colonneDepart] = depart;
        const [ligneArrivee, colonneArrivee] = arrivee;
    
        const piece = this.plateau[ligneDepart][colonneDepart];
        if (!piece || !this.estMouvementValide(depart, arrivee)) return false;
    
        // Vérifier si c'est une capture
        const diffLigne = ligneArrivee - ligneDepart;
        const diffColonne = colonneArrivee - colonneDepart;
        if (Math.abs(diffLigne) === 2 && Math.abs(diffColonne) === 2) {
            const ligneCapture = ligneDepart + diffLigne / 2;
            const colonneCapture = colonneDepart + diffColonne / 2;
            this.plateau[ligneCapture][colonneCapture] = null; // Supprimer la pièce capturée
        }
    
        this.plateau[ligneArrivee][colonneArrivee] = piece;
        this.plateau[ligneDepart][colonneDepart] = null;
    
        // Vérifie si la pièce doit être promue en Dame
        if ((piece.couleur === 1 && ligneArrivee === this.TAILLE_PLATEAU - 1) ||
            (piece.couleur === 2 && ligneArrivee === 0)) {
            piece.estDame = true;
        }
    
        return true;
    }
    

    estMouvementValide(depart, arrivee) {
        const [ligneDepart, colonneDepart] = depart;
        const mouvementsValides = this.getMouvementsValides(ligneDepart, colonneDepart);
        return mouvementsValides.some(([ligne, colonne]) => ligne === arrivee[0] && colonne === arrivee[1]);
    }
}

module.exports = Plateau;