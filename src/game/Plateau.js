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
        const directions = pion.estDame ? [-1, 1] : (pion.couleur === 1 ? [1] : [-1]);

        for (const dLigne of directions) {
            for (const dColonne of [-1, 1]) {
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
        }

        return mouvements;
    }

    getPrisesPossibles(position, prisesAccumulees = []) {
        if (!position || !Array.isArray(position) || position.length !== 2) {
            return [];
        }

        const [ligne, colonne] = position;
        if (!this.estPositionValide([ligne, colonne])) {
            return [];
        }

        const pion = this.plateau[ligne][colonne];
        if (!pion || (prisesAccumulees.length === 0 && pion.couleur !== this.joueurActuel)) {
            return [];
        }

        const prises = [];
        const directions = pion.estDame ? [-1, 1] : (pion.couleur === 1 ? [1] : [-1]);

        for (const dLigne of directions) {
            for (const dColonne of [-1, 1]) {
                const lignePrise = ligne + dLigne;
                const colonnePrise = colonne + dColonne;
                const ligneArrivee = ligne + (dLigne * 2);
                const colonneArrivee = colonne + (dColonne * 2);

                if (this.estPositionValide([ligneArrivee, colonneArrivee]) && 
                    this.estPositionValide([lignePrise, colonnePrise]) &&
                    this.plateau[lignePrise][colonnePrise]?.couleur === (3 - pion.couleur) && 
                    !this.plateau[ligneArrivee][colonneArrivee] &&
                    !prisesAccumulees.some(p => p[0] === lignePrise && p[1] === colonnePrise)) {
                    
                    const nouvellesPrises = [...prisesAccumulees, [lignePrise, colonnePrise]];
                    
                    // Simule la prise pour vérifier les prises suivantes
                    const plateauTemp = this.copierPlateau();
                    plateauTemp.plateau[ligneArrivee][colonneArrivee] = plateauTemp.plateau[ligne][colonne];
                    plateauTemp.plateau[ligne][colonne] = null;
                    plateauTemp.plateau[lignePrise][colonnePrise] = null;
                    
                    const prisesSuivantes = plateauTemp.getPrisesPossibles(
                        [ligneArrivee, colonneArrivee],
                        nouvellesPrises
                    );

                    if (prisesSuivantes.length > 0) {
                        prises.push(...prisesSuivantes);
                    } else {
                        prises.push({
                            de: position,
                            vers: [ligneArrivee, colonneArrivee],
                            prises: nouvellesPrises
                        });
                    }
                }
            }
        }

        return prises;
    }

    deplacerPiece(mouvement) {
        if (!mouvement || !mouvement.de || !mouvement.vers || !Array.isArray(mouvement.de) || !Array.isArray(mouvement.vers)) {
            return false;
        }

        const { de, vers, prises = [] } = mouvement;
        const [ligneDepart, colonneDepart] = de;
        const [ligneArrivee, colonneArrivee] = vers;

        if (!this.estPositionValide(de) || !this.estPositionValide(vers)) {
            return false;
        }

        const pion = this.plateau[ligneDepart][colonneDepart];
        if (!pion || pion.couleur !== this.joueurActuel) {
            return false;
        }

        // Vérifie si le mouvement est valide
        const mouvementsValides = this.getMouvementsValides(de);
        const mouvementValide = mouvementsValides.find(m => 
            m.vers[0] === vers[0] && m.vers[1] === vers[1]
        );

        if (!mouvementValide) {
            return false;
        }

        // Effectue le mouvement
        this.plateau[ligneArrivee][colonneArrivee] = this.plateau[ligneDepart][colonneDepart];
        this.plateau[ligneDepart][colonneDepart] = null;

        // Gère les prises
        if (prises && prises.length > 0) {
            prises.forEach(([lignePrise, colonnePrise]) => {
                if (this.estPositionValide([lignePrise, colonnePrise])) {
                    this.plateau[lignePrise][colonnePrise] = null;
                    this.statistiques.prises[this.joueurActuel]++;
                }
            });
        }

        // Vérifie la promotion en dame
        if (!this.plateau[ligneArrivee][colonneArrivee].estDame) {
            if ((this.joueurActuel === 1 && ligneArrivee === this.TAILLE_PLATEAU - 1) ||
                (this.joueurActuel === 2 && ligneArrivee === 0)) {
                this.plateau[ligneArrivee][colonneArrivee].estDame = true;
            }
        }

        this.statistiques.nbCoups++;

        // Change de joueur si pas de prise supplémentaire possible
        if (prises.length === 0 || this.getPrisesPossibles([ligneArrivee, colonneArrivee]).length === 0) {
            this.joueurActuel = 3 - this.joueurActuel;
        }

        return true;
    }

    estPositionValide([ligne, colonne]) {
        return ligne >= 0 && 
               ligne < this.TAILLE_PLATEAU && 
               colonne >= 0 && 
               colonne < this.TAILLE_PLATEAU &&
               (ligne + colonne) % 2 === 1;
    }

    getToutesPrisesObligatoires() {
        const prises = [];
        for (let i = 0; i < this.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < this.TAILLE_PLATEAU; j++) {
                if (this.plateau[i][j]?.couleur === this.joueurActuel) {
                    const prisesPosition = this.getPrisesPossibles([i, j]);
                    prises.push(...prisesPosition);
                }
            }
        }
        return prises;
    }

    estPartieTerminee() {
        // Vérifie s'il reste des pions aux deux joueurs
        let pionsBlancs = false;
        let pionsNoirs = false;
        
        for (let i = 0; i < this.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < this.TAILLE_PLATEAU; j++) {
                const pion = this.plateau[i][j];
                if (pion) {
                    if (pion.couleur === 1) pionsNoirs = true;
                    if (pion.couleur === 2) pionsBlancs = true;
                    if (pionsBlancs && pionsNoirs) break;
                }
            }
            if (pionsBlancs && pionsNoirs) break;
        }

        if (!pionsBlancs || !pionsNoirs) {
            return true;
        }

        // Vérifie si le joueur actuel peut bouger
        for (let i = 0; i < this.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < this.TAILLE_PLATEAU; j++) {
                if (this.plateau[i][j]?.couleur === this.joueurActuel) {
                    if (this.getMouvementsValides([i, j]).length > 0) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    getGagnant() {
        if (!this.estPartieTerminee()) {
            return null;
        }

        // Compte les pions restants
        let pionsBlancs = 0;
        let pionsNoirs = 0;
        
        for (let i = 0; i < this.TAILLE_PLATEAU; i++) {
            for (let j = 0; j < this.TAILLE_PLATEAU; j++) {
                const pion = this.plateau[i][j];
                if (pion) {
                    if (pion.couleur === 1) pionsNoirs++;
                    if (pion.couleur === 2) pionsBlancs++;
                }
            }
        }

        // Si un joueur n'a plus de pions ou ne peut plus bouger
        if (pionsBlancs === 0 || (this.joueurActuel === 2 && this.getToutesPrisesObligatoires().length === 0)) {
            return 1; // Les noirs gagnent
        }
        if (pionsNoirs === 0 || (this.joueurActuel === 1 && this.getToutesPrisesObligatoires().length === 0)) {
            return 2; // Les blancs gagnent
        }

        return 0; // Match nul
    }

    getStatistiques() {
        return this.statistiques;
    }

    copierPlateau() {
        const nouveauPlateau = new Plateau();
        nouveauPlateau.plateau = this.plateau.map(ligne => 
            ligne.map(pion => 
                pion ? Object.assign(new Pion(pion.couleur), pion) : null
            )
        );
        nouveauPlateau.joueurActuel = this.joueurActuel;
        nouveauPlateau.statistiques = JSON.parse(JSON.stringify(this.statistiques));
        return nouveauPlateau;
    }
}

module.exports = Plateau;
