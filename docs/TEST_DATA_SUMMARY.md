# 📊 Données de Test - Récapitulatif

## ✅ Base de données remplie avec succès !

Date de génération : 1er novembre 2025

### 📈 Résumé des données créées

| Type de données | Quantité | Détails |
|----------------|----------|---------|
| **🏫 Universités** | 15 | Universités tunisiennes réelles |
| **👥 Utilisateurs** | 27 | 1 admin + 8 mentors + 15 représentants + 3 prestataires |
| **📚 Catalogues** | 8 | Formations techniques variées |
| **📂 Catégories** | 8 | Une par catalogue |
| **📅 Sessions** | 97 | Réparties sur 12 mois |
| **👨‍🎓 Participants** | 2,277 | 15-40 par session |
| **📝 Demandes** | 30 | Divers statuts et types |
| **🔔 Notifications** | 50 | Liées aux demandes et sessions |

---

## 🔐 Comptes de test

### Administrateur
```
Email: admin@odc.tn
Mot de passe: password123
```

### Mentors ODC (8 comptes)
```
Email: mentor1@odc.tn à mentor8@odc.tn
Mot de passe: password123

Liste des mentors:
- Amine Ben Salah (mentor1@odc.tn)
- Sarra Gharbi (mentor2@odc.tn)
- Mohamed Trabelsi (mentor3@odc.tn)
- Fatma Karray (mentor4@odc.tn)
- Youssef Mansour (mentor5@odc.tn)
- Leila Hammami (mentor6@odc.tn)
- Karim Bouzid (mentor7@odc.tn)
- Nesrine Jlassi (mentor8@odc.tn)
```

### Représentants Universitaires (15 comptes)
```
Email: rep1@university.tn à rep15@university.tn
Mot de passe: password123

Chaque représentant est lié à une université:
- rep1 → Université de Tunis El Manar
- rep2 → Université de Carthage
- rep3 → Université de Sfax
- rep4 → Université de Sousse
- rep5 → Université de Monastir
- rep6 → Université de Gabès
- rep7 → Université de Gafsa
- rep8 → Université de Kairouan
- rep9 → Université de Jendouba
- rep10 → Université de la Manouba
- rep11 → École Polytechnique de Tunisie
- rep12 → INSAT
- rep13 → ESPRIT
- rep14 → ENIT
- rep15 → ISI
```

### Prestataires (3 comptes)
```
Email: prestataire1@company.tn à prestataire3@company.tn
Mot de passe: password123

- TechnoSolutions (prestataire1@company.tn)
- DigiLearn (prestataire2@company.tn)
- FormaPro (prestataire3@company.tn)
```

---

## 📚 Catalogues de formation

### 1. Développement Web Fullstack avec MERN
- **Niveau**: Intermédiaire
- **Technologies**: MongoDB, Express.js, React, Node.js, Tailwind CSS
- **Programme**: 3 jours (Architecture MERN, React, Backend MongoDB)

### 2. Intelligence Artificielle et Machine Learning
- **Niveau**: Avancé
- **Technologies**: Python, TensorFlow, Scikit-learn, Pandas, NumPy
- **Programme**: 2 jours (Fondamentaux ML, Algorithmes supervisés)

### 3. Cybersécurité - Sécurisation des Applications Web
- **Niveau**: Intermédiaire
- **Technologies**: OWASP, Burp Suite, Metasploit, Wireshark
- **Programme**: 1 jour (Vulnérabilités OWASP Top 10)

### 4. Design UX/UI avec Figma
- **Niveau**: Débutant
- **Technologies**: Figma, Adobe XD, Prototyping
- **Programme**: 1 jour (Principes UX, Wireframing)

### 5. DevOps et CI/CD
- **Niveau**: Avancé
- **Technologies**: Docker, Kubernetes, Jenkins, GitLab CI, Terraform
- **Programme**: 1 jour (Conteneurisation Docker)

### 6. Développement Mobile avec React Native
- **Niveau**: Intermédiaire
- **Technologies**: React Native, Expo, Redux, Firebase
- **Programme**: 1 jour (React Native essentials)

### 7. Data Science avec Python
- **Niveau**: Intermédiaire
- **Technologies**: Python, Pandas, Matplotlib, Seaborn, Jupyter
- **Programme**: 1 jour (Analyse exploratoire)

### 8. Cloud Computing avec AWS
- **Niveau**: Avancé
- **Technologies**: AWS EC2, S3, Lambda, RDS, CloudFormation
- **Programme**: 1 jour (Services AWS essentiels)

---

## 📅 Distribution des Sessions (97 total)

### Par statut
- **COMPLETED** (sessions passées): ~68 sessions (70%)
- **CONFIRMED** (sessions planifiées): ~15 sessions (15%)
- **PENDING** (en attente): ~10 sessions (10%)
- **REJECTED** (refusées): ~4 sessions (5%)

### Par période
- Sessions réparties équitablement sur les **12 derniers mois**
- 4 à 12 sessions par mois
- Dates cohérentes avec leur statut :
  - COMPLETED → dates passées
  - CONFIRMED/PENDING → dates récentes ou futures

---

## 👨‍🎓 Participants (2,277 total)

### Caractéristiques
- **15 à 40 participants** par session confirmée/complétée
- **Taux de présence**: 70-95% pour sessions complétées
- **Données complètes**: nom, email, téléphone tunisien (+216), niveau, genre
- **Noms réalistes**: Combinaisons de prénoms et noms tunisiens courants

### Exemples de participants
- Ahmed Ben Salah
- Fatma Trabelsi
- Mohamed Gharbi
- Sarra Mansour
- Youssef Karray
- Et 2,272 autres...

---

## 📝 Demandes de Formation (30 total)

### Répartition
- **Type NEW**: ~24 demandes (80%)
- **Type MODIFICATION**: ~6 demandes (20%)

### Statuts
- **APPROVED**: ~40%
- **PENDING**: ~40%
- **REJECTED**: ~20%

### Période
- Soumises au cours des **60 derniers jours**
- Dates de formation proposées cohérentes (1-2 semaines après demande)

---

## 🔔 Notifications (50 total)

### Types
1. **TRAINING_REQUEST**: Nouvelle demande de formation
2. **TRAINING_REQUEST_STATUS**: Réponse à une demande
3. **MENTOR_INVITE**: Invitation à animer une formation
4. **MENTOR_INVITE_RESPONSE**: Réponse du mentor

### État de lecture
- **Lues**: 40%
- **Non lues**: 60%

---

## 🧪 Scénarios de test

### 1. Connexion et Dashboard
```
1. Se connecter en tant qu'admin (admin@odc.tn)
2. Vérifier le dashboard avec statistiques réelles
3. Naviguer vers "Chiffres Clés" pour voir les graphiques
```

### 2. Gestion des utilisateurs
```
1. Aller dans "Utilisateurs"
2. Voir les 27 comptes créés
3. Filtrer par rôle (admin/mentor/representative/prestataire)
4. Tester désactivation d'un compte
```

### 3. Catalogues et formations
```
1. Accéder aux "Catalogues"
2. Voir les 8 formations disponibles
3. Consulter les détails (technologies, programme, niveau)
4. Voir les formateurs assignés
```

### 4. Sessions de formation
```
1. Aller dans "Sessions"
2. Voir les 97 sessions sur 12 mois
3. Filtrer par statut (COMPLETED, CONFIRMED, PENDING, REJECTED)
4. Consulter les participants pour sessions complétées
```

### 5. Participants
```
1. Accéder aux "Participants"
2. Voir les 2,277 participants
3. Filtrer par session
4. Vérifier les taux de présence
```

### 6. Demandes de formation
```
1. Consulter les "Demandes"
2. Voir les 30 demandes avec différents statuts
3. Tester approbation/rejet (en tant qu'admin)
```

### 7. Statistiques (Chiffres Clés)
```
1. Naviguer vers "Chiffres Clés"
2. Vérifier les KPIs (formations, universités, étudiants)
3. Analyser les graphiques :
   - Évolution mensuelle (ligne)
   - Répartition par confiance (donut)
   - Attentes étudiants (barres)
   - Durée/rythme préférés (barres)
4. Consulter les notes de satisfaction
5. Filtrer les sessions par formateur/université/type
```

### 8. Notifications
```
1. Cliquer sur l'icône notifications
2. Voir les 50 notifications
3. Marquer comme lues
4. Filtrer par type
```

---

## 🔍 Vérification de cohérence

### Relations validées ✅
- Chaque session a un catalogue, formateur et demandeur valides
- Chaque représentant est lié à une université
- Les participants sont uniquement dans sessions COMPLETED/CONFIRMED
- Les notifications référencent des demandes et utilisateurs réels
- Les dates sont logiques par rapport aux statuts

### Contraintes respectées ✅
- Emails uniques pour tous les utilisateurs
- Numéros de téléphone tunisiens (+216)
- Taux de présence réalistes (70-95%)
- Distribution temporelle cohérente (12 mois)
- Technologies et programmes réalistes

---

## 🛠️ Commandes utiles

### Régénérer les données
```bash
cd server
npm run seed
```

### Démarrer le serveur
```bash
cd server
npm start
```

### Démarrer le client
```bash
cd client
npm run dev
```

---

## 📌 Notes importantes

1. **Mot de passe universel**: Tous les comptes utilisent `password123` pour faciliter les tests
2. **Emails structurés**: Pattern clair pour identifier rapidement le type d'utilisateur
3. **Données réalistes**: Noms, universités et technologies tunisiens/actuels
4. **Volumes représentatifs**: Quantités suffisantes pour tester pagination, filtres, etc.
5. **Cohérence temporelle**: Distribution sur 12 mois pour statistiques significatives

---

## 🎯 Utilisation recommandée

### Pour développement
- Utilisez les données telles quelles pour développer de nouvelles fonctionnalités
- Les volumes sont suffisants pour tester les performances

### Pour démonstrations
- Connectez-vous en admin pour avoir accès complet
- Les statistiques sont visuellement intéressantes
- Les données sont professionnelles et réalistes

### Pour tests
- Utilisez différents comptes pour tester les permissions
- Les sessions variées permettent de tester tous les statuts
- Les participants nombreux testent la pagination

---

## 📧 Support

Pour régénérer les données ou modifier les quantités, consultez :
- `server/scripts/seedDatabase.js` - Script principal
- `server/scripts/README.md` - Documentation détaillée

**Bon développement ! 🚀**
