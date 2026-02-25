// controllers/statisticsController.js
const Session = require('../models/Session');
const User = require('../models/User');
const University = require('../models/University');
const Participant = require('../models/Participant');

// Get comprehensive statistics for Chiffres Clés page
exports.getStatistics = async (req, res) => {
  try {
    const { formateur, universite, typeFormation, session, startDate, endDate } = req.query;

    // Build filter object
    let filter = {};
    if (formateur) filter.teacher = formateur;
    if (universite) filter['requested_by.university'] = universite;
    if (startDate || endDate) {
      filter.scheduled_at = {};
      if (startDate) filter.scheduled_at.$gte = new Date(startDate);
      if (endDate) filter.scheduled_at.$lte = new Date(endDate);
    }

    // Fetch sessions with filters
    const sessions = await Session.find(filter)
      .populate('teacher', 'name')
      .populate('catalogue', 'title')
      .populate('formation', 'title')
      .populate('requested_by', 'university')
      .populate('participants');

    // Calculate total formations requested
    const formationsRequested = sessions.length;

    // Calculate universities registered
    const universities = await University.countDocuments();

    // Calculate total students formed (from completed sessions)
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
    const studentsFormed = completedSessions.reduce((total, session) => {
      return total + (session.participants?.length || 0);
    }, 0);

    // Calculate monthly data for line chart
    const monthlyData = Array(12).fill(0);
    sessions.forEach(session => {
      if (session.scheduled_at) {
        const month = new Date(session.scheduled_at).getMonth();
        monthlyData[month]++;
      }
    });

    // Mock confidence data (would come from feedback in real scenario)
    const confidenceData = {
      'Très Confiant': 35,
      'Confiant': 25,
      'Moyennement content': 20,
      'Peu confiant': 15,
      'Pas du tout confiant': 5
    };

    // Calculate attendance data per session
    const attendanceData = completedSessions.slice(0, 5).map(session => {
      const presentCount = session.participants?.filter(p => p.presence).length || 0;
      const totalCount = session.participants?.length || 1;
      const attendancePercentage = Math.round((presentCount / totalCount) * 100);

      return {
        name: session.catalogue?.title || session.formation?.title || 'Formation',
        attendance: attendancePercentage
      };
    });

    // Mock duration/rhythm data (would come from feedback)
    const durationData = [
      { label: 'Trop Courte', value: 15 },
      { label: 'Trop Long', value: 45 },
      { label: 'Trop Rapide', value: 25 },
      { label: 'Trop Pausé', value: 35 },
      { label: 'Trop Lent', value: 20 }
    ];

    // Mock satisfaction ratings (would come from Feedback model)
    const satisfactionRatings = {
      satisfaction: {
        score: 7.8,
        breakdown: {
          'Très Satisfait': 35,
          'Satisfait': 25,
          'Moyen': 20,
          'Insatisfait': 15,
          'Très Insatisfait': 5
        }
      },
      contentQuality: {
        score: 7.8,
        breakdown: {
          'Très Satisfait': 35,
          'Satisfait': 25,
          'Moyen': 20,
          'Insatisfait': 15,
          'Très Insatisfait': 5
        }
      },
      engagement: {
        score: 7.8,
        breakdown: {
          'Très Satisfait': 35,
          'Satisfait': 25,
          'Moyen': 20,
          'Insatisfait': 15,
          'Très Insatisfait': 5
        }
      },
      presentationStyle: {
        score: 7.8,
        breakdown: {
          'Très Satisfait': 35,
          'Satisfait': 25,
          'Moyen': 20,
          'Insatisfait': 15,
          'Très Insatisfait': 5
        }
      },
      learningEnvironment: {
        score: 7.8,
        breakdown: {
          'Très Satisfait': 35,
          'Satisfait': 25,
          'Moyen': 20,
          'Insatisfait': 15,
          'Très Insatisfait': 5
        }
      },
      subjectKnowledge: {
        score: 7.8,
        breakdown: {
          'Très Satisfait': 35,
          'Satisfait': 25,
          'Moyen': 20,
          'Insatisfait': 15,
          'Très Insatisfait': 5
        }
      }
    };

    // Sessions data for table
    const sessionsData = sessions.slice(0, 20).map(session => ({
      _id: session._id,
      formation: session.catalogue?.title || session.formation?.title,
      session: session.scheduled_at,
      status: session.status,
      satisfaction: 'Très Insatisfait', // Mock - would come from Feedback
      contentQuality: 'Très Insatisfait',
      engagement: 'Très Insatisfait',
      presentationStyle: 'Très Insatisfait'
    }));

    res.json({
      formationsRequested,
      universitiesRegistered: universities,
      studentsFormed,
      monthlyData,
      confidenceData,
      attendanceData,
      durationData,
      satisfactionRatings,
      sessionsData,
      totalSessions: sessions.length
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des statistiques', error: error.message });
  }
};

// Get filter options for dropdowns
exports.getFilterOptions = async (req, res) => {
  try {
    // Get all teachers (formateurs)
    const teachers = await User.find({ role: 'odc_mentor' }).select('name _id');
    
    // Get all universities
    const universities = await University.find().select('name _id');
    
    // Get unique session dates
    const sessions = await Session.find().select('scheduled_at catalogue formation').populate('catalogue', 'title').populate('formation', 'title');
    
    res.json({
      teachers,
      universities,
      sessions: sessions.map(s => ({
        _id: s._id,
        title: s.catalogue?.title || s.formation?.title,
        date: s.scheduled_at
      }))
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des options de filtre', error: error.message });
  }
};
