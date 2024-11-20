const Plateau = require('../src/game/Plateau');

// Fonction pour tester l'initialisation du plateau
function testCreationPlateau() {
    const plateau = new Plateau();

    // Test de la taille du plateau
    if (plateau.TAILLE_PLATEAU !== 8) {
        console.log("Échec : la taille du plateau n'est pas correcte.");
    } else {
        console.log("Succès : la taille du plateau est correcte.");
    }

    // Test des positions initiales des pions noirs
    if (plateau.plateau[0][1] !== 1) {
        console.log("Échec : la position (0,1) devrait contenir un pion noir.");
    } else {
        console.log("Succès : la position (0,1) contient un pion noir.");
    }

    // Test des positions initiales des pions blancs
    if (plateau.plateau[7][0] !== 2) {
        console.log("Échec : la position (7,0) devrait contenir un pion blanc.");
    } else {
        console.log("Succès : la position (7,0) contient un pion blanc.");
    }

    // Test d'une case vide
    if (plateau.plateau[4][4] !== 0) {
        console.log("Échec : la position (4,4) devrait être vide.");
    } else {
        console.log("Succès : la position (4,4) est vide.");
    }
}

// Fonction pour tester les mouvements valides d'un pion noir
function testMouvementsValidesNoir() {
    const plateau = new Plateau();
    const mouvementsNoir = plateau.getMouvementsValides(2, 1);
    
    // On s'attend à ce que le pion noir en (2,1) puisse aller en (3,0) et (3,2)
    const mouvementAttendu1 = mouvementsNoir.some(m => m[0] === 3 && m[1] === 0);
    const mouvementAttendu2 = mouvementsNoir.some(m => m[0] === 3 && m[1] === 2);

    if (mouvementAttendu1 && mouvementAttendu2) {
        console.log("Succès : les mouvements valides pour le pion noir sont corrects.");
    } else {
        console.log("Échec : les mouvements valides pour le pion noir ne sont pas corrects.");
    }
}

// Fonction pour tester les mouvements valides d'un pion blanc
function testMouvementsValidesBlanc() {
    const plateau = new Plateau();
    const mouvementsBlanc = plateau.getMouvementsValides(5, 0);
    
    // On s'attend à ce que le pion blanc en (5,0) puisse aller en (4,1)
    const mouvementAttendu = mouvementsBlanc.some(m => m[0] === 4 && m[1] === 1);

    if (mouvementAttendu) {
        console.log("Succès : les mouvements valides pour le pion blanc sont corrects.");
    } else {
        console.log("Échec : les mouvements valides pour le pion blanc ne sont pas corrects.");
    }
}

// Fonction pour tester le déplacement d'une pièce
function testDeplacementPiece() {
    const plateau = new Plateau();

    // Test déplacement valide
    const deplacementValide = plateau.deplacerPiece([2, 1], [3, 2]);
    if (deplacementValide && plateau.plateau[2][1] === 0 && plateau.plateau[3][2] === 1) {
        console.log("Succès : le déplacement valide fonctionne correctement.");
    } else {
        console.log("Échec : le déplacement valide ne fonctionne pas correctement.");
    }

    // Test déplacement invalide
    const deplacementInvalide = plateau.deplacerPiece([3, 2], [5, 2]);
    if (!deplacementInvalide) {
        console.log("Succès : le déplacement invalide est correctement rejeté.");
    } else {
        console.log("Échec : le déplacement invalide n'a pas été rejeté.");
    }
}

// Exécution des tests
testCreationPlateau();
testMouvementsValidesNoir();
testMouvementsValidesBlanc();
testDeplacementPiece();
