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
        const prises = this.getPrisesPossibles([ligne, colonne]);
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

    getPrisesPossibles(position) {
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
                prises.push({
                    de: [ligne, colonne],
                    vers: [nouvLigne, nouvColonne],
                    prises: [[lignePrise, colonnePrise]]
                });

                // Vérifie les prises multiples
                const prisesSuivantes = this.getPrisesPossibles([nouvLigne, nouvColonne]);
                for (const priseSuivante of prisesSuivantes) {
                    prises.push({
                        de: [ligne, colonne],
                        vers: priseSuivante.vers,
                        prises: [[lignePrise, colonnePrise], ...priseSuivante.prises]
                    });
                }
            }
        }

        return prises;
    }

    estPartieTerminee() {
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

        // Vérifie si un joueur n'a plus de pions
        if (pionsNoirs === 0 || pionsBlancs === 0) {
            return true;
        }

        // Vérifie si le joueur actuel a des mouvements possibles
        for (let i = 0; i < this.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < this.TAILLE_PLATEAU; j++) {
                const pion = this.plateau[i][j];
                if (pion && pion.couleur === this.joueurActuel) {
                    if (this.getMouvementsValides([i, j]).length > 0) {
                        return false;
                    }
                }
            }
        }

        return true;
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

    deplacerPiece(mouvement) {
        if (!mouvement || !mouvement.de || !mouvement.vers || !Array.isArray(mouvement.de) || !Array.isArray(mouvement.vers)) {
            throw new Error('Mouvement invalide');
        }

        const { de, vers, prises = [] } = mouvement;
        const [ligneDepart, colonneDepart] = de;
        const [ligneArrivee, colonneArrivee] = vers;

        // Vérifie si la position de départ est valide
        if (!this.estPositionValide(de)) {
            throw new Error('Position de départ invalide');
        }

        // Vérifie si la position d'arrivée est valide
        if (!this.estPositionValide(vers)) {
            throw new Error('Position d\'arrivée invalide');
        }

        // Vérifie si la pièce appartient au joueur actuel
        const pion = this.plateau[ligneDepart][colonneDepart];
        if (!pion || pion.couleur !== this.joueurActuel) {
            throw new Error('Pièce invalide');
        }

        // Vérifie si le mouvement est dans la liste des mouvements valides
        const mouvementsValides = this.getMouvementsValides(de);
        const mouvementValide = mouvementsValides.find(m => 
            m.vers[0] === vers[0] && 
            m.vers[1] === vers[1] && 
            m.prises.length === prises.length &&
            m.prises.every((p, i) => 
                p[0] === prises[i][0] && p[1] === prises[i][1]
            )
        );

        if (!mouvementValide) {
            // Vérifie si c'est une prise
            const prisesValides = this.getPrisesPossibles(de);
            const priseValide = prisesValides.find(m => 
                m.vers[0] === vers[0] && 
                m.vers[1] === vers[1] && 
                m.prises.length === prises.length &&
                m.prises.every((p, i) => 
                    p[0] === prises[i][0] && p[1] === prises[i][1]
                )
            );

            if (!priseValide) {
                throw new Error('Mouvement non autorisé');
            }
        }

        // Déplace la pièce
        this.plateau[ligneArrivee][colonneArrivee] = this.plateau[ligneDepart][colonneDepart];
        this.plateau[ligneDepart][colonneDepart] = null;

        // Effectue les prises
        for (const [lignePrise, colonnePrise] of prises) {
            this.plateau[lignePrise][colonnePrise] = null;
            this.statistiques.prises[this.joueurActuel]++;
        }

        // Vérifie la promotion en dame
        if (this.doitEtrePromu(this.plateau[ligneArrivee][colonneArrivee], ligneArrivee)) {
            this.plateau[ligneArrivee][colonneArrivee].promouvoir();
        }

        // Met à jour les statistiques
        this.statistiques.nbCoups++;

        // Vérifie s'il y a des prises supplémentaires possibles
        const prisesSupplementaires = this.getPrisesPossibles([ligneArrivee, colonneArrivee]);
        const peutContinuer = prisesSupplementaires.length > 0 && prises.length > 0;

        // Change de joueur si pas de prise multiple possible
        if (!peutContinuer) {
            this.joueurActuel = this.joueurActuel === 1 ? 2 : 1;
        }

        return peutContinuer;
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

    copierPlateau() {
        const nouveauPlateau = new Plateau();
        nouveauPlateau.plateau = this.plateau.map(ligne => 
            ligne.map(pion => {
                if (!pion) return null;
                const nouveauPion = new Pion(pion.couleur);
                if (pion.estDame) nouveauPion.promouvoir();
                return nouveauPion;
            })
        );
        nouveauPlateau.joueurActuel = this.joueurActuel;
        nouveauPlateau.statistiques = JSON.parse(JSON.stringify(this.statistiques));
        nouveauPlateau.mouvementsObligatoires = [...this.mouvementsObligatoires];
        return nouveauPlateau;
    }
}

module.exports = Plateau;
