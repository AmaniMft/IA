class Pion {
    constructor(couleur) {
        this.couleur = couleur; // 1: Noir, 2: Blanc
        this.estDame = false;
    }

    promouvoir() {
        this.estDame = true;
    }
}

module.exports = Pion;