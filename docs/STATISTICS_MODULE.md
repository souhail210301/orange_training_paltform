# Section "Chiffres Clés" - Documentation

## Vue d'ensemble

La section **Chiffres Clés** est un tableau de bord analytique complet qui fournit des statistiques détaillées sur les formations, les sessions, et les participants de la plateforme ODC Certif.

## Fonctionnalités

### 1. Cartes de statistiques principales
- **Formations demandées** : Nombre total de formations demandées
- **Universités inscrites** : Nombre d'universités partenaires
- **Étudiants formés** : Nombre total d'étudiants ayant participé aux sessions

### 2. Graphiques analytiques

#### Graphique linéaire - Nombre de formations
- Affiche l'évolution mensuelle des formations demandées
- Données en temps réel calculées depuis les sessions
- Navigation visuelle sur 12 mois

#### Graphique en donut - Confiance d'application
- Répartition de la confiance des utilisateurs
- 5 niveaux : Très Confiant, Confiant, Moyennement content, Peu confiant, Pas du tout confiant
- Données collectées depuis les feedbacks

#### Graphiques à barres
- **Attentes des étudiants** : Taux de présence par formation
- **Durée & Rythme** : Satisfaction sur le rythme et la durée des formations

### 3. Évaluations de satisfaction (6 métriques)
- Taux de satisfaction global
- Qualité du contenu
- Engagement
- Style de présentation
- Environnement de la formation
- Connaissance du sujet

Chaque métrique affiche :
- Score sur 10
- Répartition détaillée par niveau de satisfaction

### 4. Tableau des sessions
- Liste complète des sessions avec leurs évaluations
- Colonnes : Formation, Date de session, Satisfaction, Qualité du contenu, Engagement, Style de présentation
- Pagination (20 sessions par page)

### 5. Filtres dynamiques
- **Formateur** : Filtrer par mentor ODC assigné
- **Université** : Filtrer par établissement partenaire
- **Type de Formation** : Catalogue ou Formation
- **Session** : Filtrer par session spécifique
- **Date** : Filtrage par plage de dates (à venir)

## Architecture

### Frontend
**Fichier** : `client/src/components/AdminDashboard/Statistics.jsx`

**Technologies utilisées** :
- React (hooks: useState, useEffect)
- Lucide React (icônes)
- SVG pour les graphiques personnalisés
- Tailwind CSS pour le styling

**État local** :
```javascript
{
  formationsRequested: Number,
  universitiesRegistered: Number,
  studentsFormed: Number,
  monthlyData: Array<{month: String, count: Number}>,
  confidenceData: Object,
  attendanceData: Array,
  durationData: Array,
  satisfactionRatings: Object,
  sessionsData: Array
}
```

### Backend

**Contrôleur** : `server/controllers/statisticsController.js`

**Routes** : `server/routes/statisticsRoutes.js`

**Endpoints** :

#### GET `/api/statistics`
Récupère les statistiques complètes avec filtres optionnels

**Query params** :
- `formateur` (ObjectId) : ID du formateur
- `universite` (ObjectId) : ID de l'université
- `session` (ObjectId) : ID de la session
- `startDate` (Date) : Date de début
- `endDate` (Date) : Date de fin

**Réponse** :
```json
{
  "formationsRequested": 84,
  "universitiesRegistered": 26,
  "studentsFormed": 1452,
  "monthlyData": [0, 5, 12, 8, ...],
  "confidenceData": {...},
  "attendanceData": [...],
  "durationData": [...],
  "satisfactionRatings": {...},
  "sessionsData": [...],
  "totalSessions": 188
}
```

#### GET `/api/statistics/filters`
Récupère les options de filtrage disponibles

**Réponse** :
```json
{
  "teachers": [{_id, name}, ...],
  "universities": [{_id, name}, ...],
  "sessions": [{_id, title, date}, ...]
}
```

## Intégration

### Dans App.jsx
```javascript
import Statistics from './components/AdminDashboard/Statistics';

// Route handling
if (activePage === 'stats') {
  return <Statistics user={user} onLogout={handleLogout} onNavigate={handleNavigate} activePage={activePage} />;
}
```

### Dans AdminSidebar.jsx
```javascript
{ label: 'Chiffres Clés', icon: <BarChart2 />, key: 'stats' }
```

## Calculs des statistiques

### Formations demandées
```javascript
const formationsRequested = sessions.length;
```

### Étudiants formés
```javascript
const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
const studentsFormed = completedSessions.reduce((total, session) => {
  return total + (session.participants?.length || 0);
}, 0);
```

### Taux de présence
```javascript
const presentCount = session.participants?.filter(p => p.presence).length || 0;
const totalCount = session.participants?.length || 1;
const attendancePercentage = Math.round((presentCount / totalCount) * 100);
```

### Données mensuelles
```javascript
const monthlyData = Array(12).fill(0);
sessions.forEach(session => {
  if (session.scheduled_at) {
    const month = new Date(session.scheduled_at).getMonth();
    monthlyData[month]++;
  }
});
```

## Permissions

- **Accès** : Tous les utilisateurs authentifiés
- **Filtrage** : Basé sur le rôle de l'utilisateur (mentors voient leurs sessions, représentants universitaires voient leurs universités, etc.)

## Améliorations futures

1. **Export de données**
   - Export Excel/CSV des statistiques
   - Export PDF des graphiques

2. **Graphiques avancés**
   - Utilisation de Chart.js ou Recharts pour des graphiques interactifs
   - Zoom et pan sur les graphiques linéaires

3. **Feedbacks réels**
   - Intégration du modèle Feedback pour des données de satisfaction réelles
   - Système de notation par les participants

4. **Comparaisons**
   - Comparaison année sur année
   - Benchmarks entre formations

5. **Alertes**
   - Notifications pour taux de satisfaction faible
   - Alertes pour formations sous-performantes

6. **Dashboard temps réel**
   - WebSocket pour mise à jour en temps réel
   - Actualisation automatique des statistiques

## Exemples d'utilisation

### Filtrer par formateur
```javascript
setFilters({ ...filters, formateur: 'teacher_id' });
```

### Réinitialiser les filtres
```javascript
setFilters({
  formateur: '',
  universite: '',
  typeFormation: '',
  session: '',
  dateRange: ''
});
```

### Exporter les données (à implémenter)
```javascript
const exportToCSV = () => {
  const csv = convertToCSV(stats.sessionsData);
  downloadCSV(csv, 'statistics.csv');
};
```

## Tests

### Tests manuels
1. Accéder à la page via le menu "Chiffres Clés"
2. Vérifier l'affichage des 3 cartes de statistiques
3. Tester chaque filtre individuellement
4. Combiner plusieurs filtres
5. Vérifier la pagination du tableau
6. Tester le responsive design (mobile, tablette, desktop)

### Tests automatisés (à implémenter)
```javascript
describe('Statistics Component', () => {
  it('should render statistics cards', () => {
    // Test rendering
  });
  
  it('should filter data correctly', () => {
    // Test filtering
  });
  
  it('should calculate attendance percentage correctly', () => {
    // Test calculations
  });
});
```

## Dépannage

### Les statistiques ne se chargent pas
- Vérifier que le token JWT est valide
- Vérifier la connexion à MongoDB
- Vérifier les logs du serveur

### Les graphiques ne s'affichent pas
- Vérifier que les données sont au bon format
- Vérifier la console du navigateur pour les erreurs SVG
- S'assurer que les données ne sont pas vides

### Les filtres ne fonctionnent pas
- Vérifier que les options de filtrage sont chargées
- Vérifier les query params dans la requête API
- Vérifier que le backend applique correctement les filtres

## Contribution

Pour ajouter de nouvelles métriques :

1. Ajouter le champ dans l'état `stats`
2. Calculer la métrique dans `fetchStatistics()`
3. Créer un composant de visualisation
4. Mettre à jour le contrôleur backend si nécessaire

## Support

Pour toute question ou problème, contacter l'équipe de développement ODC Certif.
