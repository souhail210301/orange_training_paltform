import React, { useState, useEffect } from 'react';
import PhoneInput from './common/PhoneInput';
import AdminNavbar from './AdminDashboard/AdminNavbar';
import AdminSidebar from './AdminDashboard/AdminSidebar';

const tabs = [
	{ key: 'profil', label: 'Profil', icon: '/user_icon2.png', alt: 'Profil' },
	{ key: 'password', label: 'Mot de Passe', icon: '/lock_icon.png', alt: 'Mot de passe' },
	{ key: 'notifications', label: 'Notifications', icon: '/notif_icon.png', alt: 'Notifications' },
	{ key: 'settings', label: 'Paramètres', icon: '/settings_icon.png', alt: 'Paramètres' }
];

const UserProfile = ({ user, onLogout, onNavigate, activePage }) => {
	const [activeTab, setActiveTab] = useState('profil');
	const [form, setForm] = useState({ name: '', phone_number: '', email: '' });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {   
		if (user) {
			setForm(f => ({ ...f, name: user.name || '', phone_number: user.phone_number || '', email: user.email || '' }));
		} else {
			(async () => {
				try {
					const token = localStorage.getItem('token');
						const res = await fetch('/api/users/me', { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
						if (res.ok) {
							const data = await res.json();
							setForm({ name: data.name || '', phone_number: data.phone_number || '', email: data.email || '' });
						}
				} catch { /* ignore */ }
			})();
		}
	}, [user]);

	const handleSaveProfile = async () => {
		setError('');
		setSuccess('');
		setLoading(true);
		try {
			const token = localStorage.getItem('token');
			const res = await fetch('/api/users/me', { method: 'GET', headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
			if (!res.ok) throw new Error('Impossible de récupérer votre identifiant');
			const me = await res.json();
			const updateRes = await fetch(`/api/users/${me._id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
				body: JSON.stringify({ name: form.name, phone_number: form.phone_number })
			});
			const data = await updateRes.json();
			if (updateRes.ok) {
				setSuccess('Profil mis à jour');
			} else {
				setError(data.message || 'Erreur lors de la mise à jour');
			}
		} catch (e) {
			setError(e.message);
		}
		setLoading(false);
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case 'profil':
				return (
					<div className="space-y-6">
						<div>
							<label className="block text-sm font-medium mb-1">Nom</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center pointer-events-none">
									<img src="/user_icon.png" alt="Utilisateur" className="w-4 h-4 opacity-70" />
								</span>
								<input
									className="w-full pl-10 pr-4 py-2 border rounded bg-gray-50 placeholder-gray-400"
									placeholder="Votre nom"
									value={form.name}
									onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Numéro</label>
							<PhoneInput
								value={form.phone_number}
								onChange={(full) => setForm(f => ({ ...f, phone_number: full }))}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Email</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center pointer-events-none">
									<img src="/email_icon.png" alt="Email" className="w-4 h-4 opacity-70" />
								</span>
								<input
									disabled
									className="w-full pl-10 pr-4 py-2 border rounded bg-gray-100 text-gray-500"
									value={form.email}
								/>
							</div>
						</div>
						{error && <div className="text-sm text-red-600">{error}</div>}
						{success && <div className="text-sm text-green-600">{success}</div>}
						<button onClick={handleSaveProfile} disabled={loading} className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-60">{loading ? '...' : 'Enregistrer'}</button>
					</div>
				);
			case 'password':
				return (
					<div className="space-y-6">
						<p className="text-sm text-gray-600">Fonctionnalité à implémenter: changement de mot de passe (utiliser PUT /api/users/change-password).</p>
					</div>
				);
			case 'notifications':
				return <div className="text-sm text-gray-600">Aucune notification configurable pour l'instant.</div>;
			case 'settings':
				return <div className="text-sm text-gray-600">Paramètres supplémentaires à venir.</div>;
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<AdminNavbar />
			<div className="flex flex-1">
				<AdminSidebar user={user || { name: form.name, role: 'Administrateur' }} onLogout={onLogout} onNavigate={onNavigate} activePage={activePage} />
				<div className="flex-1 flex flex-col p-6 overflow-y-auto" style={{ marginLeft: '288px', marginTop: '64px' }}>
					<div className="bg-white rounded-lg shadow p-6 flex">
						<div className="w-56 border-r pr-4 space-y-1">
							{tabs.map(t => (
								<button
									key={t.key}
									onClick={() => setActiveTab(t.key)}
									className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded text-sm font-medium ${activeTab === t.key ? 'bg-orange-500 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
								>
									{t.icon && <img src={t.icon} alt={t.alt || t.label} className="w-4 h-4 opacity-80" />}
									<span>{t.label}</span>
								</button>
							))}
						</div>
						<div className="flex-1 pl-6">
							{renderTabContent()}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserProfile;




