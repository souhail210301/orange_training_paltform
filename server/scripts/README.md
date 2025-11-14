# Database Seeding Script

Ce script permet de remplir la base de données avec des données cohérentes et réalistes pour le développement et les tests.

## 🎯 Données générées

Le script crée les données suivantes avec une cohérence complète :

### 👥 Utilisateurs (27 au total)
- **1 Admin** : `admin@odc.tn`
- **8 Mentors ODC** : `mentor1@odc.tn` à `mentor8@odc.tn`
- **15 Représentants universitaires** : `rep1@university.tn` à `rep15@university.tn`
- **3 Prestataires** : `prestataire1@company.tn` à `prestataire3@company.tn`

**Mot de passe pour tous** : `password123`

### 🏫 Universités (15)
- Université de Tunis El Manar
- Université de Carthage
- Université de Sfax
- Université de Sousse
- École Polytechnique de Tunisie
- INSAT, ESPRIT, ENIT, ISI
- Et plus...

### 📚 Catalogues de formation (8)
1. **Développement Web Fullstack avec MERN**
   - Technologies: MongoDB, Express, React, Node.js, Tailwind CSS
   - Niveau: Intermédiaire
   
2. **Intelligence Artificielle et Machine Learning**
   - Technologies: Python, TensorFlow, Scikit-learn, Pandas
   - Niveau: Avancé
   
3. **Cybersécurité - Sécurisation des Applications Web**
   - Technologies: OWASP, Burp Suite, Metasploit
   - Niveau: Intermédiaire
   
4. **Design UX/UI avec Figma**
   - Technologies: Figma, Adobe XD, Prototyping
   - Niveau: Débutant
   
5. **DevOps et CI/CD**
   - Technologies: Docker, Kubernetes, Jenkins, GitLab CI
   - Niveau: Avancé
   
6. **Développement Mobile avec React Native**
   - Technologies: React Native, Expo, Redux, Firebase
   - Niveau: Intermédiaire
   
7. **Data Science avec Python**
   - Technologies: Python, Pandas, Matplotlib, Seaborn
   - Niveau: Intermédiaire
   
8. **Cloud Computing avec AWS**
   - Technologies: AWS EC2, S3, Lambda, RDS
   - Niveau: Avancé

### 📅 Sessions (60-100)
- Réparties sur les **12 derniers mois**
- Statuts variés : PENDING, CONFIRMED, COMPLETED, REJECTED
- Sessions passées principalement COMPLETED (70%)
- Sessions futures/récentes : CONFIRMED ou PENDING

### 👨‍🎓 Participants (1000-3000)
- **15 à 40 participants** par session
- Taux de présence réaliste : **70-95%** pour sessions complétées
- Données complètes : nom, email, téléphone, niveau, genre
- Noms tunisiens réalistes

### 📝 Demandes de formation (30)
- Types : NEW (80%) et MODIFICATION (20%)
- Statuts : PENDING, APPROVED, REJECTED
- Dates proposées cohérentes
- Commentaires optionnels

### 🔔 Notifications (50)
- Types variés : demandes, invitations, réponses
- 40% déjà lues
- Liées aux demandes et sessions existantes

## 🚀 Utilisation

### Option 1 : Via npm script (recommandé)
```bash
cd server
npm run seed
```

### Option 2 : Directement avec Node
```bash
cd server
node scripts/seedDatabase.js
```

## ⚠️ ATTENTION

**Ce script supprime TOUTES les données existantes avant de créer les nouvelles !**

Assurez-vous que :
1. Vous êtes en environnement de **développement** (pas production)
2. Le fichier `.env` est correctement configuré avec `MONGO_URI`
3. Vous avez sauvegardé vos données importantes si nécessaire

## 📊 Sortie attendue

```
✅ MongoDB connected

🗑️  Clearing existing data...
✅ Database cleared

🏫 Seeding universities...
✅ Created 15 universities

👥 Seeding users...
✅ Created 1 admin, 8 mentors, 15 representatives, 3 prestataires

📚 Seeding catalogues and categories...
✅ Created 8 catalogues and 8 categories

📅 Seeding sessions...
✅ Created 75 sessions

👨‍🎓 Seeding participants...
✅ Created 1850 participants across 75 sessions

📝 Seeding training requests...
✅ Created 30 training requests

🔔 Seeding notifications...
✅ Created 50 notifications

✨ Database seeding completed successfully!

📊 Summary:
   - Universities: 15
   - Users: 27
   - Catalogues: 8
   - Sessions: 75
   - Training Requests: 30

🔐 Test credentials:
   Admin: admin@odc.tn / password123
   Mentor: mentor1@odc.tn / password123
   Representative: rep1@university.tn / password123
```

## 🔍 Vérification des données

Après l'exécution, vous pouvez vérifier les données :

### Via MongoDB Compass
1. Connectez-vous avec votre `MONGO_URI`
2. Explorez les collections :
   - `users` : 27 documents
   - `universities` : 15 documents
   - `catalogues` : 8 documents
   - `sessions` : 60-100 documents
   - `participants` : 1000-3000 documents
   - `trainingrequests` : 30 documents
   - `notifications` : 50 documents

### Via l'application
1. Démarrez le serveur : `npm start`
2. Connectez-vous avec : `admin@odc.tn` / `password123`
3. Naviguez dans les différentes sections :
   - Dashboard pour voir les statistiques
   - Utilisateurs pour voir les 27 comptes
   - Catalogues pour voir les 8 formations
   - Sessions pour voir toutes les sessions
   - Chiffres Clés pour voir les graphiques avec données réelles

## 🎨 Cohérence des données

Le script garantit :
- ✅ Toutes les sessions ont un catalogue, un formateur et un demandeur valides
- ✅ Les participants sont liés aux sessions confirmées/complétées
- ✅ Les représentants universitaires sont liés à leur université
- ✅ Les dates de sessions sont réalistes (passées pour COMPLETED, futures pour PENDING)
- ✅ Les taux de présence sont cohérents avec le statut
- ✅ Les notifications sont liées aux demandes et acteurs réels
- ✅ Les demandes de formation respectent les contraintes (université, catalogue)

## 🔧 Personnalisation

Pour modifier les données générées, éditez `seedDatabase.js` :
- Ligne 83-97 : Ajouter/modifier des universités
- Ligne 103-148 : Modifier les noms des mentors/prestataires
- Ligne 154-305 : Ajouter/modifier des catalogues de formation
- Ligne 316-370 : Ajuster le nombre de sessions par mois
- Ligne 377-422 : Modifier le nombre de participants par session

## 📝 Notes

- Les emails suivent un pattern cohérent pour faciliter les tests
- Tous les numéros de téléphone utilisent le code pays tunisien (+216)
- Les technologies listées sont réalistes et modernes
- Les programmes de formation incluent des sessions détaillées
- Les dates sont calculées dynamiquement (12 derniers mois)
