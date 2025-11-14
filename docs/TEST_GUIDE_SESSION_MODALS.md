# 🧪 Guide de Test - Modals CRUD Sessions

## Prérequis

1. **Base de données remplie** avec données de test
   ```bash
   cd server
   npm run seed
   ```

2. **Serveur démarré**
   ```bash
   cd server
   npm start
   ```

3. **Client démarré**
   ```bash
   cd client
   npm run dev
   ```

4. **Connexion admin**
   - Email: `admin@odc.tn`
   - Mot de passe: `password123`

---

## Test 1 : Ajouter une session ✅

### Étapes
1. Se connecter en tant qu'admin
2. Naviguer vers "Sessions" dans le menu
3. Cliquer sur le bouton orange "+ Ajouter une session" (en haut à droite)
4. **Vérifier** : Le modal "Ajouter une session" s'ouvre

### Dans le modal d'ajout
5. **Formations** : Sélectionner "Développement Web Fullstack avec MERN"
6. **Université** : Sélectionner "Université de Tunis El Manar"
7. **Date De** : Sélectionner une date future (ex: 15/11/2025)
8. **Date Jusqu'à** : Sélectionner une date après "De" (ex: 18/11/2025)
9. Cliquer sur "Ajouter la session"
10. **Vérifier** : Le modal de confirmation s'ouvre

### Dans le modal de confirmation
11. Lire le message : "Êtes-vous sûr de vouloir ajouter cette session?"
12. Cliquer sur "Confirmer"
13. **Vérifier** :
    - Le modal se ferme
    - La nouvelle session apparaît dans la liste
    - Le filtre passe automatiquement sur "En Attente"
    - La session a le statut PENDING (orange)

### Résultat attendu
✅ Session créée avec succès  
✅ Visible dans l'onglet "En Attente"  
✅ Détails corrects (formation, université, dates)

---

## Test 2 : Validation du formulaire ⚠️

### Étapes
1. Cliquer sur "+ Ajouter une session"
2. **NE PAS remplir** les champs
3. Cliquer directement sur "Ajouter la session"
4. **Vérifier** : Une alerte apparaît "Veuillez remplir tous les champs"

### Test partiel
5. Remplir seulement "Formations"
6. Cliquer sur "Ajouter la session"
7. **Vérifier** : Alerte apparaît

### Test complet valide
8. Remplir tous les champs correctement
9. Cliquer sur "Ajouter la session"
10. **Vérifier** : Modal de confirmation s'ouvre (pas d'alerte)

### Résultat attendu
✅ Validation empêche la soumission incomplète  
✅ Message d'erreur clair  
✅ Pas de requête API si invalide

---

## Test 3 : Annulation de l'ajout ❌

### Test annulation niveau 1
1. Cliquer sur "+ Ajouter une session"
2. Remplir le formulaire
3. Cliquer sur "Annuler" (bouton gris)
4. **Vérifier** : Le modal se ferme, aucune session ajoutée

### Test annulation niveau 2
5. Cliquer sur "+ Ajouter une session"
6. Remplir et cliquer "Ajouter la session"
7. Dans le modal de confirmation, cliquer "Retour"
8. **Vérifier** : Retour au modal d'ajout (données conservées)
9. Cliquer sur le X (en haut à droite)
10. **Vérifier** : Le modal se ferme

### Test annulation par overlay
11. Cliquer sur "+ Ajouter une session"
12. Cliquer en dehors du modal (zone grise)
13. **Vérifier** : Le modal se ferme

### Résultat attendu
✅ Annulation possible à chaque étape  
✅ Pas de session créée  
✅ Overlay cliquable

---

## Test 4 : Rejeter une session ❌

### Étapes préparatoires
1. S'assurer qu'une session PENDING existe (utiliser Test 1 si besoin)
2. Naviguer vers "Sessions"
3. Filtrer sur "En Attente" si nécessaire
4. Cliquer sur une session PENDING dans la liste
5. **Vérifier** : Le drawer s'ouvre à droite

### Dans le drawer
6. **Vérifier** : Deux boutons en bas : "Rejeter" (gris) et "Confirmer" (orange)
7. Cliquer sur "Rejeter"
8. **Vérifier** : Le modal "Rejeter la session" s'ouvre

### Dans le modal de rejet
9. **Vérifier** : Textarea vide avec placeholder "Écrire votre message ici..."
10. **NE PAS écrire** de message
11. Cliquer sur "Rejeter la session"
12. **Vérifier** : Alerte "Veuillez indiquer la raison du rejet"

### Avec raison valide
13. Écrire : "Conflit de calendrier avec une autre formation importante"
14. Cliquer sur "Rejeter la session"
15. **Vérifier** : Modal de confirmation s'ouvre

### Dans le modal de confirmation
16. Lire le message : "Êtes-vous sûr de vouloir rejeter cette session?"
17. Cliquer sur "Confirmer"
18. **Vérifier** :
    - Le modal se ferme
    - Le drawer reste ouvert
    - Le statut change à "Rejeté" (rouge)
    - Le message de rejet s'affiche dans le drawer
    - La session apparaît dans l'onglet "Rejeté"

### Résultat attendu
✅ Session rejetée avec raison  
✅ Message visible dans drawer  
✅ Statut REJECTED  
✅ Validation de la raison obligatoire

---

## Test 5 : Annuler une session confirmée ↩️

### Étapes préparatoires
1. Créer ou trouver une session CONFIRMED
2. Ouvrir cette session dans le drawer
3. **Vérifier** : Bouton "Annuler" (gris) et "Clôturer" (orange)

### Test annulation
4. Cliquer sur "Annuler"
5. **Vérifier** : Modal "Rejeter la session" s'ouvre (même modal que Test 4)
6. Écrire raison : "Formateur indisponible pour raisons personnelles"
7. Cliquer sur "Rejeter la session"
8. Modal de confirmation s'ouvre
9. Cliquer "Confirmer"
10. **Vérifier** :
    - Session passe à REJECTED
    - Raison affichée
    - Session visible dans "Rejeté"

### Résultat attendu
✅ Session CONFIRMED peut être annulée  
✅ Même workflow que rejet PENDING  
✅ Raison obligatoire

---

## Test 6 : Permissions (Non-admin) 🔒

### Test avec Mentor
1. Se déconnecter de l'admin
2. Se connecter avec `mentor1@odc.tn` / `password123`
3. Naviguer vers "Sessions"
4. **Vérifier** : Le bouton "+ Ajouter une session" n'existe pas
5. Ouvrir une session PENDING
6. **Vérifier** : Les boutons "Rejeter" et "Confirmer" n'existent pas

### Test avec Représentant Universitaire
7. Se déconnecter
8. Se connecter avec `rep1@university.tn` / `password123`
9. Naviguer vers "Sessions"
10. **Vérifier** : Bouton "+ Demander une session" (différent)
11. **Vérifier** : Pas de bouton "+ Ajouter une session"
12. Ouvrir une session
13. **Vérifier** : Pas de boutons "Rejeter" ou "Confirmer"

### Résultat attendu
✅ Seuls les admins voient "+ Ajouter une session"  
✅ Seuls les admins peuvent rejeter/confirmer  
✅ Les autres rôles ont des restrictions appropriées

---

## Test 7 : Données chargées dans les dropdowns 📊

### Vérifications
1. Se connecter en admin
2. Cliquer sur "+ Ajouter une session"
3. **Dropdown Formations** :
   - Vérifier que les 8 formations apparaissent
   - Exemples attendus :
     - Développement Web Fullstack avec MERN
     - Intelligence Artificielle et Machine Learning
     - Cybersécurité - Sécurisation des Applications Web
     - Design UX/UI avec Figma
     - DevOps et CI/CD
     - Développement Mobile avec React Native
     - Data Science avec Python
     - Cloud Computing avec AWS

4. **Dropdown Université** :
   - Vérifier que les 15 universités apparaissent
   - Exemples attendus :
     - Université de Tunis El Manar
     - Université de Carthage
     - Université de Sfax
     - École Polytechnique de Tunisie
     - INSAT, ESPRIT, ENIT, ISI

### Résultat attendu
✅ Toutes les formations sont listées  
✅ Toutes les universités sont listées  
✅ Pas de "Loading..." bloquant  
✅ Options sélectionnables

---

## Test 8 : Scénario complet E2E 🔄

### Workflow complet
1. **Créer** une session (Test 1)
2. **Vérifier** qu'elle apparaît en PENDING
3. **Ouvrir** la session
4. **Confirmer** la session
5. **Vérifier** qu'elle passe en CONFIRMED
6. **Annuler** la session (Test 5)
7. **Vérifier** qu'elle passe en REJECTED
8. **Vérifier** que la raison s'affiche

### Timeline attendue
```
PENDING → CONFIRMED → REJECTED
(création) (confirmation) (annulation)
```

### Résultat attendu
✅ Tous les changements de statut fonctionnent  
✅ Les raisons de rejet sont persistées  
✅ L'UI se met à jour correctement

---

## Test 9 : Validation des dates 📅

### Test dates cohérentes
1. Ouvrir modal d'ajout
2. Date De : 15/11/2025
3. Date Jusqu'à : 14/11/2025 (avant "De")
4. Tenter de soumettre
5. **Actuellement** : Pas de validation côté client
6. **Attendu** : L'API devrait valider ou ajouter validation frontend

### Amélioration future
- Ajouter validation : dateTo > dateFrom
- Message d'erreur si dates invalides

---

## Test 10 : Console et Network 🔍

### Vérifications techniques
1. Ouvrir DevTools (F12)
2. Onglet Console
3. **Vérifier** : Pas d'erreurs JavaScript
4. Onglet Network
5. Effectuer Test 1 (ajout session)
6. **Vérifier requête POST** :
   - URL : `http://localhost:5173/api/sessions`
   - Method : POST
   - Status : 201 Created
   - Body envoyé :
     ```json
     {
       "catalogue": "catalogue_id",
       "proposed_dates": [
         {
           "from": "2025-11-15",
           "to": "2025-11-18"
         }
       ]
     }
     ```
   - Réponse : Objet session créée

7. Effectuer Test 4 (rejet session)
8. **Vérifier requête PATCH** :
   - URL : `http://localhost:5173/api/sessions/{id}/status`
   - Method : PATCH
   - Status : 200 OK
   - Body envoyé :
     ```json
     {
       "status": "REJECTED",
       "rejection_reason": "Conflit de calendrier..."
     }
     ```

### Résultat attendu
✅ Requêtes réussies (200/201)  
✅ Pas d'erreurs 400/500  
✅ Réponses correctes

---

## Checklist finale ✅

- [ ] Test 1 : Ajout de session réussi
- [ ] Test 2 : Validation formulaire fonctionne
- [ ] Test 3 : Annulation possible à tous niveaux
- [ ] Test 4 : Rejet avec raison obligatoire
- [ ] Test 5 : Annulation session confirmée
- [ ] Test 6 : Permissions admin uniquement
- [ ] Test 7 : Dropdowns chargés correctement
- [ ] Test 8 : Workflow E2E complet
- [ ] Test 9 : Dates acceptées (validation à améliorer)
- [ ] Test 10 : Pas d'erreurs console/network

---

## 🐛 Bugs connus / Limitations

1. **Pas de validation dates** : Date fin peut être avant date début (à ajouter)
2. **Pas de loading state** : Pendant requête API (à ajouter)
3. **Alerts natifs** : Utilise `alert()` au lieu de toasts (peut être amélioré)
4. **Pas de notification backend** : Message dit "notifications envoyées" mais pas implémenté

---

## 🎯 Résultats attendus globaux

### Fonctionnalités qui DOIVENT marcher
✅ Admin peut ajouter une session  
✅ Admin peut rejeter une session  
✅ Raison de rejet obligatoire  
✅ Validation formulaire  
✅ Annulation à tous niveaux  
✅ Permissions admin uniquement  
✅ Mise à jour automatique de la liste  
✅ Modals s'ouvrent/ferment correctement

### Améliorations futures (hors scope actuel)
- Loading states avec spinners
- Toasts au lieu de alerts
- Validation dates côté client
- Vraies notifications backend
- Templates de raisons pré-définies
- Historique des modifications

---

**Prêt pour les tests ! 🚀**
