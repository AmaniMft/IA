class Heuristics {
    // Heuristique de base : compte simplement les pièces et les dames
    static basic(plateau, joueur) {
        let score = 0;
        for (let i = 0; i < plateau.taille; i++) {
            for (let j = 0; j < plateau.taille; j++) {
                const piece = plateau.getPiece(i, j);
                if (piece) {
                    const valeur = piece.estDame ? 3 : 1;
                    score += piece.joueur === joueur ? valeur : -valeur;
                }
            }
        }
        return score;
    }

    // Heuristique basée sur la position : favorise les pièces avancées et le contrôle du centre
    static position(plateau, joueur) {
        let score = 0;
        const centre = Math.floor(plateau.taille / 2);
        
        for (let i = 0; i < plateau.taille; i++) {
            for (let j = 0; j < plateau.taille; j++) {
                const piece = plateau.getPiece(i, j);
                if (piece) {
                    // Valeur de base de la pièce
                    let valeur = piece.estDame ? 3 : 1;
                    
                    // Bonus pour l'avancement (différent selon le joueur)
                    const avancement = piece.joueur === 1 ? 
                        i / plateau.taille : 
                        (plateau.taille - i - 1) / plateau.taille;
                    valeur += avancement;
                    
                    // Bonus pour le contrôle du centre
                    const distanceCentre = Math.abs(j - centre);
                    valeur += (plateau.taille/2 - distanceCentre) / plateau.taille;
                    
                    score += piece.joueur === joueur ? valeur : -valeur;
                }
            }
        }
        return score;
    }

    // Heuristique basée sur la mobilité : favorise les pièces avec plus de mouvements possibles
    static mobility(plateau, joueur) {
        let score = 0;
        
        // Calculer la mobilité pour chaque pièce
        for (let i = 0; i < plateau.taille; i++) {
            for (let j = 0; j < plateau.taille; j++) {
                const piece = plateau.getPiece(i, j);
                if (piece) {
                    const mouvementsPossibles = plateau.getMouvementsPossibles(i, j);
                    const mobilite = mouvementsPossibles.length;
                    const valeur = (piece.estDame ? 3 : 1) + (mobilite * 0.5);
                    
                    score += piece.joueur === joueur ? valeur : -valeur;
                }
            }
        }
        return score;
    }

    // Heuristique avancée : combine toutes les heuristiques précédentes
    static advanced(plateau, joueur) {
        const scoreBase = Heuristics.basic(plateau, joueur);
        const scorePosition = Heuristics.position(plateau, joueur);
        const scoreMobilite = Heuristics.mobility(plateau, joueur);
        
        // Pondération des différentes composantes
        return (scoreBase * 0.4) + (scorePosition * 0.3) + (scoreMobilite * 0.3);
    }

    // Fonction pour obtenir l'heuristique en fonction du nom
    static getHeuristic(name) {
        switch (name.toUpperCase()) {
            case 'BASIC':
                return this.basic;
            case 'POSITION':
                return this.position;
            case 'MOBILITY':
                return this.mobility;
            case 'ADVANCED':
                return this.advanced;
            default:
                return this.basic;
        }
    }
}

module.exports = Heuristics;
