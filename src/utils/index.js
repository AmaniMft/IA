
const Plateau = require('./game/Plateau');

// Crée un nouveau plateau
const plateau = new Plateau();

// Affiche le plateau initial
console.log("Plateau initial :");
plateau.afficherPlateau();

// Fait un mouvement
console.log("\nAprès le mouvement [2,1] -> [3,2] :");
plateau.deplacerPiece([2, 1], [3, 2]);
plateau.afficherPlateau();