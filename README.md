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

### 1. Comparaison des Heuristiques (1000 parties)
Trois heuristiques ont été testées sur 1000 parties chacune :
- **Basic** : Compte simple des pièces
- **Position** : Évalue la position stratégique
- **Mobility** : Considère la mobilité des pièces

Résultats moyens par heuristique :
- **Temps moyen par coup** : ~65-70ms
- **Nœuds explorés** : ~800 nœuds
- **Longueur moyenne des parties** : 33 coups
- **Pic mémoire** : ~0.78MB

### 2. MinMax vs Alpha-Beta
Tests effectués sur 200 parties pour chaque profondeur (1-5)

#### Profondeur 4 - Comparaison détaillée
##### MinMax
- **Temps d'exécution** : 714ms
- **Nœuds explorés** : 1.4M nœuds
- **Mémoire utilisée** : 0.78MB
- **Taux de victoire** : 42%

##### Alpha-Beta
- **Temps d'exécution** : 264ms
- **Nœuds explorés** : 3090 nœuds
- **Nœuds élagués** : 532 (moyenne)
- **Mémoire utilisée** : 0.78MB
- **Taux de victoire** : 58%
- **Gain en performance** : 63% plus rapide que MinMax

#### Impact de la Profondeur
- Profondeur 1 : ~10ms par coup
- Profondeur 2 : ~45ms par coup
- Profondeur 3 : ~120ms par coup
- Profondeur 4 : ~264ms par coup
- Profondeur 5 : ~890ms par coup

### 3. Impact de la Taille de la Grille (100 parties par taille)
| Taille | Temps/Coup | Nœuds/Coup | Nœuds Élagués | Mémoire | Coups Moyens |
|--------|------------|------------|---------------|---------|--------------|
| 6x6    | ~0ms      | ~0         | ~0            | ~0MB    | N/A          |
| 8x8    | 63ms      | 816        | 124           | 0.42MB  | 33           |
| 10x10  | 339ms     | 3191       | 532           | 0.73MB  | 100          |

### Conclusions et Recommandations

#### 1. Algorithme Optimal
- Alpha-Beta est significativement plus efficace
- Réduction de 63% du temps de calcul
- Réduction massive des nœuds explorés (1.4M → 3090)
- Taux de victoire supérieur (58% vs 42%)

#### 2. Impact de la Taille
- Performance acceptable jusqu'à 8x8
- Dégradation significative en 10x10 :
  - Temps multiplié par 5
  - Nœuds explorés multipliés par 4
  - Parties plus longues (100 coups vs 33)

#### 3. Heuristiques
- Performance similaire des trois heuristiques
- Opportunité d'amélioration possible
- La position et la mobilité n'apportent pas d'avantage significatif

#### Recommandations
1. Utiliser exclusivement Alpha-Beta
2. Limiter la profondeur selon la taille :
   - 8x8 : profondeur 4 maximum
   - 10x10 : profondeur 3 maximum
3. Optimiser les heuristiques :
   - Combiner les approches existantes
   - Explorer de nouvelles métriques
4. Implémenter un contrôle dynamique de la profondeur

## 🛠️ Technologies Utilisées

- Node.js
- Express.js
- JavaScript ES6+
- HTML5/CSS3

## 📝 Licence

[Votre licence]

## 👥 Contributeurs

[]
