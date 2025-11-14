// scripts/seedDatabase.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const UniversityRepresentative = require('../models/UniversityRepresentative');
const University = require('../models/University');
const Catalogue = require('../models/Catalogue');
const Category = require('../models/Category');
const Formation = require('../models/Formation');
const Session = require('../models/Session');
const Participant = require('../models/Participant');
const TrainingRequest = require('../models/TrainingRequest');
const Notification = require('../models/Notification');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all collections
const clearDatabase = async () => {
  console.log('\n🗑️  Clearing existing data...');
  await User.deleteMany({});
  await University.deleteMany({});
  await Catalogue.deleteMany({});
  await Category.deleteMany({});
  await Formation.deleteMany({});
  await Session.deleteMany({});
  await Participant.deleteMany({});
  await TrainingRequest.deleteMany({});
  await Notification.deleteMany({});
  console.log('✅ Database cleared');
};

// Seed Universities
const seedUniversities = async () => {
  console.log('\n🏫 Seeding universities...');
  const universities = [
    { id_university: 1, name: 'Université de Tunis El Manar' },
    { id_university: 2, name: 'Université de Carthage' },
    { id_university: 3, name: 'Université de Sfax' },
    { id_university: 4, name: 'Université de Sousse' },
    { id_university: 5, name: 'Université de Monastir' },
    { id_university: 6, name: 'Université de Gabès' },
    { id_university: 7, name: 'Université de Gafsa' },
    { id_university: 8, name: 'Université de Kairouan' },
    { id_university: 9, name: 'Université de Jendouba' },
    { id_university: 10, name: 'Université de la Manouba' },
    { id_university: 11, name: 'École Polytechnique de Tunisie' },
    { id_university: 12, name: 'INSAT - Institut National des Sciences Appliquées' },
    { id_university: 13, name: 'ESPRIT - École Supérieure Privée d\'Ingénierie' },
    { id_university: 14, name: 'ENIT - École Nationale d\'Ingénieurs de Tunis' },
    { id_university: 15, name: 'ISI - Institut Supérieur d\'Informatique' },
  ];

  const createdUniversities = await University.insertMany(universities);
  console.log(`✅ Created ${createdUniversities.length} universities`);
  return createdUniversities;
};

// Seed Users
const seedUsers = async (universities) => {
  console.log('\n👥 Seeding users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin - use new + save to bypass discriminator
  const admin = new User({
    name: 'Admin ODC',
    email: 'admin@odc.tn',
    password: hashedPassword,
    phone_number: '+21612345678',
    role: 'admin',
    disabled: false
  });
  await admin.save();

  // ODC Mentors
  const mentors = [];
  const mentorNames = [
    'Amine Ben Salah',
    'Sarra Gharbi',
    'Mohamed Trabelsi',
    'Fatma Karray',
    'Youssef Mansour',
    'Leila Hammami',
    'Karim Bouzid',
    'Nesrine Jlassi'
  ];

  for (let i = 0; i < mentorNames.length; i++) {
    const mentor = new User({
      name: mentorNames[i],
      email: `mentor${i + 1}@odc.tn`,
      password: hashedPassword,
      phone_number: `+21620${String(i).padStart(6, '0')}`,
      role: 'odc_mentor',
      disabled: false
    });
    await mentor.save();
    mentors.push(mentor);
  }

  // University Representatives - use discriminator model
  const representatives = [];
  for (let i = 0; i < 15; i++) {
    const rep = new UniversityRepresentative({
      name: `Représentant ${universities[i].name}`,
      email: `rep${i + 1}@university.tn`,
      password: hashedPassword,
      phone_number: `+21630${String(i).padStart(6, '0')}`,
      university: universities[i]._id,
      max_requests: 10,
      disabled: false
    });
    await rep.save();
    representatives.push(rep);
  }

  // Prestataires
  const prestataires = [];
  const prestataireNames = ['TechnoSolutions', 'DigiLearn', 'FormaPro'];
  for (let i = 0; i < 3; i++) {
    const prest = new User({
      name: prestataireNames[i],
      email: `prestataire${i + 1}@company.tn`,
      password: hashedPassword,
      phone_number: `+21640${String(i).padStart(6, '0')}`,
      role: 'prestataire',
      disabled: false
    });
    await prest.save();
    prestataires.push(prest);
  }

  console.log(`✅ Created 1 admin, ${mentors.length} mentors, ${representatives.length} representatives, ${prestataires.length} prestataires`);
  return { admin, mentors, representatives, prestataires };
};

// Seed Categories and Catalogues
const seedCatalogues = async (users) => {
  console.log('\n📚 Seeding catalogues and categories...');

  const cataloguesData = [
    {
      title: 'Développement Web Fullstack avec MERN',
      objectives: 'Maîtriser le développement d\'applications web modernes avec MongoDB, Express, React et Node.js',
      prerequisites: 'Bases en HTML, CSS et JavaScript',
      language: 'Français',
      level: 'Intermédiaire',
      type: 'Technique',
      technologies: ['MongoDB', 'Express.js', 'React', 'Node.js', 'Tailwind CSS'],
      program: [
        {
          description: 'Introduction au Stack MERN',
          sessions: [
            { from: '09:00', to: '12:00', description: 'Architecture MERN et environnement de développement' },
            { from: '14:00', to: '17:00', description: 'Node.js et Express - Les bases' }
          ]
        },
        {
          description: 'Frontend avec React',
          sessions: [
            { from: '09:00', to: '12:00', description: 'Components, Props et State' },
            { from: '14:00', to: '17:00', description: 'Hooks et gestion d\'état' }
          ]
        },
        {
          description: 'Backend et Base de données',
          sessions: [
            { from: '09:00', to: '12:00', description: 'MongoDB et Mongoose' },
            { from: '14:00', to: '17:00', description: 'API REST et authentification JWT' }
          ]
        }
      ]
    },
    {
      title: 'Intelligence Artificielle et Machine Learning',
      objectives: 'Comprendre et appliquer les concepts de l\'IA et du ML pour résoudre des problèmes réels',
      prerequisites: 'Connaissances en Python et mathématiques',
      language: 'Français',
      level: 'Avancé',
      type: 'Technique',
      technologies: ['Python', 'TensorFlow', 'Scikit-learn', 'Pandas', 'NumPy'],
      program: [
        {
          description: 'Fondamentaux du Machine Learning',
          sessions: [
            { from: '09:00', to: '12:00', description: 'Introduction à l\'IA et ML' },
            { from: '14:00', to: '17:00', description: 'Préparation et analyse de données' }
          ]
        },
        {
          description: 'Algorithmes supervisés',
          sessions: [
            { from: '09:00', to: '12:00', description: 'Régression et classification' },
            { from: '14:00', to: '17:00', description: 'Arbres de décision et Random Forest' }
          ]
        }
      ]
    },
    {
      title: 'Cybersécurité - Sécurisation des Applications Web',
      objectives: 'Identifier et corriger les vulnérabilités courantes des applications web',
      prerequisites: 'Connaissance en développement web',
      language: 'Français',
      level: 'Intermédiaire',
      type: 'Sécurité',
      technologies: ['OWASP', 'Burp Suite', 'Metasploit', 'Wireshark'],
      program: [
        {
          description: 'Vulnérabilités OWASP Top 10',
          sessions: [
            { from: '09:00', to: '12:00', description: 'XSS et injection SQL' },
            { from: '14:00', to: '17:00', description: 'CSRF et broken authentication' }
          ]
        }
      ]
    },
    {
      title: 'Design UX/UI avec Figma',
      objectives: 'Créer des interfaces utilisateur modernes et intuitives',
      prerequisites: 'Aucun',
      language: 'Français',
      level: 'Débutant',
      type: 'Design',
      technologies: ['Figma', 'Adobe XD', 'Prototyping'],
      program: [
        {
          description: 'Principes du Design UX',
          sessions: [
            { from: '09:00', to: '12:00', description: 'User research et personas' },
            { from: '14:00', to: '17:00', description: 'Wireframing et prototyping' }
          ]
        }
      ]
    },
    {
      title: 'DevOps et CI/CD',
      objectives: 'Automatiser le déploiement et la gestion d\'infrastructure',
      prerequisites: 'Bases en Linux et développement',
      language: 'Français',
      level: 'Avancé',
      type: 'Infrastructure',
      technologies: ['Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'Terraform'],
      program: [
        {
          description: 'Conteneurisation avec Docker',
          sessions: [
            { from: '09:00', to: '12:00', description: 'Docker basics et Dockerfile' },
            { from: '14:00', to: '17:00', description: 'Docker Compose et orchestration' }
          ]
        }
      ]
    },
    {
      title: 'Développement Mobile avec React Native',
      objectives: 'Créer des applications mobiles cross-platform',
      prerequisites: 'Connaissances en React',
      language: 'Français',
      level: 'Intermédiaire',
      type: 'Mobile',
      technologies: ['React Native', 'Expo', 'Redux', 'Firebase'],
      program: [
        {
          description: 'React Native essentials',
          sessions: [
            { from: '09:00', to: '12:00', description: 'Setup et composants natifs' },
            { from: '14:00', to: '17:00', description: 'Navigation et état global' }
          ]
        }
      ]
    },
    {
      title: 'Data Science avec Python',
      objectives: 'Analyser et visualiser des données complexes',
      prerequisites: 'Python de base',
      language: 'Français',
      level: 'Intermédiaire',
      type: 'Data',
      technologies: ['Python', 'Pandas', 'Matplotlib', 'Seaborn', 'Jupyter'],
      program: [
        {
          description: 'Analyse exploratoire de données',
          sessions: [
            { from: '09:00', to: '12:00', description: 'Pandas et manipulation de données' },
            { from: '14:00', to: '17:00', description: 'Visualisation avec Matplotlib' }
          ]
        }
      ]
    },
    {
      title: 'Cloud Computing avec AWS',
      objectives: 'Déployer et gérer des applications sur AWS',
      prerequisites: 'Bases en infrastructure IT',
      language: 'Français',
      level: 'Avancé',
      type: 'Cloud',
      technologies: ['AWS EC2', 'S3', 'Lambda', 'RDS', 'CloudFormation'],
      program: [
        {
          description: 'Services AWS essentiels',
          sessions: [
            { from: '09:00', to: '12:00', description: 'EC2 et networking' },
            { from: '14:00', to: '17:00', description: 'S3 et bases de données RDS' }
          ]
        }
      ]
    }
  ];

  const catalogues = [];
  const categories = [];

  for (let i = 0; i < cataloguesData.length; i++) {
    const catData = cataloguesData[i];
    const randomMentor = users.mentors[i % users.mentors.length];

    const catalogue = await Catalogue.create({
      coverImage: `/catalogues/cover${i + 1}.jpg`,
      title: catData.title,
      trainers: [randomMentor._id],
      created_by: users.admin._id,
      objectives: catData.objectives,
      program: catData.program,
      prerequisites: catData.prerequisites,
      language: catData.language,
      level: catData.level,
      type: catData.type,
      technologies: catData.technologies
    });

    const category = await Category.create({
      name: catData.type,
      catalogue: catalogue._id
    });

    catalogues.push(catalogue);
    categories.push(category);
  }

  console.log(`✅ Created ${catalogues.length} catalogues and ${categories.length} categories`);
  return { catalogues, categories };
};

// Seed Sessions
const seedSessions = async (catalogues, users, universities) => {
  console.log('\n📅 Seeding sessions...');
  const sessions = [];
  const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED'];

  // Create sessions for the past 12 months
  const now = new Date();
  
  for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
    const sessionsInMonth = Math.floor(Math.random() * 8) + 4; // 4-12 sessions per month

    for (let i = 0; i < sessionsInMonth; i++) {
      const catalogue = catalogues[Math.floor(Math.random() * catalogues.length)];
      const mentor = users.mentors[Math.floor(Math.random() * users.mentors.length)];
      const representative = users.representatives[Math.floor(Math.random() * users.representatives.length)];
      
      const sessionDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, Math.floor(Math.random() * 28) + 1);
      const endDate = new Date(sessionDate);
      endDate.setDate(endDate.getDate() + catalogue.program.length);

      // Sessions in the past are more likely to be completed
      let status;
      if (monthOffset > 1) {
        const rand = Math.random();
        if (rand < 0.7) status = 'COMPLETED';
        else if (rand < 0.85) status = 'CONFIRMED';
        else if (rand < 0.95) status = 'REJECTED';
        else status = 'PENDING';
      } else {
        status = Math.random() < 0.6 ? 'CONFIRMED' : 'PENDING';
      }

      const session = await Session.create({
        catalogue: catalogue._id,
        teacher: mentor._id,
        requested_by: representative._id,
        proposed_dates: [
          { from: sessionDate, to: endDate }
        ],
        scheduled_at: sessionDate,
        scheduled_end: endDate,
        status: status,
        rejection_reason: status === 'REJECTED' ? 'Conflit de calendrier avec une autre formation' : undefined,
        participants: [],
        participants_confirmed: status === 'COMPLETED' || status === 'CONFIRMED'
      });

      sessions.push(session);
    }
  }

  console.log(`✅ Created ${sessions.length} sessions`);
  return sessions;
};

// Seed Participants
const seedParticipants = async (sessions) => {
  console.log('\n👨‍🎓 Seeding participants...');
  const firstNames = ['Ahmed', 'Fatma', 'Mohamed', 'Sarra', 'Youssef', 'Leila', 'Karim', 'Nesrine', 'Amine', 'Mariem', 'Hamza', 'Amira', 'Bilel', 'Hajer', 'Oussema'];
  const lastNames = ['Ben Salah', 'Trabelsi', 'Gharbi', 'Mansour', 'Karray', 'Jlassi', 'Bouzid', 'Hammami', 'Mejri', 'Dridi'];
  const levels = ['Débutant', 'Intermédiaire', 'Avancé'];
  const genders = ['Homme', 'Femme'];

  let totalParticipants = 0;

  for (const session of sessions) {
    if (session.status === 'COMPLETED' || session.status === 'CONFIRMED') {
      const numParticipants = Math.floor(Math.random() * 25) + 15; // 15-40 participants

      const participants = [];
      for (let i = 0; i < numParticipants; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        
        // For completed sessions, 70-95% attendance
        // For confirmed sessions, no presence marked yet
        const presence = session.status === 'COMPLETED' ? Math.random() < 0.85 : false;

        const participant = await Participant.create({
          session: session._id,
          name: name,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}${i}@student.tn`,
          countryCode: '+216',
          phone: `${20 + Math.floor(Math.random() * 80)}${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
          level: levels[Math.floor(Math.random() * levels.length)],
          gender: genders[Math.floor(Math.random() * genders.length)],
          presence: presence
        });

        participants.push(participant._id);
      }

      // Update session with participants
      session.participants = participants;
      await session.save();
      totalParticipants += numParticipants;
    }
  }

  console.log(`✅ Created ${totalParticipants} participants across ${sessions.length} sessions`);
};

// Seed Training Requests
const seedTrainingRequests = async (catalogues, users, universities) => {
  console.log('\n📝 Seeding training requests...');
  const requests = [];
  const statuses = ['PENDING', 'APPROVED', 'REJECTED'];

  for (let i = 0; i < 30; i++) {
    const catalogue = catalogues[Math.floor(Math.random() * catalogues.length)];
    const representative = users.representatives[Math.floor(Math.random() * users.representatives.length)];
    const requestDate = new Date();
    requestDate.setDate(requestDate.getDate() - Math.floor(Math.random() * 60));

    const request = await TrainingRequest.create({
      request_type: Math.random() < 0.8 ? 'NEW' : 'MODIFICATION',
      catalogue: catalogue._id,
      university: representative.university,
      requested_by: representative._id,
      approved_by: Math.random() < 0.7 ? users.admin._id : undefined,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      comment: Math.random() < 0.3 ? 'Formation très demandée par nos étudiants' : undefined,
      requested_weeks: [
        {
          from: new Date(requestDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          to: new Date(requestDate.getTime() + 14 * 24 * 60 * 60 * 1000)
        }
      ]
    });

    requests.push(request);
  }

  console.log(`✅ Created ${requests.length} training requests`);
  return requests;
};

// Seed Notifications
const seedNotifications = async (users, requests) => {
  console.log('\n🔔 Seeding notifications...');
  const notifications = [];
  const notifTypes = ['TRAINING_REQUEST', 'TRAINING_REQUEST_STATUS', 'MENTOR_INVITE', 'MENTOR_INVITE_RESPONSE'];

  for (let i = 0; i < 50; i++) {
    const type = notifTypes[Math.floor(Math.random() * notifTypes.length)];
    const representative = users.representatives[Math.floor(Math.random() * users.representatives.length)];
    const request = requests[Math.floor(Math.random() * requests.length)];

    let title, body, recipient;

    switch (type) {
      case 'TRAINING_REQUEST':
        title = 'Nouvelle demande de formation';
        body = `Une nouvelle demande de formation a été soumise`;
        recipient = users.admin._id;
        break;
      case 'TRAINING_REQUEST_STATUS':
        title = 'Statut de demande mis à jour';
        body = `Votre demande de formation a été ${request.status === 'APPROVED' ? 'approuvée' : 'rejetée'}`;
        recipient = representative._id;
        break;
      case 'MENTOR_INVITE':
        title = 'Invitation à animer une formation';
        body = `Vous êtes invité à animer une session de formation`;
        recipient = users.mentors[Math.floor(Math.random() * users.mentors.length)]._id;
        break;
      case 'MENTOR_INVITE_RESPONSE':
        title = 'Réponse à votre invitation';
        body = `Le mentor a accepté votre invitation`;
        recipient = representative._id;
        break;
    }

    const notification = await Notification.create({
      type: type,
      title: title,
      body: body,
      actor: users.admin._id,
      trainingRequest: request._id,
      catalogue: request.catalogue,
      inviteStatus: type.includes('INVITE') ? (Math.random() < 0.7 ? 'ACCEPTED' : 'PENDING') : undefined,
      recipient: recipient,
      read: Math.random() < 0.4 // 40% already read
    });

    notifications.push(notification);
  }

  console.log(`✅ Created ${notifications.length} notifications`);
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();

    const universities = await seedUniversities();
    const users = await seedUsers(universities);
    const { catalogues, categories } = await seedCatalogues(users);
    const sessions = await seedSessions(catalogues, users, universities);
    await seedParticipants(sessions);
    const requests = await seedTrainingRequests(catalogues, users, universities);
    await seedNotifications(users, requests);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Universities: ${universities.length}`);
    console.log(`   - Users: ${users.mentors.length + users.representatives.length + users.prestataires.length + 1}`);
    console.log(`   - Catalogues: ${catalogues.length}`);
    console.log(`   - Sessions: ${sessions.length}`);
    console.log(`   - Training Requests: ${requests.length}`);
    console.log('\n🔐 Test credentials:');
    console.log('   Admin: admin@odc.tn / password123');
    console.log('   Mentor: mentor1@odc.tn / password123');
    console.log('   Representative: rep1@university.tn / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
