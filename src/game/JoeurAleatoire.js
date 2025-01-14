// JouerAleatoire.js
class JouerAleatoire {
    constructor(couleur) {
        this.couleur = couleur;
    }

    jouer(plateau) {
        const mouvements = plateau.getMouvementsTous(this.couleur);

        if (mouvements.length === 0) {
            return null; // Aucun mouvement possible
        }

        // Sélectionner un mouvement aléatoire
        const choix = Math.floor(Math.random() * mouvements.length);
        return mouvements[choix];
    }
}

module.exports = JouerAleatoire;
