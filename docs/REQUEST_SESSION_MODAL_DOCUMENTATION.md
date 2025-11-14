# 📝 Modal "Demander une session" - Représentant Universitaire

## ✅ Composants créés

2 nouveaux modals ont été créés pour les représentants universitaires :

### 1. RequestSessionModal.jsx
**Localisation** : `client/src/components/AdminDashboard/RequestSessionModal.jsx`

**Fonctionnalité** : Modal pour demander une nouvelle session de formation

**Étapes du workflow** :

#### Étape 1 : Sélection de la formation
- Liste de toutes les formations disponibles (catalogues)
- Affichage : Titre + Niveau + Type
- Clic sur une formation pour la sélectionner
- Possibilité de revenir à la liste avec "Changer la formation"

#### Étape 2 : Proposition des dates
Une fois la formation sélectionnée, le formulaire apparaît avec :

**Semaine 1** (obligatoire) :
- **De** : Date de début
- **Jusqu'à** : Date de fin
- Icône calendrier pour faciliter la saisie

**Semaine 2** (optionnelle) :
- **De** : Date de début alternative
- **Jusqu'à** : Date de fin alternative
- Permet d'augmenter les chances d'acceptation

**Message d'aide** :
> "Tu veux améliorer la chance d'acceptation? Proposez une autre date"

**Actions** :
- **Annuler** : Ferme le modal sans sauvegarder
- **Réserver** : Valide et passe au modal de confirmation

**Validations** :
- Formation obligatoire
- Semaine 1 obligatoire (De + Jusqu'à)
- Semaine 2 optionnelle
- Alert si validation échoue

---

### 2. ConfirmRequestSessionModal.jsx
**Localisation** : `client/src/components/AdminDashboard/ConfirmRequestSessionModal.jsx`

**Fonctionnalité** : Modal de confirmation avant d'envoyer la demande

**Message** :
> "Êtes-vous sûr de vouloir demander cette session?  
> Une notification sera envoyée à l'administrateur pour validation."

**Affichage** :
- Titre de la formation sélectionnée dans un encadré
- Rappel que la demande sera envoyée à l'admin

**Actions** :
- **Retour** : Revient au modal de sélection
- **Confirmer** : Envoie la demande de session

---

## 🔄 Flux de travail complet

### Workflow utilisateur (Représentant Universitaire)

```
1. Clic sur "+ Demander une session"
   ↓
2. RequestSessionModal s'ouvre
   ↓
3. Sélection d'une formation dans la liste
   - Exemples : "Développement Web Fullstack", "IA et ML", etc.
   ↓
4. Formulaire de dates s'affiche
   ↓
5. Remplir Semaine 1 (obligatoire)
   - De : 15/11/2025
   - Jusqu'à : 18/11/2025
   ↓
6. Optionnel : Remplir Semaine 2
   - De : 22/11/2025
   - Jusqu'à : 25/11/2025
   ↓
7. Clic sur "Réserver"
   ↓
8. ConfirmRequestSessionModal s'ouvre
   - Affiche le nom de la formation
   ↓
9. Clic sur "Confirmer"
   ↓
10. API POST /api/sessions
    - Body: { catalogue, proposed_dates: [...] }
   ↓
11. Session créée avec :
    - statut: PENDING
    - requested_by: ID du représentant connecté
    - catalogue: Formation sélectionnée
    - proposed_dates: 1 ou 2 périodes
   ↓
12. Session apparaît dans la liste "En Attente"
   ↓
13. L'admin sera notifié (fonctionnalité future)
```

---

## 🎨 Design et Style

### Caractéristiques UI

**RequestSessionModal** :
- Largeur : `max-w-2xl` (672px) - Plus large pour accommoder le contenu
- Hauteur : Scroll si dépassement (`max-h-[90vh] overflow-y-auto`)
- Padding : `p-8`
- Titre dynamique : Nom de la formation sélectionnée

**Liste des formations** :
- Grid : 1 colonne
- Hauteur max : `max-h-96` avec scroll
- Hover : `hover:bg-orange-50 hover:border-orange-500`
- Chaque item affiche : Titre + (Niveau • Type)

**Champs de date** :
- Icon calendrier (Lucide React) à droite
- Grid 2 colonnes pour De / Jusqu'à
- Focus ring orange : `focus:ring-orange-500`

**Boutons** :
- Annuler : Gris avec bordure
- Réserver : Orange, désactivé si pas de formation sélectionnée

---

## 🔧 Intégration dans Sessions.jsx

### Imports ajoutés
```jsx
import RequestSessionModal from './AdminDashboard/RequestSessionModal';
import ConfirmRequestSessionModal from './AdminDashboard/ConfirmRequestSessionModal';
```

### États ajoutés
```jsx
const [showRequestSessionModal, setShowRequestSessionModal] = useState(false);
const [showConfirmRequestModal, setShowConfirmRequestModal] = useState(false);
const [sessionToRequest, setSessionToRequest] = useState(null);
```

### Fonctions ajoutées

#### 1. `handleRequestSessionClick()`
Ouvre le modal de demande de session

#### 2. `handleRequestSessionSubmit(requestData)`
- Stocke les données (catalogue + dates)
- Ferme le modal de demande
- Ouvre le modal de confirmation

#### 3. `handleConfirmRequestSession()`
- Envoie POST /api/sessions
- Body : `{ catalogue, proposed_dates }`
- Ajoute la session à la liste
- Ferme les modals
- Change filtre sur "PENDING"
- Gestion d'erreurs avec message détaillé

### Bouton mis à jour

**Ancien code** (avec prompts) :
```jsx
{user?.role==='university_representative' && <button onClick={async ()=>{
  const formationId = prompt('Entrer ID de la formation');
  // ... multiples prompts
}} ...>+ Demander une session</button>}
```

**Nouveau code** (avec modal) :
```jsx
{user?.role==='university_representative' && (
  <button onClick={handleRequestSessionClick} ...>
    + Demander une session
  </button>
)}
```

---

## 📡 API Endpoint utilisé

### POST /api/sessions
**Utilisé par** : `handleConfirmRequestSession()`

**Body envoyé** :
```json
{
  "catalogue": "catalogue_id",
  "proposed_dates": [
    {
      "from": "2025-11-15",
      "to": "2025-11-18"
    },
    {
      "from": "2025-11-22",
      "to": "2025-11-25"
    }
  ]
}
```

**Headers** :
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

**Comportement backend** :
- Vérifie que `catalogue` existe
- Auto-détecte que c'est un `university_representative` via `req.user`
- Auto-set `requested_by` = ID du représentant connecté
- Auto-set `status` = "PENDING"
- Limite à 2 propositions de dates maximum

**Réponse (201 Created)** :
```json
{
  "_id": "session_id",
  "catalogue": { ... },
  "requested_by": { ... },
  "proposed_dates": [...],
  "status": "PENDING",
  "createdAt": "...",
  ...
}
```

---

## 🔐 Permissions

### Qui peut demander une session ?
- **Rôle requis** : `university_representative` uniquement
- Le bouton "+ Demander une session" n'apparaît que pour ce rôle
- Les admins et mentors ne voient pas ce bouton

### Auto-attribution
Quand un représentant universitaire crée une session :
- `requested_by` est automatiquement set à son ID
- `status` forcé à "PENDING"
- Ne peut pas choisir le formateur (assigné par admin plus tard)
- Ne peut pas définir le statut (toujours PENDING)

---

## ✅ Tests recommandés

### Test 1 : Demande simple avec 1 semaine
1. Se connecter en représentant (`rep1@university.tn` / `password123`)
2. Naviguer vers "Sessions"
3. Cliquer "+ Demander une session"
4. **Vérifier** : Modal s'ouvre avec liste de formations
5. Sélectionner "Développement Web Fullstack avec MERN"
6. **Vérifier** : Formulaire de dates apparaît
7. Remplir Semaine 1 :
   - De : 15/11/2025
   - Jusqu'à : 18/11/2025
8. Cliquer "Réserver"
9. **Vérifier** : Modal de confirmation s'ouvre
10. Cliquer "Confirmer"
11. **Vérifier** :
    - Session créée
    - Apparaît dans "En Attente"
    - `requested_by` = représentant connecté

### Test 2 : Demande avec 2 semaines
1. Ouvrir modal de demande
2. Sélectionner une formation
3. Remplir Semaine 1 ET Semaine 2
4. Confirmer
5. **Vérifier** : `proposed_dates` contient 2 périodes

### Test 3 : Validation formulaire
1. Ouvrir modal
2. Cliquer "Réserver" sans sélectionner formation
3. **Vérifier** : Alert "Veuillez sélectionner une formation"
4. Sélectionner formation
5. Laisser dates vides
6. Cliquer "Réserver"
7. **Vérifier** : Alert "Veuillez remplir au moins la semaine 1"

### Test 4 : Annulation
1. Ouvrir modal
2. Sélectionner formation et remplir dates
3. Cliquer "Annuler"
4. **Vérifier** : Modal se ferme, rien créé
5. Rouvrir modal
6. Sélectionner formation
7. Cliquer "Réserver"
8. Dans confirmation, cliquer "Retour"
9. **Vérifier** : Retour au modal de sélection

### Test 5 : Changement de formation
1. Ouvrir modal
2. Sélectionner "DevOps et CI/CD"
3. **Vérifier** : Titre change
4. Cliquer "Changer la formation"
5. **Vérifier** : Retour à la liste
6. Sélectionner autre formation
7. **Vérifier** : Nouveau titre

### Test 6 : Permissions (autres rôles)
1. Se connecter en admin
2. **Vérifier** : Bouton "+ Ajouter une session" (pas "Demander")
3. Se connecter en mentor
4. **Vérifier** : Aucun bouton d'ajout visible

---

## 🎯 Différences Admin vs Représentant

| Feature | Admin | Représentant Universitaire |
|---------|-------|----------------------------|
| **Bouton** | "+ Ajouter une session" | "+ Demander une session" |
| **Modal** | AddSessionModal | RequestSessionModal |
| **Sélection** | Formation + Université | Formation seulement |
| **Dates** | 1 période (De/Jusqu'à) | 2 périodes optionnelles |
| **Champ université** | Dropdown obligatoire | Auto (université du rep) |
| **Statut créé** | PENDING | PENDING |
| **requested_by** | Non set | Auto-set (rep connecté) |
| **Peut assigner formateur** | Oui (après création) | Non |

---

## 📊 Données visibles pour chaque rôle

### Représentant Universitaire
- Voit uniquement SES demandes (where `requested_by` = son ID)
- Peut demander des sessions
- Ne peut pas les approuver/rejeter
- Ne peut pas assigner de formateur

### Admin
- Voit TOUTES les sessions
- Peut ajouter des sessions directement
- Peut approuver/rejeter les demandes
- Peut assigner des formateurs

### Mentor
- Voit les sessions où il est `teacher`
- Voit les sessions de catalogues où il est `trainer`
- Ne peut ni créer, ni approuver, ni rejeter

---

## 🐛 Gestion des erreurs

### Erreurs gérées
1. **Catalogue inexistant** : 404 de l'API
2. **Validation échouée** : Alert côté client
3. **Erreur réseau** : Try/catch avec alert
4. **Token invalide** : 401/403 de l'API

### Messages affichés
```javascript
// Succès
"Session demandée avec succès" (implicite via filtre PENDING)

// Erreurs
"Veuillez sélectionner une formation"
"Veuillez remplir au moins la semaine 1"
"Erreur lors de la demande de session: [message API]"
"Erreur réseau"
```

---

## 🚀 Améliorations futures possibles

1. **Notifications backend** : Notifier vraiment l'admin quand demande créée
2. **Calendrier visuel** : Picker de dates interactif au lieu d'inputs date
3. **Disponibilité formateurs** : Afficher quels formateurs sont libres
4. **Conflits** : Détecter si dates chevauchent autre session
5. **Historique** : Voir ses demandes passées (approuvées/rejetées)
6. **Statut en temps réel** : WebSocket pour notif instantanée
7. **Commentaires** : Ajouter un champ "Message pour l'admin"
8. **Templates** : Semaines pré-remplies (ex: "Semaine prochaine")

---

## 📝 Résumé

### Avant (avec prompts)
```
❌ 6 prompts successifs
❌ UX mauvaise
❌ Pas de validation
❌ Difficile à utiliser
❌ Pas professionnel
```

### Après (avec modal)
```
✅ Interface graphique professionnelle
✅ Sélection visuelle de la formation
✅ Validation claire
✅ Confirmation avant envoi
✅ Gestion d'erreurs
✅ UX moderne et intuitive
✅ Conforme au design système
```

**Prêt pour les tests ! 🚀**
