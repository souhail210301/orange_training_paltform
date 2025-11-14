import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, GraduationCap } from 'lucide-react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const Statistics = ({ user, onLogout, onNavigate, activePage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    formationsRequested: 0,
    universitiesRegistered: 0,
    studentsFormed: 0,
    monthlyData: [],
    confidenceData: {},
    attendanceData: [],
    durationData: [],
    satisfactionRatings: {},
    contentQuality: {},
    engagement: {},
    presentationStyle: {},
    learningEnvironment: {},
    subjectKnowledge: {},
    sessionsData: []
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    formateur: '',
    universite: '',
    typeFormation: '',
    session: '',
    dateRange: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    teachers: [],
    universities: [],
    sessions: []
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/statistics/filters', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFilterOptions(data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters.formateur) params.append('formateur', filters.formateur);
      if (filters.universite) params.append('universite', filters.universite);
      if (filters.session) params.append('session', filters.session);

      const res = await fetch(`/api/statistics?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await res.json();

      // Transform monthlyData from array to objects
      const months = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
      const monthlyData = months.map((month, index) => ({
        month,
        count: data.monthlyData[index] || 0
      }));

      setStats({
        formationsRequested: data.formationsRequested,
        universitiesRegistered: data.universitiesRegistered,
        studentsFormed: data.studentsFormed,
        monthlyData,
        confidenceData: data.confidenceData,
        attendanceData: data.attendanceData,
        durationData: data.durationData,
        satisfactionRatings: data.satisfactionRatings,
        sessionsData: data.sessionsData
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLineChart = () => {
    const maxValue = Math.max(...stats.monthlyData.map(d => d.count), 1);
    const height = 200;

    return (
      <svg width="100%" height={height} className="mt-4">
        {/* Grid lines */}
        {[0, 20, 40, 60, 80, 100].map((y) => (
          <line
            key={y}
            x1="5%"
            y1={`${100 - y}%`}
            x2="95%"
            y2={`${100 - y}%`}
            stroke="#E4E4E7"
            strokeWidth="1"
          />
        ))}

        {/* Line path */}
        <path
          d={stats.monthlyData.map((d, i) => {
            const x = 5 + (i / (stats.monthlyData.length - 1)) * 90;
            const y = 100 - ((d.count / maxValue) * 90);
            return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
          }).join(' ')}
          fill="none"
          stroke="#F97316"
          strokeWidth="3"
        />

        {/* Data points */}
        {stats.monthlyData.map((d, i) => {
          const x = 5 + (i / (stats.monthlyData.length - 1)) * 90;
          const y = 100 - ((d.count / maxValue) * 90);
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r="4"
              fill="#F97316"
            />
          );
        })}

        {/* X-axis labels */}
        {stats.monthlyData.map((d, i) => {
          const x = 5 + (i / (stats.monthlyData.length - 1)) * 90;
          return (
            <text
              key={i}
              x={`${x}%`}
              y="95%"
              textAnchor="middle"
              fontSize="12"
              fill="#71717A"
            >
              {d.month}
            </text>
          );
        })}
      </svg>
    );
  };

  const renderDonutChart = () => {
    const data = Object.entries(stats.confidenceData);
    const total = data.reduce((sum, [, value]) => sum + value, 0);
    let currentAngle = 0;

    const colors = {
      'Très Confiant': '#F97316',
      'Confiant': '#FB923C',
      'Moyennement content': '#FDBA74',
      'Peu confiant': '#FED7AA',
      'Pas du tout confiant': '#FFEDD5'
    };

    return (
      <div className="relative">
        <svg width="240" height="240" viewBox="0 0 240 240" className="mx-auto">
          {data.map(([label, value]) => {
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);

            const outerRadius = 110;
            const innerRadius = 60;

            const x1 = 120 + outerRadius * Math.cos(startRad);
            const y1 = 120 + outerRadius * Math.sin(startRad);
            const x2 = 120 + outerRadius * Math.cos(endRad);
            const y2 = 120 + outerRadius * Math.sin(endRad);
            const x3 = 120 + innerRadius * Math.cos(endRad);
            const y3 = 120 + innerRadius * Math.sin(endRad);
            const x4 = 120 + innerRadius * Math.cos(startRad);
            const y4 = 120 + innerRadius * Math.sin(startRad);

            const largeArc = angle > 180 ? 1 : 0;

            const path = `
              M ${x1} ${y1}
              A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
              L ${x3} ${y3}
              A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
              Z
            `;

            currentAngle += angle;

            return (
              <path
                key={label}
                d={path}
                fill={colors[label] || '#F97316'}
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-4 space-y-2">
          {data.map(([label, value]) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[label] || '#F97316' }} />
              <span className="text-gray-700">{label}</span>
              <span className="ml-auto text-gray-500">{value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBarChart = (data, color = '#F97316') => {
    const maxValue = Math.max(...data.map(d => d.attendance || d.value), 1);

    return (
      <div className="mt-4">
        <div className="space-y-3">
          {data.map((item, index) => {
            const value = item.attendance || item.value;
            const percentage = (value / maxValue) * 100;

            return (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 truncate">{item.name || item.label}</span>
                  <span className="text-gray-500">{value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div
                    className="h-8 rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSatisfactionBox = (title, data) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-sm font-medium text-gray-600 mb-2">{title}</h4>
        <div className="text-4xl font-bold text-gray-900 mb-4">{data.score}/10</div>
        <div className="space-y-2">
          {Object.entries(data.breakdown).map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-700">{label}</span>
              <span className="text-gray-500">{value}% (12)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar
          user={user}
          onLogout={onLogout}
          onNavigate={onNavigate}
          activePage={activePage}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col lg:ml-72">
          <AdminNavbar
            user={user}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        user={user}
        onLogout={onLogout}
        onNavigate={onNavigate}
        activePage={activePage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col lg:ml-72">
        <AdminNavbar
          user={user}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="flex-1 overflow-auto">
          {/* Header with filters */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={filters.formateur}
            onChange={(e) => setFilters({ ...filters, formateur: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Formateur</option>
            {filterOptions.teachers.map(teacher => (
              <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
            ))}
          </select>

          <select
            value={filters.universite}
            onChange={(e) => setFilters({ ...filters, universite: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Université</option>
            {filterOptions.universities.map(uni => (
              <option key={uni._id} value={uni._id}>{uni.name}</option>
            ))}
          </select>

          <select
            value={filters.typeFormation}
            onChange={(e) => setFilters({ ...filters, typeFormation: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Type de Formation</option>
            <option value="catalogue">Catalogue</option>
            <option value="formation">Formation</option>
          </select>

          <select
            value={filters.session}
            onChange={(e) => setFilters({ ...filters, session: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Session</option>
            {filterOptions.sessions.map(session => (
              <option key={session._id} value={session._id}>
                {session.title} - {new Date(session.date).toLocaleDateString('fr-FR')}
              </option>
            ))}
          </select>

          <button className="ml-auto px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
            Date
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-orange-500 text-white rounded-lg p-6 flex items-center gap-4">
            <div className="bg-white/20 rounded-lg p-3">
              <BarChart2 className="w-8 h-8" />
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.formationsRequested}</div>
              <div className="text-orange-100">Formations demandées</div>
            </div>
          </div>

          <div className="bg-orange-500 text-white rounded-lg p-6 flex items-center gap-4">
            <div className="bg-white/20 rounded-lg p-3">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.universitiesRegistered}</div>
              <div className="text-orange-100">Universités inscrites</div>
            </div>
          </div>

          <div className="bg-orange-500 text-white rounded-lg p-6 flex items-center gap-4">
            <div className="bg-white/20 rounded-lg p-3">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.studentsFormed}</div>
              <div className="text-orange-100">Étudiants Formés</div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart - Nombre De Formations */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nombre De Formations</h3>
            {renderLineChart()}
          </div>

          {/* Donut Chart - Confiance D'application */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confiance D'application</h3>
            {renderDonutChart()}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Attentes Des Étudiants */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attentes Des Étudiants</h3>
            {renderBarChart(stats.attendanceData)}
          </div>

          {/* Bar Chart - Durée & Rythme */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Durée & Rythme</h3>
            {renderBarChart(stats.durationData)}
          </div>
        </div>

        {/* Satisfaction Ratings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSatisfactionBox('Taux de Satisfaction', stats.satisfactionRatings.satisfaction)}
          {renderSatisfactionBox('Qualité du Contenu', stats.satisfactionRatings.contentQuality)}
          {renderSatisfactionBox('Engagement', stats.satisfactionRatings.engagement)}
          {renderSatisfactionBox('Style de Présentation', stats.satisfactionRatings.presentationStyle)}
          {renderSatisfactionBox('Environnement de la Formation', stats.satisfactionRatings.learningEnvironment)}
          {renderSatisfactionBox('Connaissance du Sujet', stats.satisfactionRatings.subjectKnowledge)}
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Formation</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Session</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Satisfaction</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Qualité du Contenu</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Engagement</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Style de...</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.sessionsData.map((session, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {session.catalogue?.title || session.formation?.title || 'Formation'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(session.scheduled_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Très Insatisfait</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Très Insatisfait</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Très Insatisfait</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Très Insatisfait</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              10-20 sur 188 Résultats
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">‹</button>
              <button className="px-3 py-1 text-sm bg-orange-500 text-white rounded">1</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">2</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">3</button>
              <span className="px-2 text-sm text-gray-600">...</span>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">11</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

export default Statistics;
