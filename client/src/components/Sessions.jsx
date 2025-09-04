import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminDashboard/AdminNavbar';
import AdminSidebar from './AdminDashboard/AdminSidebar';

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
				fetch('/api/sessions'),
				fetch('/api/formations'),
				fetch('/api/catalogues')
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
					const r = await fetch(`/api/formations/${selected.formation}`);
					if(r.ok) detail = await r.json();
				} else if (selected.catalogue && typeof selected.catalogue === 'string') {
					const r = await fetch(`/api/catalogues/${selected.catalogue}`);
					if(r.ok) detail = await r.json();
				} else if (selected.catalogue && selected.catalogue._id && !selected.catalogue.program) {
					const r = await fetch(`/api/catalogues/${selected.catalogue._id}`);
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
		// University rep sees only their requested sessions plus confirmed ones for their formations (simplified: show all for now unless role restricts)
		let visible = sessions;
		if (user?.role === 'university_representative') {
			visible = sessions.filter(s => (s.requested_by && s.requested_by._id === user._id));
		}
		const filtered = visible.filter(s => filter==='ALL' || s.status===filter);
	const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
	const pageItems = filtered.slice((page-1)*pageSize, page*pageSize);

	const updateStatus = async (id,status) => {
		if(id.startsWith('catalogue-')) return; // cannot update status of placeholder without real session id
		const token = localStorage.getItem('token');
		// capture previous status before optimistic update
		const prevStatus = sessions.find(x=>x._id===id)?.status;
		const prev = sessions; setSessions(s=>s.map(x=>x._id===id?{...x,status, rejection_reason: status==='REJECTED'? rejectionReasonDraft: s.rejection_reason }:x));
		const body = { status };
		if(status==='REJECTED' && rejectionReasonDraft.trim()) body.rejection_reason = rejectionReasonDraft.trim();
		const res = await fetch(`/api/sessions/${id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json',Authorization: token?`Bearer ${token}`:''}, body: JSON.stringify(body) });
		if(res.ok){
			const upd = await res.json();
			setSessions(s=> s.map(x=> x._id===id? { ...x, ...upd }: x));
			setSelected(sel => sel && sel._id===id? {...sel, ...upd}: sel);
			// if current filter was the old status and row moved to new status, adjust filter so it remains visible
			if(filter !== 'ALL' && prevStatus && prevStatus !== upd.status && filter === prevStatus){
				setFilter(upd.status); // switch to new status tab automatically
			}
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

	const scheduleRange = async () => {
		if(!selected || !rangeDraft.start || !rangeDraft.end) return;
		setScheduling(true);
		try {
			const token = localStorage.getItem('token');
			const body = { start_date: rangeDraft.start.toISOString(), end_date: rangeDraft.end.toISOString() };
			const res = await fetch(`/api/sessions/${selected._id}/schedule`, { method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization: token?`Bearer ${token}`:'' }, body: JSON.stringify(body) });
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
									{user?.role==='admin' && <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm font-medium">+ Ajouter une session</button>}
									{user?.role==='university_representative' && <button onClick={async ()=>{
										const formationId = prompt('Entrer ID de la formation');
										if(!formationId) return;
										const date1From = prompt('Proposition 1 - date début (YYYY-MM-DD)');
										const date1To = prompt('Proposition 1 - date fin (YYYY-MM-DD)');
										const body = { formation: formationId, proposed_dates: [] };
										if(date1From && date1To) body.proposed_dates.push({ from: date1From, to: date1To });
										const date2From = prompt('Proposition 2 - date début (optionnel)');
										if(date2From){ const date2To = prompt('Proposition 2 - date fin'); if(date2To) body.proposed_dates.push({ from: date2From, to: date2To }); }
										const token = localStorage.getItem('token');
										const res = await fetch('/api/sessions', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: token?`Bearer ${token}`:'' }, body: JSON.stringify(body) });
										if(res.ok){ const created = await res.json(); setSessions(s=>[created, ...s]); setFilter('PENDING'); }
									}} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm font-medium">+ Demander une session</button>}
					</div>
					<div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
						{/* List redesigned */}
						<div className="xl:col-span-3 flex flex-col items-start mx-auto" style={{width:'968px'}}>
							{/* Header */}
							<div className="flex items-start w-full bg-[#F16E00] text-white rounded-t-lg border border-[#E4E4E7] px-4 py-4 gap-4" style={{height:'48px'}}>
								<div className="font-medium" style={{width:'550px'}}>Formation</div>
								<div className="font-medium" style={{width:'120px'}}>De</div>
								<div className="font-medium" style={{width:'120px'}}>Jusqu'à</div>
								<div className="font-medium" style={{width:'98px'}}>Etat</div>
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
											<div className="flex flex-col justify-center" style={{width:'545px'}}>
												<div className="text-[16px] leading-[19px] text-[#050505] truncate">{s.formation?.title || s.catalogue?.title || '—'}</div>
												<div className="text-[14px] leading-[17px] text-[#A1A1AA] truncate">{s.formation?.organization || s.catalogue?.created_by?.university?.name || ''}</div>
											</div>
											<div className="text-[16px] leading-[19px] text-[#050505]" style={{width:'120px'}}>{fmt(s.start_date ? new Date(s.start_date) : from)}</div>
											<div className="text-[16px] leading-[19px] text-[#050505]" style={{width:'120px'}}>{fmt(s.end_date ? new Date(s.end_date) : to)}</div>
											<div style={{width:'103px'}}>
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
										const participantsCount = Array.isArray(base.participants)? base.participants.length : 0;
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
														<button className="w-full bg-[#F16E00] text-white rounded text-[16px] py-2">Voir la liste des participants</button>
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
												<button onClick={()=>{updateStatus(selected._id,'REJECTED'); setSelected(sel=> sel?{...sel, status:'REJECTED', rejection_reason: rejectionReasonDraft }:sel);}} className="flex-1 border border-[#A1A1AA] rounded text-[16px] py-2 text-[#18181B]">Rejeter</button>
												<button onClick={confirmCurrent} className="flex-1 bg-[#F16E00] rounded text-white text-[16px] py-2">Confirmer</button>
											</>
										)}
										{user?.role==='admin' && selected.status==='CONFIRMED' && (
											<>
												<button onClick={()=>{updateStatus(selected._id,'REJECTED'); setSelected(sel=> sel?{...sel, status:'REJECTED', rejection_reason: rejectionReasonDraft }:sel);}} className="flex-1 border border-[#A1A1AA] rounded text-[14px] py-2 text-[#18181B]">Annuler</button>
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

				</div>
			</div>
		</div>
	);
};

export default Sessions;
