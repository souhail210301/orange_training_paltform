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
	// Password change states
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [pwError, setPwError] = useState('');
	const [pwSuccess, setPwSuccess] = useState('');
	const [pwLoading, setPwLoading] = useState(false);
	const [showOld, setShowOld] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	// Settings (notification) preferences state lifted to top-level to avoid hooks in conditional render
	const [prefs, setPrefs] = useState({
		desktop: [true, true, false, false],
		mobile: [false, false, false]
	});
	// Notifications
	const [notifications, setNotifications] = useState([]);
	const [notifLoading, setNotifLoading] = useState(false);
	const [now, setNow] = useState(Date.now()); // for relative time refresh
	useEffect(() => { const id = setInterval(()=> setNow(Date.now()), 60000); return () => clearInterval(id); }, []);
	const relativeTime = (dateStr) => {
		if (!dateStr) return '';
		const diff = Math.floor((now - new Date(dateStr).getTime()) / 1000);
		if (diff < 5) return "À l'instant";
		if (diff < 60) return `Il y a ${diff} seconde${diff>1?'s':''}`;
		const m = Math.floor(diff/60);
		if (m < 60) return `Il y a ${m} minute${m>1?'s':''}`;
		const h = Math.floor(m/60);
		if (h < 24) return `Il y a ${h} heure${h>1?'s':''}`;
		const d = Math.floor(h/24);
		if (d < 7) return `Il y a ${d} jour${d>1?'s':''}`;
		const w = Math.floor(d/7);
		if (w < 4) return `Il y a ${w} semaine${w>1?'s':''}`;
		const mo = Math.floor(d/30);
		if (mo < 12) return `Il y a ${mo} mois`;
		const y = Math.floor(d/365);
		return `Il y a ${y} an${y>1?'s':''}`;
	};
	const loadNotifications = async () => {
		try {
			setNotifLoading(true);
			const token = localStorage.getItem('token');
			const res = await fetch('/api/notifications', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
			if (res.ok) {
				const data = await res.json();
				setNotifications(data);
			}
		} finally { setNotifLoading(false); }
	};
	const markRead = async (id) => {
		setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
		try {
			const token = localStorage.getItem('token');
			await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: token ? `Bearer ${token}` : '' } });
		} catch { /* silent */ }
	};
	useEffect(() => { if (activeTab === 'notifications') loadNotifications(); }, [activeTab]);
	const togglePref = (group, idx) => setPrefs(p => ({ ...p, [group]: p[group].map((v,i)=> i===idx ? !v : v) }));
	const Switch = ({ enabled, onClick }) => (
		<button type="button" onClick={onClick} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-blue-500' : 'bg-gray-300'}`}> 
			<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-4' : 'translate-x-1'}`}></span>
		</button>
	);
	const PrefRow = ({ title, desc, enabled, onToggle }) => (
		<div className="flex items-start justify-between py-3 border-b last:border-b-0">
			<div>
				<div className="text-sm font-medium text-gray-900">{title}</div>
				<div className="text-xs text-gray-500">{desc}</div>
			</div>
			<Switch enabled={enabled} onClick={onToggle} />
		</div>
	);

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
				const validatePassword = () => {
					if (!oldPassword || !newPassword || !confirmPassword) return 'Tous les champs sont requis.';
					if (newPassword === oldPassword) return 'Le nouveau mot de passe doit être différent de l\'ancien.';
					if (newPassword.length < 8) return 'Minimum 8 caractères.';
					if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) return 'Doit contenir majuscule, chiffre et symbole.';
					if (newPassword !== confirmPassword) return 'La confirmation ne correspond pas.';
					return '';
				};

				const handleChangePassword = async () => {
					setPwError(''); setPwSuccess('');
					const v = validatePassword();
					if (v) { setPwError(v); return; }
					setPwLoading(true);
					try {
						const token = localStorage.getItem('token');
						const res = await fetch('/api/users/change-password', {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
							body: JSON.stringify({ currentPassword: oldPassword, newPassword })
						});
						const data = await res.json();
						if (res.ok) {
							setPwSuccess('Mot de passe modifié. Déconnexion...');
							setTimeout(() => {
								localStorage.removeItem('token');
								if (typeof onLogout === 'function') onLogout();
								if (typeof onNavigate === 'function') onNavigate('/login');
							}, 1500);
						} else {
							setPwError(data.message || 'Erreur lors de la modification.');
						}
					} catch (e) {
						setPwError(e.message);
					}
					setPwLoading(false);
				};

				const inputBase = 'w-full pl-10 pr-10 py-2 border rounded bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500';
				const iconSpan = 'absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center pointer-events-none';
				const eyeBtn = 'absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700';

				return (
					<div className="space-y-8">
						<div>
							<h2 className="text-2xl font-semibold mb-1">Modifier votre mot de passe</h2>
							<p className="text-sm text-gray-600">Vous serez déconnecté de tous les appareils après avoir changé votre mot de passe.</p>
						</div>
						<div className="space-y-6 max-w-3xl">
							{/* Ancien mot de passe */}
							<div>
								<label className="block text-sm font-medium mb-1">Ancien mot de passe</label>
								<div className="relative">
									<span className={iconSpan}><img src="/lock_icon.png" alt="Lock" className="w-4 h-4 opacity-70" /></span>
									<input type={showOld ? 'text' : 'password'} placeholder="Ancien Mot de passe" className={inputBase} value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
									<button type="button" onClick={() => setShowOld(s => !s)} className={eyeBtn}>{showOld ? 'Masquer' : 'Afficher'}</button>
								</div>
							</div>
							{/* Nouveau mot de passe */}
							<div>
								<label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
								<div className="relative">
									<span className={iconSpan}><img src="/lock_icon.png" alt="Lock" className="w-4 h-4 opacity-70" /></span>
									<input type={showNew ? 'text' : 'password'} placeholder="Nouveau mot de passe" className={inputBase} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
									<button type="button" onClick={() => setShowNew(s => !s)} className={eyeBtn}>{showNew ? 'Masquer' : 'Afficher'}</button>
								</div>
								<p className="mt-1 text-xs text-gray-500">Doit contenir au moins 8 caractères, dont au moins 1 majuscule, 1 chiffre et 1 symbole.</p>
							</div>
							{/* Confirmation */}
							<div>
								<label className="block text-sm font-medium mb-1">Confirmer le nouveau mot de passe</label>
								<div className="relative">
									<span className={iconSpan}><img src="/lock_icon.png" alt="Lock" className="w-4 h-4 opacity-70" /></span>
									<input type={showConfirm ? 'text' : 'password'} placeholder="Confirmer le mot de passe" className={inputBase} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
									<button type="button" onClick={() => setShowConfirm(s => !s)} className={eyeBtn}>{showConfirm ? 'Masquer' : 'Afficher'}</button>
								</div>
							</div>
							{pwError && <div className="text-sm text-red-600">{pwError}</div>}
							{pwSuccess && <div className="text-sm text-green-600">{pwSuccess}</div>}
							<button onClick={handleChangePassword} disabled={pwLoading} className="px-8 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-60">{pwLoading ? '...' : 'Confirmer et se déconnecter'}</button>
						</div>
					</div>
				);
			case 'notifications':
				return (
					<div>
						<h2 className="text-2xl font-semibold mb-1">Notifications</h2>
						<p className="text-sm text-gray-600 mb-4">Toutes vos notifications sont regroupées ici.</p>
						{notifLoading && <div className="text-sm text-gray-500">Chargement...</div>}
						<div className="space-y-4">
							{notifications.map(raw => {
								let n = raw;
								const trObj = typeof n.trainingRequest === 'object' ? n.trainingRequest : null;
								if (n.type === 'TRAINING_REQUEST' && trObj && trObj.status && trObj.status !== 'PENDING') {
									const actorName = n.actor?.name || 'le formateur';
									if (trObj.status === 'APPROVED') {
										n = { ...n, title: 'Formation approuvée', body: `La formation a été approuvée et affectée à ${actorName}.`, finalStatus: 'APPROVED' };
									} else if (trObj.status === 'REJECTED') {
										n = { ...n, title: 'Formation rejetée', body: 'La formation a été rejetée.', finalStatus: 'REJECTED' };
									}
								}
								const isRequest = n.type === 'TRAINING_REQUEST';
								const trStatus = trObj?.status;
								const canAct = isRequest && user?.role === 'admin' && trStatus === 'PENDING' && !n.finalStatus;
									return (
										<div key={n._id} onClick={() => { if (!n.read) markRead(n._id); }} className="flex gap-4 p-3 border rounded hover:shadow-sm bg-white cursor-pointer">
										<div className="w-12 h-12 bg-orange-500 text-white flex items-center justify-center rounded">
											<img src="/logo_orange_certif.png" alt="Logo" className="w-8 h-8 object-contain" />
										</div>
										<div className="flex-1">
											<div className="text-sm font-semibold mb-1">{n.title}</div>
											{n.body && <div className="text-xs text-gray-600 mb-1">{n.body}</div>}
											<div className="text-[11px] text-gray-400">{relativeTime(n.createdAt)}</div>
											{canAct && (
												<div className="flex gap-2">
													<button className={`px-3 py-1 bg-green-500 text-white text-xs rounded transition-opacity ${n.finalStatus ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={async ()=>{
														if (n.finalStatus) return; // already processed
														const actorName = n.actor?.name || 'le formateur';
														// Optimistic update
														setNotifications(prev => prev.map(nn => nn._id === n._id ? { ...nn, title: 'Formation approuvée', body: `La formation a été approuvée et affectée à ${actorName}.`, finalStatus: 'APPROVED' } : nn));
														const token = localStorage.getItem('token');
														const trId = typeof n.trainingRequest === 'object' ? n.trainingRequest._id : n.trainingRequest;
														const res = await fetch(`/api/training-requests/${trId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: token?`Bearer ${token}`:'' }, body: JSON.stringify({ status: 'APPROVED' }) });
														if (!res.ok) {
															// Revert if failed
															loadNotifications();
														}
													}}>
														Approuver
													</button>
													<button className={`px-3 py-1 bg-red-500 text-white text-xs rounded transition-opacity ${n.finalStatus ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={async ()=>{
														if (n.finalStatus) return;
														setNotifications(prev => prev.map(nn => nn._id === n._id ? { ...nn, title: 'Formation rejetée', body: 'La formation a été rejetée.', finalStatus: 'REJECTED' } : nn));
														const token = localStorage.getItem('token');
														const trId = typeof n.trainingRequest === 'object' ? n.trainingRequest._id : n.trainingRequest;
														const res = await fetch(`/api/training-requests/${trId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: token?`Bearer ${token}`:'' }, body: JSON.stringify({ status: 'REJECTED' }) });
														if (!res.ok) {
															loadNotifications();
														}
													}}>
														Refuser
													</button>
												</div>
											)}
												{n.type === 'MENTOR_INVITE' && (!n.inviteStatus || n.inviteStatus === 'PENDING') && (
													<div className="flex gap-3 mt-2">
														<button
															className="px-3 py-1 rounded bg-orange-500 text-white text-xs"
															onClick={async () => {
																const token = localStorage.getItem('token');
																const res = await fetch(`/api/notifications/${n._id}/respond-invite`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ decision: 'ACCEPTED' }) });
																if (res.ok) {
																	setNotifications(prev => prev.map(nn => nn._id === n._id ? { ...nn, inviteStatus: 'ACCEPTED', type: 'MENTOR_INVITE_RESPONSE', title: 'Invitation acceptée', body: 'Vous avez accepté cette invitation.' } : nn));
																}
															}}
														>Accepter</button>
														<button
															className="px-3 py-1 rounded bg-gray-200 text-gray-800 text-xs"
															onClick={async () => {
																const token = localStorage.getItem('token');
																const res = await fetch(`/api/notifications/${n._id}/respond-invite`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ decision: 'DECLINED' }) });
																if (res.ok) {
																	setNotifications(prev => prev.map(nn => nn._id === n._id ? { ...nn, inviteStatus: 'DECLINED', type: 'MENTOR_INVITE_RESPONSE', title: 'Invitation refusée', body: 'Vous avez refusé cette invitation.' } : nn));
																}
															}}
														>Refuser</button>
													</div>
												)}
										</div>
											<div className="flex items-start pt-1">
												<span className={`w-2 h-2 rounded-full mt-1 transition-colors ${n.read ? 'bg-gray-300' : 'bg-red-500'}`}></span>
										</div>
									</div>
								);
							})}
							{!notifLoading && notifications.length === 0 && <div className="text-sm text-gray-500">Aucune notification.</div>}
						</div>
					</div>
				);
			case 'settings':
				return (
					<div className="space-y-10">
						<section>
							<h2 className="text-xl font-semibold mb-1">Notifications Desktop</h2>
							<p className="text-sm text-gray-600 mb-4">Toutes vos notifications sont regroupées ici.</p>
							<div className="divide-y">
								<PrefRow title="Notifications via Email" desc="Recevoir un email quand vous êtes hors ligne" enabled={prefs.desktop[0]} onToggle={()=>togglePref('desktop',0)} />
								<PrefRow title="Notifications via Email" desc="Recevoir un email quand vous êtes hors ligne" enabled={prefs.desktop[1]} onToggle={()=>togglePref('desktop',1)} />
								<PrefRow title="Notifications via Email" desc="Recevoir un email quand vous êtes hors ligne" enabled={prefs.desktop[2]} onToggle={()=>togglePref('desktop',2)} />
								<PrefRow title="Notifications via Email" desc="Recevoir un email quand vous êtes hors ligne" enabled={prefs.desktop[3]} onToggle={()=>togglePref('desktop',3)} />
							</div>
						</section>
						<section>
							<h2 className="text-xl font-semibold mb-1">Notifications Mobile</h2>
							<p className="text-sm text-gray-600 mb-4">Toutes vos notifications sont regroupées ici.</p>
							<div className="divide-y">
								<PrefRow title="Notifications via Email" desc="Recevoir un email quand vous êtes hors ligne" enabled={prefs.mobile[0]} onToggle={()=>togglePref('mobile',0)} />
								<PrefRow title="Notifications via Email" desc="Recevoir un email quand vous êtes hors ligne" enabled={prefs.mobile[1]} onToggle={()=>togglePref('mobile',1)} />
								<PrefRow title="Notifications via Email" desc="Recevoir un email quand vous êtes hors ligne" enabled={prefs.mobile[2]} onToggle={()=>togglePref('mobile',2)} />
							</div>
						</section>
					</div>
				);
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




