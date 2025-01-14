# Jeu de Dames avec Intelligence Artificielle

Ce projet implémente un jeu de dames avec différentes approches d'intelligence artificielle, permettant de comparer l'efficacité de divers algorithmes et heuristiques.

## 🎮 Caractéristiques

- Interface web interactive pour jouer contre l'IA
- Multiple niveaux de difficulté
- Visualisation des statistiques de jeu
- Tests de performance complets
- Plusieurs heuristiques d'évaluation

## 🤖 Algorithmes d'IA Implémentés

- **Alpha-Beta Pruning**
  - Optimisation de MinMax
  - Profondeur configurable
  - Élagage intelligent des branches

- **MinMax**
  - Algorithme de base
  - Exploration complète de l'arbre de jeu
  - Différentes profondeurs de recherche

## 🔧 Installation

1. Cloner le dépôt :
```bash
git clone [votre-repo]
cd [votre-dossier]
```

2. Installer les dépendances :
```bash
npm install
```

3. Lancer l'application :
```bash
npm start
```

## 📊 Tests de Performance

Lancer les tests :
```bash
npm test
```

Les tests analysent :
- Comparaison des différentes heuristiques
- Impact de la profondeur de recherche
- Performances Alpha-Beta vs MinMax
- Effet de la taille de la grille
- Temps d'exécution et utilisation mémoire

## 📁 Structure du Projet

```
src/
├── ai/
│   ├── AlphaBeta.js     # Implémentation Alpha-Beta
│   ├── MinMax.js        # Implémentation MinMax
│   ├── BaseAI.js        # Classe de base pour les IA
│   └── heuristics.js    # Fonctions d'évaluation
├── game/
│   └── Plateau.js       # Logique du jeu
├── public/
│   ├── css/            # Styles
│   └── js/             # JavaScript client
└── server.js           # Serveur de jeu

tests/
└── checkers_performance.js  # Tests de performance
```

## 🎯 Fonctionnalités de l'Interface

- Plateau de jeu interactif
- Choix du niveau de difficulté
- Statistiques en temps réel
- Visualisation des coups possibles
- Historique des mouvements

## 🔬 Résultats des Tests

Les tests démontrent :
- L'efficacité supérieure de l'élagage Alpha-Beta
- L'impact significatif des différentes heuristiques
- La relation entre profondeur et temps de calcul
- L'optimisation des performances selon la taille du plateau

## 🛠️ Technologies Utilisées

- Node.js
- Express.js
- JavaScript ES6+
- HTML5/CSS3

## 📝 Licence

[Votre licence]

## 👥 Contributeurs

[]
