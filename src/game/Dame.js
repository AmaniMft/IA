class Dame {
    constructor(couleur, x, y) {
        this.couleur = couleur; // 1 = Noir, 2 = Blanc
        this.position = { x, y };
    }

    // Représentation visuelle dans le terminal
    afficher() {
        return this.couleur === 1 ? '*' : '#'; // * pour Dame noire, # pour Dame blanche
    }

    // Retourne les mouvements valides pour une dame
    getMouvementsValides(plateau) {
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]; // Diagonales
        const mouvements = [];
    
        for (const [dx, dy] of directions) {
            let nx = this.position.x + dx;
            let ny = this.position.y + dy;
            let capturePossible = false;
    
            while (this.estDansLesLimites(nx, ny)) {
                if (!plateau[ny][nx]) {
                    if (capturePossible) {
                        mouvements.push({ x: nx, y: ny });
                    } else {
                        mouvements.push({ x: nx, y: ny });
                    }
                } else if (
                    plateau[ny][nx].couleur !== this.couleur &&
                    this.estDansLesLimites(nx + dx, ny + dy) &&
                    !plateau[ny + dy][nx + dx]
                ) {
                    capturePossible = true; // Capture possible
                    nx += dx;
                    ny += dy;
                    continue;
                } else {
                    break; // Bloqué par une pièce
                }
                nx += dx;
                ny += dy;
            }
        }
    
        return mouvements;
    }
    

    // Vérifie si une position est dans les limites du plateau
    estDansLesLimites(x, y) {
        return x >= 0 && x < 8 && y >= 0 && y < 8;
    }
}

module.exports = Dame;
