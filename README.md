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

## Résultats des Tests de Performance

### 1. Comparaison des Heuristiques
Trois heuristiques ont été testées : basic, position et mobility.
- **Temps moyen par coup** : ~65-70ms
- **Nœuds explorés** : ~800 nœuds
- **Longueur moyenne des parties** : 33 coups
- Les trois heuristiques montrent des performances similaires

### 2. MinMax vs Alpha-Beta (Profondeur 4)
#### MinMax
- **Temps d'exécution** : 714ms
- **Nœuds explorés** : 1.4M nœuds
- **Mémoire utilisée** : 0.78MB

#### Alpha-Beta
- **Temps d'exécution** : 264ms
- **Nœuds explorés** : 3090 nœuds
- **Nœuds élagués** : 532
- **Mémoire utilisée** : 0.78MB
- **Gain en performance** : 63% plus rapide que MinMax

### 3. Impact de la Taille de la Grille
| Taille | Temps/Coup | Nœuds/Coup | Mémoire | Coups Moyens |
|--------|------------|------------|---------|--------------|
| 6x6    | ~0ms      | ~0         | ~0MB    | N/A          |
| 8x8    | 63ms      | 816        | 0.42MB  | 33           |
| 10x10  | 339ms     | 3191       | -0.73MB | 100          |

### Conclusions
1. **Algorithme Optimal** : Alpha-Beta surpasse significativement MinMax avec une réduction de 63% du temps de calcul.
2. **Impact de la Taille** :
   - Le passage de 8x8 à 10x10 multiplie le temps de calcul par 5
   - Le nombre de nœuds explorés est multiplié par 4
3. **Heuristiques** : Les trois heuristiques testées montrent des performances similaires, suggérant un potentiel d'amélioration.

### Recommandations
1. Utiliser exclusivement l'algorithme Alpha-Beta
2. Limiter la profondeur de recherche sur les grilles 10x10


## 🛠️ Technologies Utilisées

- Node.js
- Express.js
- JavaScript ES6+
- HTML5/CSS3

## 📝 Licence

[Votre licence]

## 👥 Contributeurs

[]
