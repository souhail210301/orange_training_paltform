# Guide des Captures d'Écran pour le Rapport de Stage

Ce document liste toutes les captures d'écran à réaliser pour le rapport, avec leurs titres et descriptions.

---

## Chapitre 3 : Analyse et Conception

### Figure 3.1 : Diagramme de cas d'utilisation
**Fichier :** `docs/diagrams/use-cases-fr@3x.png`

**Description :** Ce diagramme présente l'ensemble des cas d'utilisation de la plateforme selon les différents acteurs (Administrateur, Mentor ODC, Représentant Universitaire, Participant, Partenaire). Il illustre les interactions principales comme l'authentification, la gestion des sessions, la prise de présence, et l'administration des catalogues de formation. Les relations entre les cas d'utilisation mettent en évidence les dépendances métier, notamment la contrainte que la prise de présence nécessite l'assignation préalable d'un mentor.

---

### Figure 3.2 : Diagramme de classes
**Fichier :** `docs/diagrams/class-diagram-fr@3x.png`

**Description :** Ce diagramme de classes détaille la structure conceptuelle de la base de données et les relations entre les entités principales. On y retrouve le modèle utilisateur avec héritage par discriminateur (Utilisateur de base et ReprésentantUniversité), ainsi que les entités métier : Session, Catalogue, Formation, Participant, et Notification. Les cardinalités et les types de relations (composition, agrégation, association) reflètent les règles de gestion définies dans le cahier des charges.

---

## Chapitre 4 : Réalisation et Implémentation

### 4.1 Module d'Authentification

#### Figure 4.1 : Page de connexion
**URL :** `http://localhost:5173/login`

**Description :** Interface d'authentification sécurisée permettant aux utilisateurs de se connecter à la plateforme via leur email et mot de passe. Le formulaire intègre une validation côté client et affiche un indicateur de chargement durant la requête d'authentification. En cas de succès, l'utilisateur est redirigé vers son tableau de bord selon son rôle. Un lien "Mot de passe oublié" permet d'initier le processus de réinitialisation. Le design responsive s'adapte aux écrans mobiles et tablettes.

---

#### Figure 4.2 : Formulaire de réinitialisation de mot de passe
**URL :** `http://localhost:5173/forgot-password`

**Description :** Page dédiée à la récupération de compte permettant à l'utilisateur de demander la réinitialisation de son mot de passe en saisissant son adresse email. Après soumission, un email contenant un lien sécurisé avec token à usage unique (validité 10 minutes) est envoyé. Ce mécanisme garantit la sécurité du processus de réinitialisation tout en offrant une expérience utilisateur fluide. L'interface affiche des messages de confirmation et d'erreur explicites.

---

### 4.2 Tableau de bord Administrateur

#### Figure 4.3 : Vue d'ensemble du tableau de bord
**URL :** `http://localhost:5173/` (connecté en tant qu'admin)

**Description :** Tableau de bord principal de l'administrateur offrant une vue synthétique de l'activité de la plateforme. Il regroupe quatre sections clés : les widgets de statistiques en temps réel (nombre d'utilisateurs, sessions actives, catalogues), un tableau des sessions récentes avec leur statut, un calendrier mensuel des sessions planifiées, et les cartes des catalogues de formation disponibles. La navigation latérale (sidebar) permet d'accéder rapidement aux différents modules de gestion.

---

#### Figure 4.4 : Widgets de statistiques
**Zone :** Section supérieure du dashboard (stats cards)

**Description :** Ensemble de quatre indicateurs clés de performance (KPI) affichés sous forme de cartes colorées. Chaque widget présente une statistique en temps réel : nombre total d'utilisateurs, nombre de sessions (filtrées par statut), nombre de catalogues disponibles, et taux de participation. Ces données sont récupérées dynamiquement depuis l'API backend via l'endpoint `/api/users/stats` et se mettent à jour automatiquement lors du chargement de la page.

---

#### Figure 4.5 : Calendrier des sessions
**Zone :** Section calendrier du dashboard

**Description :** Calendrier mensuel interactif affichant les jours où des sessions de formation sont planifiées, marqués par des indicateurs visuels (dots orange). L'utilisateur peut naviguer entre les mois via les flèches de navigation. Le jour actuel est mis en évidence pour faciliter le repérage temporel. Ce composant offre une vue d'ensemble rapide de la charge de formation sur le mois en cours et permet d'anticiper les périodes d'activité intense.

---

#### Figure 4.6 : Cartes des catalogues de formation
**Zone :** Section catalogues du dashboard (4 derniers catalogues)

**Description :** Affichage des quatre catalogues de formation les plus récents sous forme de cartes visuelles. Chaque carte présente l'image de couverture, le titre du catalogue, le niveau (débutant/intermédiaire/avancé), les technologies enseignées, et le nom du formateur. Cette présentation permet aux utilisateurs de découvrir rapidement les formations disponibles et d'accéder aux détails via un clic sur la carte.

---

### 4.3 Gestion des Utilisateurs

#### Figure 4.7 : Liste des utilisateurs
**Navigation :** Dashboard → Users

**Description :** Interface complète de gestion des utilisateurs affichant un tableau dynamique avec les informations essentielles : nom, email, téléphone, rôle, et statut (actif/désactivé). La barre de recherche permet de filtrer les utilisateurs par nom ou email, tandis que les boutons de filtre par rôle (Admin, Mentor ODC, Représentant Universitaire, Prestataire) facilitent la segmentation. Les actions disponibles (édition, désactivation, suppression) sont accessibles via des icônes dans chaque ligne.

---

#### Figure 4.8 : Formulaire d'ajout d'utilisateur
**Action :** Cliquer sur "Add User"

**Description :** Modal de création d'un nouvel utilisateur intégrant un formulaire complet avec validation en temps réel. Les champs obligatoires incluent le nom, l'email, le mot de passe initial, le numéro de téléphone (avec sélection d'indicatif international), et le rôle. Selon le rôle sélectionné, des champs conditionnels apparaissent : pour le rôle "Représentant Universitaire", un menu déroulant permet de sélectionner l'université d'appartenance et de définir le quota maximum de demandes de formation.

---

#### Figure 4.9 : Modification de rôle utilisateur
**Action :** Cliquer sur l'icône d'édition puis modifier le rôle

**Description :** Interface de modification de rôle mettant en évidence la gestion des discriminateurs Mongoose. Lors du changement de rôle vers "Représentant Universitaire", un champ supplémentaire (sélection d'université) devient obligatoire. Le système gère automatiquement la suppression et recréation du document utilisateur côté backend pour respecter les contraintes du schéma discriminateur. Un message de confirmation prévient l'utilisateur des implications du changement de rôle.

---

#### Figure 4.10 : Filtrage par rôle
**Action :** Activer les filtres de rôle (boutons admin/mentor/etc.)

**Description :** Démonstration du système de filtrage multi-critères permettant d'afficher uniquement les utilisateurs d'un ou plusieurs rôles spécifiques. Les boutons de filtre changent visuellement d'état (actif/inactif) et le tableau se met à jour instantanément sans rechargement de page. Cette fonctionnalité facilite la gestion d'une base utilisateurs importante en permettant une segmentation rapide selon les besoins administratifs.

---

### 4.4 Gestion des Catalogues

#### Figure 4.11 : Liste des catalogues
**Navigation :** Dashboard → Catalogues

**Description :** Page de gestion des catalogues de formation présentant l'ensemble des programmes disponibles sous forme de grille de cartes. Chaque carte affiche l'image de couverture, le titre, la description abrégée, le niveau de difficulté, les technologies enseignées (badges colorés), et les formateurs assignés. Les actions d'édition et de suppression sont accessibles via des icônes en overlay au survol. Un bouton "Ajouter un catalogue" permet d'initier la création d'un nouveau programme.

---

#### Figure 4.12 : Formulaire de création de catalogue
**Action :** Cliquer sur "Add Catalogue"

**Description :** Formulaire modal complet de création d'un catalogue de formation comprenant plusieurs sections : informations générales (titre, objectifs, prérequis), détails pédagogiques (programme journalier avec créneaux horaires), paramètres techniques (langue d'enseignement, niveau, type de formation), et ressources (upload d'image de couverture, sélection des formateurs). Le champ "Programme" permet de structurer les journées de formation en créneaux horaires avec description de chaque session. La validation s'effectue en temps réel pour garantir la complétude des données.

---

#### Figure 4.13 : Gestion des catégories
**Navigation :** Dashboard → Categories

**Description :** Interface d'administration des catégories de formation permettant de structurer et d'organiser les catalogues. Le tableau affiche les catégories existantes avec leur nom et le catalogue associé. Les fonctionnalités CRUD (Create, Read, Update, Delete) sont accessibles via des boutons d'action. Cette hiérarchisation facilite la navigation et la recherche de formations pour les utilisateurs finaux en regroupant les catalogues par thématique (Développement Web, Data Science, Cybersécurité, etc.).

---

### 4.5 Gestion des Sessions

#### Figure 4.14 : Liste des sessions
**Navigation :** Dashboard → Sessions

**Description :** Interface centralisée de gestion des sessions de formation affichant un tableau détaillé avec les informations clés : catalogue ou formation associé(e), formateur assigné, dates de début et fin, statut de la session (badges colorés : orange pour "En attente", vert pour "Confirmée", rouge pour "Rejetée", bleu pour "Terminée"), et nombre de participants inscrits. Les fonctionnalités de recherche et de filtrage par statut permettent une navigation efficace. Les actions disponibles incluent la modification, la confirmation, et la gestion des participants.

---

#### Figure 4.15 : Création d'une session
**Action :** Cliquer sur "Create Session"

**Description :** Formulaire modal de planification d'une nouvelle session intégrant plusieurs étapes : sélection du catalogue ou de la formation, choix des dates et horaires (avec sélecteur de dates interactif), assignation optionnelle d'un formateur (liste déroulante des mentors ODC disponibles), et proposition de plages horaires alternatives. Le système valide automatiquement la cohérence des dates et détecte les conflits d'emploi du temps du formateur sélectionné. L'interface guide l'utilisateur avec des messages d'aide contextuels.

---

#### Figure 4.16 : Assignation de mentor
**Zone :** Champ "Formateur" dans le formulaire de session

**Description :** Menu déroulant de sélection de formateur affichant la liste complète des utilisateurs ayant le rôle "Mentor ODC". Chaque option présente le nom complet du mentor et son email. Cette fonctionnalité est essentielle au workflow de validation des sessions, car seul le mentor assigné sera autorisé ultérieurement à effectuer la prise de présence des participants. Le système vérifie la disponibilité du mentor sur la plage horaire sélectionnée avant validation.

---

#### Figure 4.17 : Statuts des sessions
**Zone :** Colonne "Statut" du tableau de sessions

**Description :** Affichage visuel des différents états possibles d'une session via des badges de couleur normalisés : "En attente" (orange) pour les sessions créées en attente de validation, "Confirmée" (vert) pour les sessions validées et planifiées, "Terminée" (bleu) pour les sessions achevées, et "Rejetée" (rouge) pour les demandes refusées avec indication du motif de rejet. Cette codification couleur permet une lecture rapide de l'état du planning de formation et facilite le suivi administratif.

---

### 4.6 Gestion des Participants

#### Figure 4.18 : Liste des participants d'une session
**Action :** Cliquer sur "View Participants" pour une session

**Description :** Modal affichant la liste complète des participants inscrits à une session spécifique. Le tableau présente les informations détaillées : nom complet, email, numéro de téléphone avec indicatif pays, niveau de compétence (débutant/intermédiaire/avancé), genre, et statut de présence (icône verte pour présent, grise pour absent). Cette vue permet au mentor et aux administrateurs de consulter la composition du groupe et de vérifier les informations de contact des apprenants.

---

#### Figure 4.19 : Ajout de participants (Représentant Universitaire)
**Connexion :** Se connecter en tant que `university_representative`  
**Action :** Ouvrir modal "Add Participants"

**Description :** Interface réservée aux représentants universitaires pour l'inscription des participants à une session. Le formulaire propose deux modes de saisie : import massif via fichier Excel/CSV (téléchargement d'un template formaté), ou saisie manuelle individuelle. Chaque participant nécessite les informations suivantes : nom, prénom, email, CIN, téléphone, niveau, et genre. Cette restriction d'accès par rôle garantit que seuls les représentants universitaires autorisés peuvent inscrire des étudiants, conformément au workflow métier défini.

---

#### Figure 4.20 : Import de participants via fichier
**Zone :** Section d'upload de fichier dans le modal d'ajout

**Description :** Fonctionnalité d'importation en masse permettant de charger une liste de participants depuis un fichier Excel (.xlsx) ou CSV. L'utilisateur télécharge d'abord un modèle de fichier pré-formaté contenant les en-têtes de colonnes obligatoires (Nom, Prénom, Email, CIN, Téléphone, Niveau, Genre). Après sélection du fichier, le système parse automatiquement les données, effectue une validation (détection des doublons, vérification du format email), et affiche un aperçu avant confirmation. Cette méthode accélère considérablement l'inscription de groupes importants (50+ participants).

---

### 4.7 Prise de Présence

#### Figure 4.21 : Interface de prise de présence (Mentor)
**Connexion :** Se connecter en tant que `odc_mentor` assigné à la session  
**Action :** Cliquer sur "Mark Presence"

**Description :** Interface dédiée au marquage de présence, accessible uniquement au mentor ODC assigné à la session. Le système vérifie automatiquement l'identité du formateur connecté avant d'autoriser l'accès (contrôle backend avec code 403 en cas d'utilisateur non autorisé). La liste affiche tous les participants inscrits avec leur photo de profil, nom, et un toggle interactif pour marquer présent/absent. Cette restriction garantit l'intégrité des données de présence et leur conformité aux exigences de certification.

---

#### Figure 4.22 : Liste de présence avec toggle
**Zone :** Tableau des participants dans le modal de présence

**Description :** Composant de marquage interactif permettant au mentor de basculer l'état de présence de chaque participant via un switch toggle (présent en vert, absent en gris). Les modifications sont enregistrées en temps réel avec mise à jour optimiste côté client : l'interface change instantanément, puis confirme avec le backend. En cas d'erreur réseau ou de permission refusée (403), le système revient automatiquement à l'état précédent et affiche un message d'erreur. Cette approche assure une expérience fluide tout en préservant la cohérence des données.

---

### 4.8 Profil Utilisateur

#### Figure 4.23 : Onglet Informations personnelles
**Navigation :** Menu utilisateur (avatar) → Profile → Informations

**Description :** Page de modification du profil utilisateur structurée en onglets. L'onglet "Informations personnelles" permet de mettre à jour le nom complet, l'adresse email, et le numéro de téléphone. L'avatar de profil est modifiable via upload d'image (formats acceptés : JPG, PNG, max 2 Mo). Le formulaire intègre une validation en temps réel des champs (format email valide, numéro de téléphone conforme au pays sélectionné). Un bouton "Enregistrer les modifications" soumet les changements à l'API backend avec gestion des erreurs (email déjà utilisé, champs invalides).

---

#### Figure 4.24 : Composant de saisie téléphone
**Zone :** Champ téléphone dans le formulaire de profil

**Description :** Composant personnalisé `PhoneInput` permettant la saisie de numéros de téléphone internationaux. Il combine un menu déroulant de sélection de pays (avec drapeaux et indicatifs +33, +216, +1, etc.) et un champ de saisie du numéro local. Le composant effectue une validation contextuelle selon le pays sélectionné et formate automatiquement le numéro. Cette solution, stabilisée via `useCallback` pour éviter les boucles de rendu infinies, offre une meilleure expérience utilisateur que la saisie manuelle de l'indicatif.

---

#### Figure 4.25 : Onglet Sécurité - Changement de mot de passe
**Navigation :** Profile → Onglet "Password"

**Description :** Interface sécurisée de modification du mot de passe exigeant la saisie de l'ancien mot de passe pour validation, puis la saisie et confirmation du nouveau mot de passe (minimum 6 caractères). Le système vérifie côté backend la correspondance de l'ancien mot de passe avant d'autoriser le changement. Les champs sont de type `password` (masqués) avec option de visibilité toggle (icône œil). En cas de succès, l'utilisateur reçoit une notification de confirmation et est invité à se reconnecter avec ses nouveaux identifiants.

---

#### Figure 4.26 : Onglet Notifications
**Navigation :** Profile → Onglet "Notifications"

**Description :** Panneau de gestion des préférences de notification permettant à l'utilisateur de personnaliser les alertes qu'il souhaite recevoir. Les options incluent : notifications de nouvelles sessions, changements de statut de session, invitations à devenir formateur, réponses aux demandes de formation, et rappels avant une session. Chaque catégorie dispose d'un toggle activé/désactivé. Ces préférences sont stockées dans le profil utilisateur et respectées par le système de notification en temps réel.

---

### 4.9 Système de Notifications

#### Figure 4.27 : Badge de notifications non lues
**Zone :** Icône de notification dans la barre de navigation (header)

**Description :** Indicateur visuel de notifications non lues affiché dans la barre de navigation supérieure sous forme d'icône cloche avec badge numérique rouge. Le compteur affiche le nombre total de notifications non consultées et se met à jour en temps réel. Au clic sur l'icône, un menu déroulant affiche les 5 dernières notifications avec aperçu du titre et de la date. Un lien "Voir toutes les notifications" redirige vers la page complète de l'historique.

---

#### Figure 4.28 : Liste complète des notifications
**Navigation :** Cliquer sur "Voir toutes les notifications" ou Menu → Notifications

**Description :** Page dédiée affichant l'historique complet des notifications reçues par l'utilisateur, triées par ordre chronologique décroissant (plus récentes en premier). Chaque notification présente un titre descriptif, un message détaillé, l'émetteur (acteur), et l'horodatage. Les notifications non lues sont mises en évidence avec un fond coloré. Des actions sont disponibles : marquer comme lu/non lu, supprimer. Un système de filtrage permet de segmenter par type de notification (session, demande de formation, invitation mentor).

---

### 4.10 Responsive Design

#### Figure 4.29 : Menu hamburger (Mobile)
**Action :** Réduire la fenêtre à une largeur mobile (<1024px) et observer le header

**Description :** Adaptation responsive de la barre de navigation pour les écrans mobiles et tablettes. Le menu de navigation latéral classique est remplacé par une icône hamburger (trois barres horizontales) positionnée en haut à gauche. Au clic sur cette icône, la sidebar s'affiche en overlay plein écran avec un fond semi-transparent et une animation de glissement depuis la gauche. Cette approche préserve l'espace d'affichage sur les petits écrans tout en maintenant l'accessibilité de toutes les fonctionnalités.

---

#### Figure 4.30 : Sidebar responsive
**Zone :** Sidebar ouverte sur écran mobile (<1024px)

**Description :** Menu de navigation latéral adaptatif s'affichant en mode overlay sur les écrans de largeur inférieure à 1024 pixels. La sidebar occupe 80% de la largeur de l'écran avec un fond blanc et une ombre portée, tandis qu'un overlay gris semi-transparent couvre le reste de l'écran. L'utilisateur peut fermer le menu en cliquant sur l'overlay, sur l'icône de fermeture (X), ou en sélectionnant un élément de navigation. Sur les écrans larges (desktop), la sidebar reste fixée à gauche de manière permanente avec une largeur de 288px.

---

## Instructions de Capture

### Configuration Requise
```powershell
# Terminal 1 : Backend
cd server
node server.js

# Terminal 2 : Frontend
cd client
npm run dev
```

### Paramètres de Capture
- **Résolution minimale :** 1920 × 1080 px
- **Format recommandé :** PNG (qualité maximale)
- **Navigateur :** Chrome ou Edge (dernière version)
- **Outil Windows :** `Win + Shift + S` (Outil Capture d'écran)
- **Extension Chrome :** "GoFullPage" pour captures pleine page

### Comptes de Test à Créer
1. **Admin :** admin@odc.tn / password123
2. **Mentor ODC :** mentor@odc.tn / password123
3. **Représentant Universitaire :** univ@example.tn / password123
4. **Participant :** participant@example.tn / password123

### Organisation des Fichiers
```
docs/
  screenshots/
    01-conception/
      fig3-1-use-cases.png
      fig3-2-class-diagram.png
    02-auth/
      fig4-1-login.png
      fig4-2-forgot-password.png
    03-dashboard/
      fig4-3-dashboard-overview.png
      fig4-4-stats-widgets.png
      fig4-5-calendar.png
      fig4-6-catalogues-cards.png
    04-users/
      fig4-7-users-list.png
      fig4-8-add-user-form.png
      fig4-9-change-role.png
      fig4-10-role-filter.png
    05-catalogues/
      fig4-11-catalogues-list.png
      fig4-12-add-catalogue-form.png
      fig4-13-categories.png
    06-sessions/
      fig4-14-sessions-list.png
      fig4-15-create-session.png
      fig4-16-assign-mentor.png
      fig4-17-session-statuses.png
    07-participants/
      fig4-18-participants-list.png
      fig4-19-add-participants-univrep.png
      fig4-20-import-participants.png
    08-presence/
      fig4-21-mark-presence-interface.png
      fig4-22-presence-toggles.png
    09-profile/
      fig4-23-profile-info.png
      fig4-24-phone-input.png
      fig4-25-change-password.png
      fig4-26-notifications-preferences.png
    10-notifications/
      fig4-27-notifications-badge.png
      fig4-28-notifications-list.png
    11-responsive/
      fig4-29-hamburger-menu.png
      fig4-30-sidebar-overlay.png
```

### Bonnes Pratiques
- ✅ Flouter les données personnelles sensibles (emails réels, numéros de téléphone)
- ✅ Utiliser des données de démonstration cohérentes et professionnelles
- ✅ Capturer en mode plein écran pour éviter les distractions visuelles
- ✅ Désactiver les extensions de navigateur (sauf nécessaires)
- ✅ Vérifier que les données affichées sont en français (dates, labels)
- ✅ S'assurer que l'interface est complète (pas de zone de chargement vide)
- ✅ Capturer après stabilisation des animations

### Post-Traitement
- **Recadrage :** Centrer sur la zone pertinente
- **Annotation :** Ajouter des flèches/encadrés si nécessaire (outil : Snagit, Greenshot)
- **Compression :** Optimiser les PNG avec TinyPNG (conserver >90% qualité)
- **Numérotation :** Renommer selon la convention `figX-Y-description.png`

---

**Note :** Ce guide servira de référence pour la section "Réalisation" du rapport de stage. Chaque capture doit être accompagnée dans le rapport de sa description complète ci-dessus pour assurer la compréhension du lecteur.
