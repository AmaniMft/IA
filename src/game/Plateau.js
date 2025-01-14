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

    estPartieTerminee() {
        // Vérifie si un joueur n'a plus de pièces
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

        if (pionsNoirs === 0 || pionsBlancs === 0) {
            return true;
        }

        // Vérifie si le joueur actuel ne peut plus bouger
        const mouvementsPossibles = this.getTousMouvementsPossibles();
        return mouvementsPossibles.length === 0;
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
        const { de, vers, prises } = mouvement;
        const [ligneDepart, colonneDepart] = de;
        const [ligneArrivee, colonneArrivee] = vers;

        // Déplace la pièce
        const pion = this.plateau[ligneDepart][colonneDepart];
        this.plateau[ligneArrivee][colonneArrivee] = pion;
        this.plateau[ligneDepart][colonneDepart] = null;

        // Effectue les prises
        for (const prise of prises) {
            const [lignePrise, colonnePrise] = prise;
            this.plateau[lignePrise][colonnePrise] = null;
            this.statistiques.prises[this.joueurActuel]++;
        }

        // Vérifie la promotion en dame
        if (this.doitEtrePromu(pion, ligneArrivee)) {
            pion.promouvoir();
        }

        // Met à jour les statistiques
        this.statistiques.nbCoups++;

        // Change de joueur si pas de prise multiple possible
        const prisesSupplementaires = this.getPrisesPossibles([ligneArrivee, colonneArrivee]);
        if (prisesSupplementaires.length === 0 || prises.length === 0) {
            this.joueurActuel = this.joueurActuel === 1 ? 2 : 1;
        }

        return prisesSupplementaires.length > 0;
    }

    doitEtrePromu(pion, ligne) {
        return (pion.couleur === 1 && ligne === this.TAILLE_PLATEAU - 1) ||
               (pion.couleur === 2 && ligne === 0);
    }

    getGagnant() {
        if (!this.estPartieTerminee()) {
            return null;
        }

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

        if (pionsNoirs === 0) return 2;
        if (pionsBlancs === 0) return 1;

        // Si le joueur actuel ne peut pas bouger, l'autre joueur gagne
        const mouvementsPossibles = this.getTousMouvementsPossibles();
        if (mouvementsPossibles.length === 0) {
            return this.joueurActuel === 1 ? 2 : 1;
        }

        return null;
    }

    estPositionValide([ligne, colonne]) {
        return ligne >= 0 && 
               ligne < this.TAILLE_PLATEAU && 
               colonne >= 0 && 
               colonne < this.TAILLE_PLATEAU &&
               (ligne + colonne) % 2 === 1;
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
