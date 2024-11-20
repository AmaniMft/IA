const Plateau = require('./Plateau');

class Jeu {
    constructor() {
        this.plateau = new Plateau();
        this.joueurActuel = 1; // 1: Noir, 2: Blanc
        this.partieTerminee = false;
    }
}

module.exports = Jeu;