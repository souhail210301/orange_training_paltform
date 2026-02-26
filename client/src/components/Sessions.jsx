import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import AdminNavbar from './AdminDashboard/AdminNavbar';
import AdminSidebar from './AdminDashboard/AdminSidebar';
import AddSessionModal from './AdminDashboard/AddSessionModal';
import ConfirmAddSessionModal from './AdminDashboard/ConfirmAddSessionModal';
import RejectSessionModal from './AdminDashboard/RejectSessionModal';
import ConfirmRejectSessionModal from './AdminDashboard/ConfirmRejectSessionModal';
import RequestSessionModal from './AdminDashboard/RequestSessionModal';
import ConfirmRequestSessionModal from './AdminDashboard/ConfirmRequestSessionModal';
import * as XLSX from 'xlsx';

const STATUS_META = {
	PENDING: { label: 'En Attente', color: '#F88826' },
	CONFIRMED: { label: 'Confirmé', color: '#24965A' },
	REJECTED: { label: 'Rejeté', color: '#F84545' },
	COMPLETED: { label: 'Terminé', color: '#4B4BD3' }
};

const Sessions = ({ user, onLogout, onNavigate, activePage }) => {
	const [sessions, setSessions] = useState([]); // combined real sessions + synthetic catalogue rows
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('ALL');
	const [page, setPage] = useState(1);
	const pageSize = 10;
	const [month, setMonth] = useState(new Date());
	const [selected, setSelected] = useState(null);
	const [selectedDetails, setSelectedDetails] = useState(null); // enriched formation/catalogue data
	const [loadingDetails, setLoadingDetails] = useState(false);
	const [detailTab, setDetailTab] = useState('SUMMARY'); // SUMMARY | DATE
	const [rangeDraft, setRangeDraft] = useState({ start: null, end: null });
	const [scheduling, setScheduling] = useState(false);
	const [rejectionReasonDraft, setRejectionReasonDraft] = useState('');
	// Participants modal state
	const [showParticipants, setShowParticipants] = useState(false);
	const [participants, setParticipants] = useState([]);
	const [addingPartLoading, setAddingPartLoading] = useState(false);
	const [newParticipant, setNewParticipant] = useState({ name:'', email:'', phone:'', level:'', countryCode:'+216' });
	const [editParticipant, setEditParticipant] = useState(null);
	const [editParticipantError, setEditParticipantError] = useState(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [actionMenuFor, setActionMenuFor] = useState(null); // participant id showing menu
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const levelOptions = ['1ère License','2ème License','3ème License','Mastère','Ingénieur','Autre'];
	const [addParticipantError, setAddParticipantError] = useState(null);
	// Persist session id for participants modal (so we can still add even if drawer closed or selected cleared)
	const [participantsSessionId, setParticipantsSessionId] = useState(null);
	const [importing, setImporting] = useState(false);
	const [importError, setImportError] = useState(null);

	// Session CRUD modals
	const [showAddSessionModal, setShowAddSessionModal] = useState(false);
	const [showConfirmAddModal, setShowConfirmAddModal] = useState(false);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [showConfirmRejectModal, setShowConfirmRejectModal] = useState(false);
	const [sessionToAdd, setSessionToAdd] = useState(null);
	const [sessionToReject, setSessionToReject] = useState(null);
	const [rejectionReason, setRejectionReason] = useState('');

	// University rep request session modals
	const [showRequestSessionModal, setShowRequestSessionModal] = useState(false);
	const [showConfirmRequestModal, setShowConfirmRequestModal] = useState(false);
	const [sessionToRequest, setSessionToRequest] = useState(null);

	// Reset / initialize date range when selected session changes
	useEffect(()=>{
		if(!selected){
			setRangeDraft({ start:null, end:null });
			setRejectionReasonDraft('');
			return;
		}
		const start = selected.start_date || selected.scheduled_at;
		const end = selected.end_date || selected.scheduled_end;
		// Prefill rejection reason draft if session already rejected
		if(selected.status==='REJECTED'){
			setRejectionReasonDraft(selected.rejection_reason || '');
		}else{
			setRejectionReasonDraft('');
		}
		if(start && end){
			setRangeDraft({ start: new Date(start), end: new Date(end) });
		}else{
			setRangeDraft({ start:null, end:null });
		}
	},[selected]);

	const load = async () => {
		setLoading(true);
		try {
			const [sr, fr, cr] = await Promise.all([
				apiFetch('/sessions'),
				apiFetch('/formations'),
				apiFetch('/catalogues')
			]);
			const [sd, fd, cd] = await Promise.all([sr.json(), fr.json(), cr.json()]);
			if (sr.ok && fr.ok && cr.ok) {
				const formationMap = new Map((fd||[]).map(f=>[f._id, f]));
				const sessionList = (Array.isArray(sd)?sd:[]).map(s => ({
					...s,
					formation: s.formation && typeof s.formation === 'object' ? s.formation : formationMap.get(s.formation) || s.formation,
					final_status: (s.formation && s.formation.final_status) ? s.formation.final_status : (formationMap.get(s.formation?._id || s.formation)?.final_status || 'PENDING'),
					__synthetic: false
				}));
				setSessions(sessionList);
			}
		} finally { setLoading(false); }
	};
	useEffect(()=>{ load(); },[]);

	// Fetch deeper details on selection if we have only ids or synthetic catalogue
	useEffect(()=>{
		const run = async () => {
			if(!selected) return;
			// If formation already has objectives/program we skip
			const source = selected.formation || selected.catalogue;
			if (source && (source.objectives || source.program)) return;
			setLoadingDetails(true);
			try {
				if(selected.formation && typeof selected.formation === 'object') return; // already detailed
				let detail = null;
				if (selected.formation && typeof selected.formation === 'string') {
					const r = await apiFetch(`/formations/${selected.formation}`);
					if(r.ok) detail = await r.json();
				} else if (selected.catalogue && typeof selected.catalogue === 'string') {
					const r = await apiFetch(`/catalogues/${selected.catalogue}`);
					if(r.ok) detail = await r.json();
				} else if (selected.catalogue && selected.catalogue._id && !selected.catalogue.program) {
					const r = await apiFetch(`/catalogues/${selected.catalogue._id}`);
					if(r.ok) detail = await r.json();
				}
				if(detail){
					setSelectedDetails(prev => ({...(prev||selected), formation: selected.formation? detail: (prev?.formation||null), catalogue: selected.catalogue? detail: selected.catalogue }));
				}
			} finally { setLoadingDetails(false); }
		};
		run();
	},[selected]);

		const counts = sessions.reduce((acc,s)=>{ acc.ALL++; acc[s.status]=(acc[s.status]||0)+1; return acc; }, { ALL:0, PENDING:0, CONFIRMED:0, REJECTED:0, COMPLETED:0 });
		// Role-based visibility
			let visible = sessions;
			if (user?.role === 'university_representative') {
				visible = sessions.filter(s => (s.requested_by && s.requested_by._id === user._id));
			} else if (user?.role === 'odc_mentor') {
				// Mentors see sessions where they are assigned as teacher OR listed as a trainer on the catalogue
				visible = sessions.filter(s => {
					const isTeacher = !!(s.teacher && ((s.teacher._id || s.teacher) === user._id));
					const isCatalogueTrainer = !!(s.catalogue && Array.isArray(s.catalogue.trainers) && s.catalogue.trainers.some(t => ((t._id || t) === user._id)));
					return isTeacher || isCatalogueTrainer;
				});
			}
		const filtered = visible.filter(s => filter==='ALL' || s.status===filter);
	const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
	const pageItems = filtered.slice((page-1)*pageSize, page*pageSize);

	const updateStatus = async (id,status) => {
		if(id.startsWith('catalogue-')) return; // cannot update status of placeholder without real session id
		// capture previous status before optimistic update
		const prevStatus = sessions.find(x=>x._id===id)?.status;
		const prev = sessions; setSessions(s=>s.map(x=>x._id===id?{...x,status, rejection_reason: status==='REJECTED'? rejectionReasonDraft: x.rejection_reason }:x));
		const body = { status };
		if(status==='REJECTED' && rejectionReasonDraft.trim()) body.rejection_reason = rejectionReasonDraft.trim();
		const res = await apiFetch(`/sessions/${id}/status`, { method:'PATCH', body: JSON.stringify(body) });
		if(res.ok){
			const upd = await res.json();
			setSessions(s=> s.map(x=> x._id===id? { ...x, ...upd }: x));
			setSelected(sel => sel && sel._id===id? {...sel, ...upd}: sel);
		} else {
			setSessions(prev);
		}
	};

	// Calendar helpers
	const startOfMonth = new Date(month.getFullYear(), month.getMonth(),1);
	const endOfMonth = new Date(month.getFullYear(), month.getMonth()+1,0);
	const startWeekDay = (startOfMonth.getDay()+6)%7; // make Monday=0
	const days = Array.from({length: startWeekDay + endOfMonth.getDate()}, (_,i)=> i<startWeekDay? null : new Date(month.getFullYear(), month.getMonth(), i-startWeekDay+1));
	const sessionByDay = (date) => sessions.filter(s=>{
		const d = s.scheduled_at || s.proposed_dates?.[0]?.from; if(!d) return false; const dd = new Date(d); return dd.getFullYear()===date.getFullYear() && dd.getMonth()===date.getMonth() && dd.getDate()===date.getDate();
	});
	const dayColor = (date) => {
		const list = sessionByDay(date);
		if(list.some(s=>s.status==='COMPLETED')) return STATUS_META.COMPLETED.color;
		if(list.some(s=>s.status==='CONFIRMED')) return STATUS_META.CONFIRMED.color;
		if(list.some(s=>s.status==='PENDING')) return STATUS_META.PENDING.color;
		if(list.some(s=>s.status==='REJECTED')) return STATUS_META.REJECTED.color;
		return null;
	};

	// Date range draft helpers for drawer date tab
	const resetRange = () => setRangeDraft({ start: null, end: null });
	const selectDayInRange = (d) => {
		setRangeDraft(prev => {
			if(!prev.start || (prev.start && prev.end)) return { start: d, end: null };
			if(prev.start && !prev.end) {
				if(d < prev.start) return { start: d, end: prev.start };
				if(d.getTime() === prev.start.getTime()) return { start: d, end: null };
				return { start: prev.start, end: d };
			}
			return prev;
		});
	};
	const inDraftRange = (date) => {
		if(!rangeDraft.start) return false;
		if(rangeDraft.start && !rangeDraft.end) return date.getTime()===rangeDraft.start.getTime();
		return date >= rangeDraft.start && date <= rangeDraft.end;
	};

	// Add Session Handlers
	const handleAddSessionClick = () => {
		setShowAddSessionModal(true);
	};

	const handleAddSessionSubmit = (formData) => {
		setSessionToAdd(formData);
		setShowAddSessionModal(false);
		setShowConfirmAddModal(true);
	};

	const handleConfirmAddSession = async () => {
		if (!sessionToAdd) return;

		try {
			const body = {
			catalogue: sessionToAdd.catalogue,
				proposed_dates: [
					{
						from: sessionToAdd.dateFrom,
						to: sessionToAdd.dateTo
					}
				]
			};

			const res = await apiFetch('/sessions', {
			method: 'POST',
			body: JSON.stringify(body)
		});

			if (res.ok) {
				const created = await res.json();
				setSessions(s => [created, ...s]);
				setShowConfirmAddModal(false);
				setSessionToAdd(null);
				setFilter('PENDING');
			} else {
				const errorData = await res.json().catch(() => ({}));
				console.error('Error creating session:', res.status, errorData);
				alert(`Erreur lors de la création de la session: ${errorData.message || 'Erreur inconnue'}`);
			}
		} catch (error) {
			console.error('Error creating session:', error);
			alert('Erreur réseau');
		}
	};

	// Reject Session Handlers
	const handleRejectClick = (session) => {
		setSessionToReject(session);
		setShowRejectModal(true);
	};

	const handleRejectSubmit = (reason) => {
		setRejectionReason(reason);
		setShowRejectModal(false);
		setShowConfirmRejectModal(true);
	};

	const handleConfirmReject = async () => {
		if (!sessionToReject) return;

		try {
			const body = {
			status: 'REJECTED',
				rejection_reason: rejectionReason
			};

			const res = await apiFetch(`/sessions/${sessionToReject._id}/status`, {
			method: 'PATCH',
			body: JSON.stringify(body)
		});

			if (res.ok) {
				const updated = await res.json();
				setSessions(s => s.map(x => x._id === sessionToReject._id ? { ...x, ...updated } : x));
				setSelected(sel => sel && sel._id === sessionToReject._id ? { ...sel, ...updated } : sel);
				setShowConfirmRejectModal(false);
				setSessionToReject(null);
				setRejectionReason('');
			} else {
				alert('Erreur lors du rejet de la session');
			}
		} catch (error) {
			console.error('Error rejecting session:', error);
			alert('Erreur réseau');
		}
	};

	// University Representative Request Session Handlers
	const handleRequestSessionClick = () => {
		setShowRequestSessionModal(true);
	};

	const handleRequestSessionSubmit = (requestData) => {
		setSessionToRequest(requestData);
		setShowRequestSessionModal(false);
		setShowConfirmRequestModal(true);
	};

	const handleConfirmRequestSession = async () => {
		if (!sessionToRequest) return;

		try {
			const body = {
			catalogue: sessionToRequest.catalogue,
				proposed_dates: sessionToRequest.proposed_dates
			};

			const res = await apiFetch('/sessions', {
			method: 'POST',
			body: JSON.stringify(body)
		});

			if (res.ok) {
				const created = await res.json();
				setSessions(s => [created, ...s]);
				setShowConfirmRequestModal(false);
				setSessionToRequest(null);
				setFilter('PENDING');
			} else {
				const errorData = await res.json().catch(() => ({}));
				console.error('Error requesting session:', res.status, errorData);
				alert(`Erreur lors de la demande de session: ${errorData.message || 'Erreur inconnue'}`);
			}
		} catch (error) {
			console.error('Error requesting session:', error);
			alert('Erreur réseau');
		}
	};

	const scheduleRange = async () => {
		if(!selected || !rangeDraft.start || !rangeDraft.end) return;
		setScheduling(true);
		try {
			const body = { start_date: rangeDraft.start.toISOString(), end_date: rangeDraft.end.toISOString() };
			const res = await apiFetch(`/sessions/${selected._id}/schedule`, { method:'PATCH', body: JSON.stringify(body) });
			if(res.ok){
				const upd = await res.json();
				setSessions(s=> s.map(x=> x._id===upd._id? { ...x, ...upd }: x));
				setSelected(prev => ({...prev, ...upd}));
				setDetailTab('SUMMARY');
				return upd;
			}
		} finally { setScheduling(false); }
	};

	// Confirm button: if dates were selected but not yet scheduled, schedule them first so they appear in table
	const confirmCurrent = async () => {
		if(!selected) return;
		const needSchedule = (!selected.scheduled_at && !selected.start_date && rangeDraft.start && rangeDraft.end);
		if(needSchedule) {
			await scheduleRange(); // will update selected & sessions
		}
		updateStatus(selected._id,'CONFIRMED');
		setSelected(sel=> sel?{...sel, status:'CONFIRMED'}:sel);
	};

	// Participants helpers
	const openParticipants = async () => {
		if(!selected) return;
		setShowParticipants(true);
		setParticipantsSessionId(selected._id);
		// Use already populated participants if any
		if(selected.participants) setParticipants(selected.participants);
		try {
			const res = await apiFetch(`/sessions/${selected._id}`);
			if(res.ok){
				const data = await res.json();
				setParticipants(data.participants||[]);
				setSelected(s=> s && s._id===data._id? {...s, participants:data.participants}:s);
			}
		}catch(e){ /* ignore */ }
	};
	const addParticipant = async () => {
		const sessionId = selected? selected._id : participantsSessionId;
		console.log('[addParticipant] click', { selected: !!selected, participantsSessionId, sessionId, newParticipant });
		if(!sessionId){
			setAddParticipantError('Session introuvable. Veuillez ré-ouvrir la liste depuis la session.');
			return;
		}
		if(!newParticipant.email){
			setAddParticipantError('Email obligatoire');
			return;
		}
		// simple email pattern
		if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newParticipant.email)){
			setAddParticipantError('Email invalide');
			return;
		}
		setAddingPartLoading(true);
		setAddParticipantError(null);
		try {
			const res = await apiFetch(`/sessions/${sessionId}/participants`, { method:'POST', body: JSON.stringify({ participants:[newParticipant] }) });
			if(res.ok){
				const data = await res.json();
				// Support both shapes: { _id, participants:[...] } OR a single participant doc
				let nextParticipants = null;
				let newDoc = null;
				let targetSessionId = sessionId;
				if (data && Array.isArray(data.participants)) {
					nextParticipants = data.participants;
					if(data._id) targetSessionId = data._id;
				} else if (data && Array.isArray(data.added)) {
					// some APIs return { added:[docs] }
					newDoc = data.added[0];
				} else if (data && data.participant) {
					newDoc = data.participant;
				} else if (data && data._id && data.email) {
					// looks like a participant doc
					newDoc = data;
				}
				if (!nextParticipants) {
					// merge newDoc into current state if present
					if (newDoc) {
						nextParticipants = [...participants.filter(p=> p._id !== newDoc._id), newDoc];
					} else {
						nextParticipants = participants;
					}
				}
				setParticipants(nextParticipants);
				setSelected(sel=> sel && sel._id===targetSessionId? { ...sel, participants: nextParticipants } : sel);
				setSessions(list => list.map(s => s._id === targetSessionId ? { ...s, participants: nextParticipants } : s));
				setNewParticipant({ name:'', email:'', phone:'', level:'', countryCode:'+216' });
				setShowAddModal(false);
			} else {
				let msg = 'Erreur inconnue';
				try { const data = await res.json(); msg = data.message || msg; } catch(_) {}
				if(res.status===401 || res.status===403) msg = 'Permission refusée: seul un administrateur peut ajouter des participants.';
				if(res.status===409) msg = 'Ce participant existe déjà.';
				setAddParticipantError(msg);
				console.warn('[addParticipant] server response not ok', res.status, msg);
			}
		} catch(e){
			console.error('[addParticipant] network error', e);
			setAddParticipantError('Erreur réseau: impossible de contacter le serveur.');
		} finally { setAddingPartLoading(false); }
	};
	const saveEditParticipant = async () => {
		if(!editParticipant) return;
		const sessionId = selected ? selected._id : participantsSessionId;
		if(!sessionId){
			setEditParticipantError('Session introuvable.');
			return;
		}
		setEditParticipantError(null);
		const { _id, ...payload } = editParticipant;
		try {
			const res = await apiFetch(`/sessions/${sessionId}/participants/${_id}`, { method:'PATCH', body: JSON.stringify(payload) });
			if(res.ok){
				const updatedDoc = await res.json();
				setParticipants(list => list.map(p=> p._id===updatedDoc._id? updatedDoc: p));
				// sync drawer selected copy
				if(selected && selected._id === sessionId){
					setSelected(sel => sel ? { ...sel, participants: (sel.participants||[]).map(p=> p._id===updatedDoc._id? updatedDoc : p) } : sel);
				}
				setShowEditModal(false);
			} else {
				let msg = 'Echec de la mise à jour';
				try { const data = await res.json(); if(data.message) msg = data.message; } catch(_) {}
				if(res.status===401 || res.status===403) msg = 'Permission refusée.';
				if(res.status===409) msg = "Email déjà utilisé pour cette session.";
				setEditParticipantError(msg);
			}
		} catch(e){
			setEditParticipantError('Erreur réseau');
		}
	};
	const confirmParticipantsList = async () => {
		if(!selected) return;
		const res = await apiFetch(`/sessions/${selected._id}/participants/confirm`, { method:'POST' });
		if(res.ok){
			setSelected(sel=> sel? {...sel, participants_confirmed:true }: sel);
			setShowConfirmModal(false);
		}
	};
	const togglePresence = async (p) => {
		const token = localStorage.getItem('token');
		const nextPresence = !p.presence;
		// optimistic update
		setParticipants(list => list.map(x=> x._id===p._id? {...x, presence: nextPresence}:x));
		try {
			const res = await apiFetch(`/sessions/${selected._id}/participants/${p._id}/presence`, {
			method:'PATCH',
			body: JSON.stringify({ presence: nextPresence })
		});
			if(!res.ok){
				// revert on failure (e.g., 403 when not assigned mentor)
				setParticipants(list => list.map(x=> x._id===p._id? {...x, presence: p.presence}:x));
			}
		} catch(e){
			// revert on network error
			setParticipants(list => list.map(x=> x._id===p._id? {...x, presence: p.presence}:x));
		}
	};

	// Import participants from CSV/XLS/XLSX/JSON
	const handleImportFile = async (file) => {
		setImportError(null);
		const sessionId = selected? selected._id : participantsSessionId;
		if(!sessionId){ setImportError('Session introuvable.'); return; }
		if(!file){ return; }
		const name = file.name.toLowerCase();
		try{
			setImporting(true);
			const arrayBuffer = await file.arrayBuffer();
			let rows = [];
			if(name.endsWith('.json')){
				// Parse JSON array
				const text = new TextDecoder().decode(new Uint8Array(arrayBuffer));
				const data = JSON.parse(text);
				if(Array.isArray(data)) rows = data; else if(Array.isArray(data.rows)) rows = data.rows; else throw new Error('JSON invalide');
			}else{
				// Use xlsx for csv/xls/xlsx
				const wb = XLSX.read(arrayBuffer, { type:'array' });
				const ws = wb.Sheets[wb.SheetNames[0]];
				rows = XLSX.utils.sheet_to_json(ws, { defval:'' });
			}
			// Normalize to expected fields: name, gender, phone(number), class(level), email
			const participantsPayload = rows.map(r=>{
				// build case-insensitive map
				const lower = {};
				Object.keys(r||{}).forEach(k=> { lower[k.toLowerCase().trim()] = r[k]; });
				const pick = (...cands) => {
					for(const c of cands){ const v = lower[c.toLowerCase()]; if(v!==undefined && v!==null && String(v).trim()!=='') return v; }
					return '';
				};
				const obj = {};
				obj.name = pick('name','nom','full name');
				obj.email = String(pick('email','e-mail','mail')).trim();
				obj.phone = pick('number','phone','phone number','numéro','numero','téléphone','telephone');
				obj.level = pick('class','classe','niveau');
				obj.gender = pick('gender','sexe');
				obj.countryCode = '+216';
				return obj;
			}).filter(p=> p.email);
			if(participantsPayload.length===0){ throw new Error('Aucune ligne valide trouvée'); }
			const res = await apiFetch(`/sessions/${sessionId}/participants`, { method:'POST', body: JSON.stringify({ participants: participantsPayload }) });
			if(!res.ok){
				let msg = 'Échec de l\'import'; try{ const d = await res.json(); if(d.message) msg=d.message; }catch{}
				throw new Error(msg);
			}
			const upd = await res.json();
			setParticipants(upd.participants||[]);
			setSelected(sel=> sel && sel._id===upd._id? {...sel, participants: upd.participants}: sel);
			setSessions(list => list.map(s => s._id === upd._id ? { ...s, participants: upd.participants } : s));
		} catch(e){
			setImportError(e.message || 'Erreur durant l\'import');
		} finally { setImporting(false); }
	};

	const deleteParticipant = async (participant) => {
		const sessionId = selected? selected._id : participantsSessionId;
		if(!sessionId) return;
		// optimistic update
		setParticipants(list => list.filter(p=> p._id!==participant._id));
		setActionMenuFor(null);
		await apiFetch(`/sessions/${sessionId}/participants/${participant._id}`, { method:'DELETE' });
		if(selected && selected._id===sessionId){
			setSelected(sel => sel ? { ...sel, participants: (sel.participants||[]).filter(p=> p._id!==participant._id) } : sel);
		}
		setSessions(list => list.map(s => s._id===sessionId ? { ...s, participants: (s.participants||[]).filter(p=> p._id!==participant._id) } : s));
	};

	// Donut chart data
	const donutData = [
		{ key:'PENDING', value: counts.PENDING, color: STATUS_META.PENDING.color },
		{ key:'CONFIRMED', value: counts.CONFIRMED, color: STATUS_META.CONFIRMED.color },
		{ key:'REJECTED', value: counts.REJECTED, color: STATUS_META.REJECTED.color },
		{ key:'COMPLETED', value: counts.COMPLETED, color: STATUS_META.COMPLETED.color }
	];
	const totalForDonut = donutData.reduce((a,b)=>a+b.value,0) || 1;
	let cumulative = 0;

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col relative">
			<AdminNavbar />
			<div className="flex flex-1" style={{marginTop:'64px'}}>
				<AdminSidebar user={user} onLogout={onLogout} onNavigate={onNavigate} activePage={activePage} />
				<div className="flex-1 flex flex-col p-6 overflow-y-auto" style={{marginLeft:'288px'}}>
					{/* Tabs + Add */}
					<div className="flex items-center justify-between mb-4">
						<div className="flex gap-0 bg-gray-100 rounded px-1 py-1 text-sm font-medium">
							{['ALL','PENDING','CONFIRMED','REJECTED','COMPLETED'].map(k=>{
								const active = filter===k; const label = k==='ALL'? 'Tout': STATUS_META[k].label; const count = counts[k];
								return <button key={k} onClick={()=>{setFilter(k); setPage(1);}} className={`px-4 py-1.5 rounded transition-colors ${active? 'bg-white shadow text-gray-900':'text-gray-600 hover:text-gray-900'}`}>{label} <span className="text-xs font-normal">({count})</span></button>;
							})}
						</div>
									{user?.role==='admin' && <button onClick={handleAddSessionClick} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm font-medium">+ Ajouter une session</button>}
									{user?.role==='university_representative' && <button onClick={handleRequestSessionClick} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm font-medium">+ Demander une session</button>}
					</div>
					<div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
						{/* List redesigned */}
						<div className="xl:col-span-3 flex flex-col items-start mx-auto w-full" style={{width:'860px'}}>
							{/* Header */}
							<div className="flex items-start w-full bg-[#F16E00] text-white rounded-t-lg border border-[#E4E4E7] px-4 py-4 gap-4" style={{height:'48px'}}>
								<div className="font-medium" style={{width:'480px'}}>Formation</div>
								<div className="font-medium" style={{width:'110px'}}>De</div>
								<div className="font-medium" style={{width:'110px'}}>Jusqu'à</div>
								<div className="font-medium" style={{width:'90px'}}>Etat</div>
								<div className="ml-auto text-xs font-normal opacity-80">{/* actions placeholder */}</div>
							</div>
							{/* Body container */}
							<div className="w-full bg-white border border-t-0 border-[#E4E4E7] rounded-b-lg overflow-hidden" style={{minHeight:'200px'}}>
								{loading && <div className="p-6 text-sm text-gray-500">Chargement...</div>}
								{!loading && pageItems.length===0 && (
									<div className="flex flex-col items-center justify-center text-center gap-8 py-20" style={{minHeight:'420px'}}>
										<img src="/empty_session_logo.png" alt="Empty sessions" className="w-[210px] h-[210px] object-contain" />
										<div className="flex flex-col items-center gap-3 max-w-[460px]">
											<h3 className="text-[20px] font-medium text-[#050505]">Aucune session programmée pour le moment</h3>
											<p className="text-[14px] leading-snug text-[#050505]">Vous pouvez ajouter une formation manuellement ou attendre la programmation des sessions par les universités.</p>
											{user?.role==='admin' && (
												<button className="mt-2 bg-[#F16E00] hover:bg-orange-600 text-white text-[14px] font-normal px-4 py-2 rounded" onClick={()=>{/* TODO: open creation modal */}}>Ajouter une session</button>
											)}
										</div>
									</div>
								)}
								{!loading && pageItems.map((s,idx)=>{
									const from = s.scheduled_at ? new Date(s.scheduled_at) : (s.proposed_dates?.[0]?.from ? new Date(s.proposed_dates[0].from):null);
									const to = s.scheduled_end ? new Date(s.scheduled_end) : (s.proposed_dates?.[0]?.to ? new Date(s.proposed_dates[0].to):null);
									const fmt = d => d? d.toLocaleDateString('fr-FR'):'—';
									const statusMeta = STATUS_META[s.status] || STATUS_META.PENDING;
									return (
											<div key={s._id} onClick={()=>{ setSelected(s); setSelectedDetails(null); }} className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 ${idx!==0?'border-t border-[#E4E4E7]':''}`} style={{height:'57px'}}>
												<div className="flex flex-col justify-center" style={{width:'480px'}}>
												<div className="text-[16px] leading-[19px] text-[#050505] truncate">{s.formation?.title || s.catalogue?.title || '—'}</div>
												<div className="text-[14px] leading-[17px] text-[#A1A1AA] truncate">{s.formation?.organization || s.catalogue?.created_by?.university?.name || ''}</div>
											</div>
												<div className="text-[16px] leading-[19px] text-[#050505]" style={{width:'110px'}}>{fmt(s.start_date ? new Date(s.start_date) : from)}</div>
												<div className="text-[16px] leading-[19px] text-[#050505]" style={{width:'110px'}}>{fmt(s.end_date ? new Date(s.end_date) : to)}</div>
												<div style={{width:'90px'}}>
												<span className="inline-flex items-center gap-1 px-2 py-1 rounded text-white text-[14px]" style={{background:statusMeta.color}}>
													<span className="w-2 h-2 rounded-full bg-white"></span>{statusMeta.label}
												</span>
											</div>
											{/* Actions removed; status changes now only via drawer */}
										</div>
									);
								})}
							</div>
							{/* Pagination */}
							<div className="flex items-center justify-between mt-4 text-xs text-gray-600 w-full">
								<div>{(pageItems.length>0)? `${(page-1)*pageSize+1}-${(page-1)*pageSize+pageItems.length}`:'0'} sur {filtered.length} Résultats</div>
								<div className="flex items-center gap-1">
									<button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-2 py-1 rounded border disabled:opacity-40">&lt;</button>
									{Array.from({length: Math.min(pageCount,5)}).map((_,i)=>{ const p=i+1; return <button key={p} onClick={()=>setPage(p)} className={`px-2 py-1 rounded border text-xs ${p===page?'bg-orange-500 text-white border-orange-500':'bg-white'}`}>{p}</button>; })}
									{pageCount>5 && <span className="px-2">...</span>}
									<button disabled={page===pageCount} onClick={()=>setPage(p=>Math.min(pageCount,p+1))} className="px-2 py-1 rounded border disabled:opacity-40">&gt;</button>
								</div>
							</div>
						</div>
						{/* Side Panel (when nothing selected) */}
						<div className="space-y-6">
							{!selected && (
								<>
									<div className="bg-white rounded-lg shadow p-4 w-full min-w-[260px]">
										<div className="flex items-center justify-between mb-2 text-sm font-medium">
											<button onClick={()=>setMonth(m=> new Date(m.getFullYear(), m.getMonth()-1,1))}>&lt;</button>
											<span>{month.toLocaleDateString('fr-FR', { month:'long', year:'numeric' })}</span>
											<button onClick={()=>setMonth(m=> new Date(m.getFullYear(), m.getMonth()+1,1))}>&gt;</button>
										</div>
										<div className="grid grid-cols-7 text-[11px] text-center text-gray-500 mb-1">
											{['lu','ma','me','je','ve','sa','di'].map(d=> <div key={d} className="py-1 capitalize">{d}</div>)}
										</div>
										<div className="grid grid-cols-7 gap-y-1 text-sm text-center">
											{days.map((d,i)=> d ? (
												<div key={i} className="h-8 flex items-center justify-center relative">
													<div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium ${dayColor(d)?'text-white':''}`} style={{background: dayColor(d)||'transparent'}}>{d.getDate()}</div>
												</div>
											) : <div key={i}></div>)}
										</div>
										<button className="mt-3 text-xs text-orange-600 font-medium hover:underline">Voir Plus</button>
									</div>
									<div className="bg-white rounded-lg shadow p-4">
										<h3 className="text-sm font-semibold mb-4 text-center">État des formations</h3>
										<div className="flex flex-col items-center">
											<div className="relative w-40 h-40 mb-4">
												<svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
													<circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#eee" strokeWidth="6" />
													{donutData.map(seg=>{ const value = seg.value/totalForDonut; const dash = value*100; const gap = 100-dash; const circle = (
														<circle key={seg.key} cx="21" cy="21" r="15.915" fill="transparent" stroke={seg.color} strokeWidth="6" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={cumulative} />
													); cumulative -= dash; return circle; })}
												</svg>
												<div className="absolute inset-0 flex items-center justify-center">
													<div className="text-center">
														<div className="text-lg font-bold">{counts.ALL}</div>
														<div className="text-[10px] text-gray-500">Total</div>
													</div>
												</div>
											</div>
											<div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] w-full">
												{donutData.map(d=> (
													<div key={d.key} className="flex items-center gap-2">
														<span className="w-3 h-3 rounded-sm" style={{background:d.color}}></span>
														<span className="truncate">{STATUS_META[d.key].label} <span className="font-semibold">{d.value}</span></span>
													</div>
												))}
											</div>
										</div>
									</div>
								</>
							)}
						</div>
					</div>

					{/* Drawer modal for details */}
					{selected && (
						<div className="fixed inset-0 z-40 flex justify-end">
							<div className="absolute inset-0 bg-black/30" onClick={()=>{ setSelected(null); setDetailTab('SUMMARY'); }}></div>
							<div className="relative h-full w-[472px] bg-white border-l border-[#E4E4E7] flex flex-col justify-between rounded-l-lg" style={{fontFamily:'Helvetica Neue, Arial, sans-serif'}}>
								<div className="flex flex-col gap-8 p-6 overflow-y-auto" style={{height:'calc(100% - 95px)'}}>
									{/* Header */}
									<div className="flex flex-col gap-6">
										<div className="flex items-center justify-between">
											<span className="text-[16px] text-[#71717A]">Détails de la session</span>
											<button onClick={()=>{ setSelected(null); setDetailTab('SUMMARY'); }} className="text-[#71717A] hover:text-gray-900 text-xl leading-none">×</button>
										</div>
										<hr className="border-[#E4E4E7]" />
									</div>
									{/* Segmented */}
									<div className="flex items-center bg-[#EFEFF0] border border-[#E4E4E7] rounded w-full h-[39px] p-1 gap-4 text-[16px]">
										<button onClick={()=>setDetailTab('SUMMARY')} className={`flex-1 h-full rounded px-4 flex items-center justify-center ${detailTab==='SUMMARY'?'bg-white shadow text-[#050505]':'text-[#A1A1AA]'}`}>Résumé de la session</button>
										<button onClick={()=>setDetailTab('DATE')} className={`flex-1 h-full rounded px-4 flex items-center justify-center ${detailTab==='DATE'?'bg-white shadow text-[#050505]':'text-[#A1A1AA]'}`}>Sélecteur de date</button>
									</div>
									{(loadingDetails && !selectedDetails) && <div className="text-xs text-gray-500">Chargement des détails...</div>}
									{(() => {
										const base = selectedDetails || selected;
										const source = base?.formation || base?.catalogue || {};
										const title = source.title || '—';
										const objectives = source.objectives || source.description || '—';
											const statusMeta = STATUS_META[base.status] || STATUS_META.PENDING;
											const trainerName = base.teacher?.name || base.catalogue?.trainers?.[0]?.name;
										const programDays = source.program?.length || null;
										const durationLabel = source.duration || (programDays ? `${programDays} jour${programDays>1?'s':''}` : '—');
										if(detailTab==='DATE') return (
											<div className="flex flex-col gap-6">
												{/* Only allow scheduling while pending or no dates yet */}
												{!(base.status==='PENDING' || (!base.scheduled_at && !base.scheduled_end)) && <div className="text-xs text-gray-500">Les dates sont déjà définies.</div>}
												<div className="flex items-center justify-between">
													<button onClick={()=>setMonth(m=> new Date(m.getFullYear(), m.getMonth()-1,1))} className="text-sm px-2 py-1 rounded hover:bg-gray-100">&lt;</button>
													<div className="text-sm font-medium">{month.toLocaleDateString('fr-FR',{ month:'long', year:'numeric' })}</div>
													<button onClick={()=>setMonth(m=> new Date(m.getFullYear(), m.getMonth()+1,1))} className="text-sm px-2 py-1 rounded hover:bg-gray-100">&gt;</button>
												</div>
												<div className="grid grid-cols-7 text-[11px] text-center text-gray-500 mb-1">
													{['lu','ma','me','je','ve','sa','di'].map(d=> <div key={d} className="py-1 capitalize">{d}</div>)}
												</div>
												<div className="grid grid-cols-7 gap-y-1 text-sm text-center select-none">
													{days.map((d,i)=> d ? (
														<div key={i} className="h-9 flex items-center justify-center relative" onClick={()=>{ if(base.status!=='PENDING') return; selectDayInRange(d); }}>
															<div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium cursor-pointer transition-colors ${inDraftRange(d)?'bg-[#F16E00] text-white':'hover:bg-gray-200'} ${dayColor(d)?'text-white':''}`} style={{background: inDraftRange(d)?'#F16E00': (dayColor(d)|| (dayColor(d)?dayColor(d):'transparent'))}}>{d.getDate()}</div>
														</div>
													) : <div key={i}></div>)}
												</div>
												<div className="flex items-center gap-4 text-[12px] text-gray-600">
													<div><span className="inline-block w-3 h-3 rounded-full bg-[#F16E00] mr-1 align-middle"></span>Période sélectionnée</div>
													<div><span className="inline-block w-3 h-3 rounded-full bg-[#24965A] mr-1 align-middle"></span>Confirmé</div>
													<div><span className="inline-block w-3 h-3 rounded-full bg-[#F88826] mr-1 align-middle"></span>En attente</div>
												</div>
												{/* Proposed dates listing */}
												{Array.isArray(base.proposed_dates) && base.proposed_dates.length>0 && (
													<div className="flex flex-col gap-2 mt-2">
														<div className="text-[13px] font-medium text-[#050505]">Propositions:</div>
														{base.proposed_dates.map((p,idx)=>{
															const from = new Date(p.from); const to = new Date(p.to);
															const active = rangeDraft.start && rangeDraft.end && rangeDraft.start.toDateString()===from.toDateString() && rangeDraft.end.toDateString()===to.toDateString();
															return (
																<label key={idx} className={`flex items-center gap-3 text-[12px] p-2 rounded border cursor-pointer ${active?'border-[#F16E00] bg-orange-50':'border-[#E4E4E7]'}`} onClick={()=> setRangeDraft({ start: from, end: to })}>
																	<input type="radio" name="proposal" checked={active} readOnly />
																	<span>{from.toLocaleDateString('fr-FR')} → {to.toLocaleDateString('fr-FR')}</span>
																</label>
															);
														})}
													</div>
												)}
												<div className="flex items-center gap-2 mt-2">
													<button onClick={resetRange} className="text-xs text-gray-600 underline">Réinitialiser</button>
													{(rangeDraft.start && rangeDraft.end && (base.status==='PENDING' || (!base.scheduled_at && !base.scheduled_end))) && <button disabled={scheduling} onClick={scheduleRange} className="ml-auto bg-[#F16E00] text-white text-xs px-3 py-2 rounded disabled:opacity-50">{scheduling?'Enregistrement...':'Planifier ces dates'}</button>}
												</div>
											</div>
										);
										const start = base.start_date || base.scheduled_at;
										const end = base.end_date || base.scheduled_end;
												// If drawer session matches participants modal session, prefer live participants state
												let participantsCount = 0;
												if(Array.isArray(base.participants)) participantsCount = base.participants.length;
												if(participantsSessionId && base._id === participantsSessionId && Array.isArray(participants)) participantsCount = participants.length;
										const isRejected = base.status==='REJECTED';
										const rejectionReason = base.rejection_reason;
										return (
											<>
												<h2 className="text-[20px] font-medium leading-snug text-[#050505]">{title}</h2>
												<p className="text-[14px] text-[#18181B] leading-snug whitespace-pre-line max-h-32 overflow-y-auto">{objectives}</p>
												<div className="mt-4 flex flex-col gap-3">
													<div className="flex items-center gap-8 text-[16px]"><span className="text-[#71717A] w-20">Status:</span><span className="flex items-center gap-2 px-2 py-1 rounded text-white text-[14px]" style={{background:statusMeta.color}}><span className="w-2 h-2 rounded-full bg-white inline-block"></span>{statusMeta.label}</span></div>
													<div className="flex items-center gap-8 text-[16px]"><span className="text-[#71717A] w-20">Université:</span><span className="text-[#050505]">{base.requested_by?.university?.name || base.catalogue?.created_by?.university?.name || '—'}</span></div>
													<div className="flex items-center gap-8 text-[16px]"><span className="text-[#71717A] w-20">Formateur:</span><span className="text-[#050505]">{trainerName || '—'}</span></div>
													<div className="flex items-center gap-8 text-[16px]"><span className="text-[#71717A] w-20">Durée:</span><span className="text-[#050505]">{durationLabel}</span></div>
													<div className="flex items-center gap-8 text-[16px]"><span className="text-[#71717A] w-20">Type:</span><span className="text-[#050505]">{source.type || '—'}</span></div>
													<div className="flex items-center gap-8 text-[16px]"><span className="text-[#71717A] w-20">Niveau:</span><span className="text-[#050505]">{source.level || '—'}</span></div>
													<div className="flex items-center gap-8 text-[16px]"><span className="text-[#71717A] w-20">Reçu le:</span><span className="text-[#050505]">{new Date(base.createdAt).toLocaleString('fr-FR',{ day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span></div>
												</div>
												{(start || end || participantsCount>0) && (
													<div className="mt-6 bg-[#F7F7F8] border border-[#E4E4E7] rounded p-3 flex flex-col gap-3">
														<div className="flex items-center gap-8 text-[14px]"><span className="text-[#71717A] w-24">Date:</span><span className="text-[#050505] font-medium">{start? new Date(start).toLocaleDateString('fr-FR'):'—'} - {end? new Date(end).toLocaleDateString('fr-FR'):'—'}</span></div>
														<div className="flex items-center gap-8 text-[14px]"><span className="text-[#71717A] w-24">Nb Participants:</span><span className="text-[#050505] font-medium">{participantsCount} Étudiant{participantsCount>1?'s':''}</span></div>
														<button onClick={openParticipants} className="w-full bg-[#F16E00] text-white rounded text-[16px] py-2">Voir la liste des participants</button>
													</div>
												)}
												{isRejected && (
													<div className="mt-6 flex flex-col gap-2">
														<h3 className="text-[20px] font-medium text-[#050505]">Message de rejet:</h3>
														<div className="bg-[#FFF1F1] border border-[#FFC4C4] rounded p-4 text-[16px] leading-snug text-black whitespace-pre-line min-h-[60px]">{rejectionReason || '—'}</div>
													</div>
												)}
											</>
										);
									})()}
								</div>
								<div className="border-t border-[#E4E4E7] p-6 flex flex-col gap-6">
									<div className="flex gap-8 w-full">
										{user?.role==='admin' && selected.status==='PENDING' && (
											<>
												<button onClick={() => handleRejectClick(selected)} className="flex-1 border border-[#A1A1AA] rounded text-[16px] py-2 text-[#18181B]">Rejeter</button>
												<button onClick={confirmCurrent} className="flex-1 bg-[#F16E00] rounded text-white text-[16px] py-2">Confirmer</button>
											</>
										)}
										{user?.role==='admin' && selected.status==='CONFIRMED' && (
											<>
												<button onClick={() => handleRejectClick(selected)} className="flex-1 border border-[#A1A1AA] rounded text-[14px] py-2 text-[#18181B]">Annuler</button>
												<button onClick={()=>{updateStatus(selected._id,'COMPLETED'); setSelected(sel=> sel?{...sel, status:'COMPLETED'}:sel);}} className="flex-1 bg-[#F16E00] rounded text-white text-[14px] py-2">Clôturer</button>
											</>
										)}
										{selected.status==='COMPLETED' && (
											<button onClick={()=>{ setSelected(null); setDetailTab('SUMMARY'); }} className="w-full border border-[#A1A1AA] rounded text-[16px] py-2 text-[#18181B]">Fermer</button>
										)}
										{selected.status==='REJECTED' && (
											<button onClick={()=>{ setSelected(null); setDetailTab('SUMMARY'); }} className="w-full border border-[#A1A1AA] rounded text-[16px] py-2 text-[#18181B]">Fermer</button>
										)}
									</div>
									{user?.role==='admin' && ['PENDING','CONFIRMED'].includes(selected.status) && (
										<textarea value={rejectionReasonDraft} onChange={e=>setRejectionReasonDraft(e.target.value)} placeholder="Motif du rejet (optionnel)" className="w-full border border-[#E4E4E7] rounded p-2 text-sm resize-none h-24 focus:outline-none focus:ring-1 focus:ring-orange-500" />
									)}
								</div>
							</div>
						</div>
					)}

					{/* Add Participant Modal */}
					{showAddModal && (
						<div className="fixed inset-0 z-[70] flex items-start justify-center p-4 overflow-y-auto">
							<div className="fixed inset-0 bg-black/40" onClick={()=> setShowAddModal(false)}></div>
							<div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mt-10 p-6">
								<div className="flex items-start justify-between mb-6">
									<h2 className="text-xl font-semibold">Ajouter Un Participant</h2>
									<button onClick={()=> setShowAddModal(false)} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">×</button>
								</div>
								<div className="flex flex-col gap-5">
									<div className="flex flex-col gap-1">
										<label className="text-sm font-medium">Nom</label>
										<input className="border rounded px-3 py-2 text-sm" placeholder="Nom d'utilisateur" value={newParticipant.name} onChange={e=> setNewParticipant(p=>({...p,name:e.target.value}))} />
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-sm font-medium">Email</label>
										<input className="border rounded px-3 py-2 text-sm" placeholder="nom@email.com" value={newParticipant.email} onChange={e=> setNewParticipant(p=>({...p,email:e.target.value}))} />
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-sm font-medium">Numéro</label>
										<div className="flex">
											<select value={newParticipant.countryCode||'+216'} onChange={e=> setNewParticipant(p=>({...p,countryCode:e.target.value}))} className="border rounded-l px-2 text-sm bg-white">
												<option value="+216">TN +216</option>
												<option value="+33">FR +33</option>
											</select>
											<input className="border border-l-0 rounded-r px-3 py-2 text-sm flex-1" placeholder="+216" value={newParticipant.phone} onChange={e=> setNewParticipant(p=>({...p,phone:e.target.value}))} />
										</div>
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-sm font-medium">Niveau</label>
										<select className="border rounded px-3 py-2 text-sm" value={newParticipant.level||''} onChange={e=> setNewParticipant(p=>({...p,level:e.target.value}))}>
											<option value="" disabled>Niveau du participant</option>
											{levelOptions.map(o=> <option key={o} value={o}>{o}</option>)}
										</select>
									</div>
								</div>
								{addParticipantError && <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{addParticipantError}</div>}
								<div className="mt-8 flex justify-end gap-4 text-sm">
									<button onClick={()=> setShowAddModal(false)} className="border px-4 py-2 rounded">Annuler</button>
									<button disabled={!newParticipant.email} onClick={addParticipant} className="bg-[#F16E00] text-white px-5 py-2 rounded disabled:opacity-50">Ajouter</button>
								</div>
							</div>
						</div>
					)}

					{/* Edit Participant Modal */}
					{showEditModal && editParticipant && (
						<div className="fixed inset-0 z-[70] flex items-start justify-center p-4 overflow-y-auto">
							<div className="fixed inset-0 bg-black/40" onClick={()=> setShowEditModal(false)}></div>
							<div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mt-10 p-6">
								<div className="flex items-start justify-between mb-6">
									<h2 className="text-xl font-semibold">Modifier Un Participant</h2>
									<button onClick={()=> setShowEditModal(false)} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">×</button>
								</div>
								<div className="flex flex-col gap-5">
									<div className="flex flex-col gap-1">
										<label className="text-sm font-medium">Nom</label>
										<input className="border rounded px-3 py-2 text-sm" value={editParticipant.name||''} onChange={e=> setEditParticipant(p=>({...p,name:e.target.value}))} />
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-sm font-medium">Email</label>
										<input className="border rounded px-3 py-2 text-sm" value={editParticipant.email} onChange={e=> setEditParticipant(p=>({...p,email:e.target.value}))} />
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-sm font-medium">Numéro</label>
										<div className="flex">
											<select value={editParticipant.countryCode||'+216'} onChange={e=> setEditParticipant(p=>({...p,countryCode:e.target.value}))} className="border rounded-l px-2 text-sm bg-white">
												<option value="+216">TN +216</option>
												<option value="+33">FR +33</option>
											</select>
											<input className="border border-l-0 rounded-r px-3 py-2 text-sm flex-1" value={editParticipant.phone||''} onChange={e=> setEditParticipant(p=>({...p,phone:e.target.value}))} />
										</div>
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-sm font-medium">Niveau</label>
										<select className="border rounded px-3 py-2 text-sm" value={editParticipant.level||''} onChange={e=> setEditParticipant(p=>({...p,level:e.target.value}))}>
											<option value="" disabled>Choisir niveau</option>
											{levelOptions.map(o=> <option key={o} value={o}>{o}</option>)}
										</select>
									</div>
								</div>
								<div className="mt-8 flex justify-end gap-4 text-sm">
									<button onClick={()=> setShowEditModal(false)} className="border px-4 py-2 rounded">Annuler</button>
									<button onClick={saveEditParticipant} className="bg-[#F16E00] text-white px-5 py-2 rounded">Confirmer</button>
								</div>
								{editParticipantError && <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{editParticipantError}</div>}
							</div>
						</div>
					)}


					{/* Participants modal */}
					{showParticipants && (
											<div className="fixed inset-0 z-[60] flex items-start justify-center p-4 overflow-y-auto">
							<div className="fixed inset-0 bg-black/40" onClick={()=> setShowParticipants(false)}></div>
							<div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl mt-6 p-6 flex flex-col" style={{maxHeight:'calc(100vh - 3rem)'}}>
								<div className="flex items-start justify-between mb-4">
									<h2 className="text-xl font-semibold">Modifier la liste des participants</h2>
									<button onClick={()=> setShowParticipants(false)} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">×</button>
								</div>
								<div className="flex items-center justify-end gap-3 mb-4">
									<input id="importParticipantsInput" type="file" accept=".csv,.xls,.xlsx,.json" className="hidden" onChange={e=> { const f=e.target.files?.[0]; if(f) handleImportFile(f); e.target.value=''; }} />
									<button onClick={()=> document.getElementById('importParticipantsInput').click()} className="border border-[#E4E4E7] px-4 py-2 rounded text-sm text-[#18181B] hover:bg-gray-50" disabled={importing}>{importing? 'Import...' : 'Importer (.csv/.xls/.xlsx/.json)'}</button>
									<button onClick={()=> { setNewParticipant({ name:'', email:'', phone:'', level:'', countryCode:'+216'}); setShowAddModal(true); }} className="bg-[#F16E00] text-white px-4 py-2 rounded text-sm">+ Ajouter Participant</button>
								</div>
								{importError && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{importError}</div>}
								<div className="flex-1 overflow-y-auto border rounded-lg" style={{minHeight:'420px'}}>
									<table className="w-full text-sm">
										<thead>
											<tr className="bg-[#F16E00] text-white text-left">
												<th className="font-medium px-4 py-3 w-1/4">Nom</th>
												<th className="font-medium px-4 py-3 w-1/4">Email</th>
												<th className="font-medium px-4 py-3 w-1/6">Numéro</th>
												<th className="font-medium px-4 py-3 w-1/6">Présence</th>
												<th className="px-2 py-3 w-8"></th>
											</tr>
										</thead>
										<tbody>
											{participants.map(p => (
												<tr key={p._id} className="border-t">
													<td className="px-4 py-3 whitespace-nowrap">{p.name || '—'}</td>
													<td className="px-4 py-3 whitespace-nowrap">{p.email}</td>
													<td className="px-4 py-3 whitespace-nowrap">{p.phone || '—'}</td>
													<td className="px-4 py-3">
														{(() => {
															const isMentor = user?.role==='odc_mentor' && selected && selected.teacher && ((selected.teacher._id||selected.teacher)===user._id);
															const canToggle = isMentor;
															return (
																<button disabled={!canToggle} onClick={()=> canToggle && togglePresence(p)} className={`w-12 h-6 rounded-full relative transition-colors ${p.presence?'bg-[#24965A]':'bg-gray-300'} ${!canToggle?'opacity-50 cursor-not-allowed':''}`}>
																	<span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${p.presence?'translate-x-6':''}`}></span>
																</button>
															);
														})()}
													</td>
													<td className="px-2 py-3 text-center text-gray-500">
														<div className="relative inline-block text-left">
															<button onClick={(e)=> { e.stopPropagation(); setActionMenuFor(id => id===p._id? null : p._id); }} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 focus:outline-none">
																<span className="text-xl leading-none">⋮</span>
															</button>
															{actionMenuFor===p._id && (
																<div className="absolute right-0 mt-1 w-44 bg-white border border-[#E4E4E7] rounded shadow-sm z-10" onMouseLeave={()=> setActionMenuFor(null)}>
																	<button onClick={()=> { setEditParticipant({ ...p }); setShowEditModal(true); setActionMenuFor(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-[#18181B]">
																		<img src="/edit_icon.png" alt="edit" className="w-4 h-4" />
																		<span>Modifier</span>
																	</button>
																	<button onClick={()=> deleteParticipant(p)} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-[#18181B]">
																		<img src="/trash_icon.png" alt="delete" className="w-4 h-4" />
																		<span>Supprimer</span>
																	</button>
																</div>
															)}
														</div>
													</td>
												</tr>
											))}
											{participants.length===0 && (
												<tr><td className="px-4 py-8 text-center text-gray-500" colSpan={5}>Aucun participant</td></tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}

					{/* Add Session Modal */}
					{showAddSessionModal && (
						<AddSessionModal
							onCancel={() => setShowAddSessionModal(false)}
							onConfirm={handleAddSessionSubmit}
						/>
					)}

					{/* Confirm Add Session Modal */}
					{showConfirmAddModal && (
						<ConfirmAddSessionModal
							onCancel={() => {
								setShowConfirmAddModal(false);
								setSessionToAdd(null);
							}}
							onConfirm={handleConfirmAddSession}
						/>
					)}

					{/* Reject Session Modal */}
					{showRejectModal && (
						<RejectSessionModal
							onCancel={() => {
								setShowRejectModal(false);
								setSessionToReject(null);
							}}
							onConfirm={handleRejectSubmit}
							sessionTitle={sessionToReject?.catalogue?.title || 'Session'}
						/>
					)}

					{/* Confirm Reject Session Modal */}
					{showConfirmRejectModal && (
						<ConfirmRejectSessionModal
							onCancel={() => {
								setShowConfirmRejectModal(false);
								setRejectionReason('');
							}}
							onConfirm={handleConfirmReject}
						/>
					)}

					{/* Request Session Modal (University Representative) */}
					{showRequestSessionModal && (
						<RequestSessionModal
							onCancel={() => setShowRequestSessionModal(false)}
							onConfirm={handleRequestSessionSubmit}
						/>
					)}

					{/* Confirm Request Session Modal */}
					{showConfirmRequestModal && (
						<ConfirmRequestSessionModal
							onCancel={() => {
								setShowConfirmRequestModal(false);
								setSessionToRequest(null);
							}}
							onConfirm={handleConfirmRequestSession}
							catalogueTitle={sessionToRequest?.catalogueTitle}
						/>
					)}

				</div>
			</div>
		</div>
	);
};

export default Sessions;

// Participants Modal appended after component definition removed (component returns earlier)
