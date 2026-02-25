import React, { useEffect, useMemo, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

// Colors based on status
const STATUS_COLORS = {
	PENDING: '#F88826',
	CONFIRMED: '#24965A',
	REJECTED: '#F84545',
	COMPLETED: '#4B4BD3',
};

const dayNames = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0); }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function isSameDay(a,b){return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();}
function inRange(day, from, to){ if(!from||!to) return false; const dd=day.setHours(0,0,0,0); const f=new Date(from).setHours(0,0,0,0); const t=new Date(to).setHours(0,0,0,0); return dd>=f && dd<=t; }

const TrainerAvatar = ({ name }) => (
	<div className="w-8 h-8 rounded-full bg-[#FF7900] flex items-center justify-center text-white text-xs font-semibold select-none">
		{name ? name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() : 'T'}
	</div>
);

const EventTag = ({ text, color }) => (
	<div className="inline-flex items-center px-2 py-1 rounded-[3px] text-white text-[14px] font-medium truncate" style={{background: color, maxWidth:'149.57px'}}>
		<span className="truncate">{text}</span>
	</div>
);

// Week view component
const WeekView = ({ weekDays, filteredSessions, openDayModal }) => {
	// Precompute sessions blocks grouped by trainer columns vertical stacking.
	// For simplicity: we'll render sessions inside each day column; spanning shown by repeating card only on first day with a width spanning columns.
	// Compute spanning style: card width = number of days covered * columnWidth - gap.
	const columnWidth = 173.57; // from design
	const dayStart = (d)=> new Date(d.getFullYear(), d.getMonth(), d.getDate());
	const normalize = (d)=> new Date(d).setHours(0,0,0,0);
	const monday = weekDays[0];
	const sunday = weekDays[6];
	const weekStartTs = normalize(monday);
	const weekEndTs = normalize(sunday);

	// Build events only once
	const events = filteredSessions.map(s => {
		const rawFrom = s.scheduled_at || s.start_date || s.proposed_dates?.[0]?.from;
		const rawTo = s.scheduled_end || s.end_date || s.proposed_dates?.[0]?.to || rawFrom;
		if(!rawFrom) return null;
		const fromTs = normalize(new Date(rawFrom));
		const toTs = normalize(new Date(rawTo));
		if(toTs < weekStartTs || fromTs > weekEndTs) return null; // out of this week
		const clampedFrom = Math.max(fromTs, weekStartTs);
		const clampedTo = Math.min(toTs, weekEndTs);
		const dayIndex = Math.round((clampedFrom - weekStartTs)/86400000);
		const spanDays = Math.round((clampedTo - clampedFrom)/86400000)+1;
		return { s, dayIndex, spanDays };
	}).filter(Boolean);

	// Simple vertical stacking per dayIndex: track next row for each day to avoid overlap across spans.
	const occupied = Array.from({length:7},()=>[]); // list of row indices used segments
	const layout = events.map(ev => {
		let row = 0; let placed=false;
		while(!placed){
			// check all covered days free at this row
			const conflict = Array.from({length:ev.spanDays}).some((_,offs)=> occupied[ev.dayIndex+offs]?.includes(row));
			if(!conflict){
				for(let offs=0; offs<ev.spanDays; offs++){ occupied[ev.dayIndex+offs].push(row); }
				placed=true; break;
			}
			row++;
		}
		return { ...ev, row };
	});
	const rowHeight = 110; // card height + gap approx

	const STATUS_COLORS_LOCAL = {
		PENDING: '#F88826',
		CONFIRMED: '#24965A',
		REJECTED: '#F84545',
		COMPLETED: '#4B4BD3'
	};

	return (
		<div className="flex flex-col h-full" style={{border:'1px solid #E4E4E7', borderLeft:'none', borderRadius:'0 8px 8px 0'}}>
			{/* Header */}
			<div className="flex" style={{height:'48px'}}>
				{weekDays.map((d,i)=> (
					<div key={i} className={`flex flex-col justify-center items-center text-white font-medium text-[16px] bg-[#F16E00] ${i===6? 'rounded-tr-lg':''}`} style={{width: `${100/7}%`, borderLeft:'1px solid #E4E4E7', borderRight: i===6?'1px solid #E4E4E7':'none'}}>
						{d.toLocaleDateString('fr-FR',{ weekday:'long'})}
					</div>
				))}
			</div>
			{/* Body grid */}
			<div className="relative flex flex-1" style={{minHeight:'660px'}}>
				{weekDays.map((d,i)=>(
					<div key={i} className="h-full border-b border-r border-[#E4E4E7] flex flex-col" style={{width:`${100/7}%`, borderLeft: i===0?'1px solid #E4E4E7':'none'}}>
						<div className="px-3 pt-2 pb-1 text-[16px] font-medium text-black">{String(d.getDate()).padStart(2,'0')}</div>
						<div className="flex-1" onClick={()=> openDayModal(d)}></div>
					</div>
				))}
				{/* Event cards positioned absolutely */}
				{layout.map((ev,idx)=> {
					const leftPct = (ev.dayIndex/7)*100;
					const widthPct = (ev.spanDays/7)*100;
					const status = ev.s.status || 'PENDING';
					const color = STATUS_COLORS_LOCAL[status] || STATUS_COLORS_LOCAL.PENDING;
					const university = ev.s.catalogue?.created_by?.university?.name || ev.s.formation?.organization || '—';
					const title = ev.s.formation?.title || ev.s.catalogue?.title || 'Session';
					const fromRaw = ev.s.scheduled_at || ev.s.start_date || ev.s.proposed_dates?.[0]?.from;
					const toRaw = ev.s.scheduled_end || ev.s.end_date || ev.s.proposed_dates?.[0]?.to || fromRaw;
					const dayAbbrev = ['Di','Lu','Ma','Me','Je','Ve','Sa']; // we'll override to French short (custom order) then map by getDay
					const fmtDay = (d)=> { if(!d) return ''; const date=new Date(d); const idx=date.getDay(); const day=dayAbbrev[idx]; const num=String(date.getDate()).padStart(2,'0'); return `${day} ${num}`; };
					const dateRange = `${fmtDay(fromRaw)} - ${fmtDay(toRaw)}`;
					// Participants / attendees (fallback to teacher + first 3 participants placeholders)
					const participantNames = [];
					if(ev.s.participants && Array.isArray(ev.s.participants)){
						for(const p of ev.s.participants){ if(participantNames.length>=4) break; const n = p.name || p.full_name || p.email || p.user?.name; if(n) participantNames.push(n); }
					}
					if(participantNames.length===0 && ev.s.teacher?.name) participantNames.push(ev.s.teacher.name);
					const avatars = participantNames.slice(0,4);
					const statusLabel = status==='PENDING'?'En Attente': status==='CONFIRMED'?'Confirmé': status==='REJECTED'?'Rejeté':'Terminé';
					return (
						<div key={idx}
							className="absolute bg-white border border-[#E4E4E7] rounded-lg px-4 py-3 cursor-pointer hover:shadow-sm transition-shadow"
							style={{top: ev.row*rowHeight + 60, left: `${leftPct}%`, width: `${widthPct}%`, maxWidth:'100%', minHeight:'91px', display:'flex', flexDirection:'column', justifyContent:'space-between'}}
							onClick={()=> openDayModal(dayStart(weekDays[ev.dayIndex]))}
						>
							<div className="flex items-start justify-between mb-1">
								<div className="flex items-center gap-3">
									<h4 className="text-[16px] font-semibold text-[#050505] leading-none">{university}</h4>
									<span className="inline-flex items-center gap-1 px-2 h-6 rounded text-white text-[14px] font-medium" style={{background:color}}>
										<span className="w-2 h-2 rounded-full bg-white"></span>
										{statusLabel}
									</span>
								</div>
								<div className="flex -space-x-2 pl-2">
									{avatars.map((n,i)=>{
										const initials = n.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
										return <div key={i} className="w-7 h-7 rounded-full bg-[#FF7900] border-2 border-white flex items-center justify-center text-white text-[11px] font-semibold shadow">{initials}</div>;
									})}
									{ev.s.participants && ev.s.participants.length > avatars.length && (
										<div className="w-7 h-7 rounded-full bg-[#F1F5F9] border-2 border-white flex items-center justify-center text-[#050505] text-[11px] font-medium shadow">+{ev.s.participants.length - avatars.length}</div>
									)}
								</div>
							</div>
							<div className="flex items-end justify-between gap-4">
								<div className="text-[12px] text-[#050505] leading-snug line-clamp-2 max-w-[65%]">{title}</div>
								<div className="text-[12px] text-[#050505] whitespace-nowrap">{dateRange}</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

const Calender = ({ user, onLogout, onNavigate, activePage }) => {
	const [month, setMonth] = useState(new Date());
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | PENDING | CONFIRMED | COMPLETED | REJECTED
	const [viewMode, setViewMode] = useState('MONTH'); // MONTH | WEEK (future)
	const [weekStart, setWeekStart] = useState(null); // Monday date when in week mode
	const [modalDay, setModalDay] = useState(null); // Date object for modal
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const res = await fetch('/api/sessions');
				const data = await res.json();
				if(res.ok) setSessions(Array.isArray(data)? data: []);
			} finally { setLoading(false); }
		};
		load();
	}, []);

	// Apply status filter
	const filteredSessions = useMemo(()=>{
		if(statusFilter==='ALL') return sessions;
		return sessions.filter(s=> (s.status||'PENDING')===statusFilter);
	},[sessions,statusFilter]);

	// Unique trainers list (from sessions teacher or catalogue.trainers[0])
	const trainers = useMemo(() => {
		const names = new Map();
		filteredSessions.forEach(s => {
			const n = s.teacher?.name || s.catalogue?.trainers?.[0]?.name || 'Formateur';
			if(!names.has(n)) names.set(n, 0);
			names.set(n, names.get(n)+1);
		});
		return Array.from(names.keys()).map(n=>({ name:n })).slice(0, 12);
	}, [filteredSessions]);

	// Build a 6-week grid starting on Monday
	const grid = useMemo(() => {
		const first = startOfMonth(month);
		const mondayIndex = (first.getDay() + 6) % 7; // Mon=0
		const firstCell = addDays(first, -mondayIndex);
		return Array.from({ length: 42 }, (_, i) => addDays(firstCell, i));
	}, [month]);

	const monthLabel = month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

	function getMonday(d){ const t=new Date(d); const day=(t.getDay()+6)%7; t.setDate(t.getDate()-day); t.setHours(0,0,0,0); return t; }
	useEffect(()=>{ if(viewMode==='WEEK' && !weekStart){ setWeekStart(getMonday(month)); } },[viewMode, weekStart, month]);

	const weekDays = useMemo(()=>{
		if(!weekStart) return [];
		return Array.from({length:7},(_,i)=> addDays(weekStart,i));
	},[weekStart]);

	// Move week when in WEEK mode
	const shiftWeek = (dir)=>{ // dir = -1 | 1
		setWeekStart(ws=>{ if(!ws) return ws; const n= addDays(ws, dir*7); // sync month too
			setMonth(m=> new Date(n.getFullYear(), n.getMonth(), 1));
			return n; });
	};

	const weekRangeLabel = useMemo(()=>{
		if(!weekStart) return monthLabel;
		const end = addDays(weekStart,6);
		const fmt = (d)=> d.toLocaleDateString('fr-FR',{ day:'2-digit', month:'short'}).replace('.', '');
		return `${fmt(weekStart)} - ${fmt(end)} ${end.getFullYear()}`;
	},[weekStart, monthLabel]);

	const STATUS_LABELS = {
		PENDING: 'En Attente',
		CONFIRMED: 'Confirmé',
		COMPLETED: 'Terminé',
		REJECTED: 'Rejeté'
	};

	// Helper to get sessions covering a specific day
	const sessionsForDay = (day) => {
		const target = new Date(day.getFullYear(), day.getMonth(), day.getDate());
		return filteredSessions.filter(s => {
			let from = s.scheduled_at || s.start_date || s.proposed_dates?.[0]?.from;
			let to = s.scheduled_end || s.end_date || s.proposed_dates?.[0]?.to;
			if(!from || !to) return false;
			return inRange(new Date(target), from, to);
		}).sort((a,b)=>{
			const af = new Date(a.scheduled_at || a.start_date || a.proposed_dates?.[0]?.from || 0).getTime();
			const bf = new Date(b.scheduled_at || b.start_date || b.proposed_dates?.[0]?.from || 0).getTime();
			return af - bf;
		});
	};

	// Close on ESC
	useEffect(()=>{
		const handler = (e)=>{ if(e.key==='Escape') { setShowModal(false); setModalDay(null);} };
		window.addEventListener('keydown', handler);
		return ()=> window.removeEventListener('keydown', handler);
	},[]);

	// Build events for a day (used in month view cells)
	const eventsByDay = (day) => {
		const dayTs = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
		return filteredSessions.reduce((acc, s)=>{
			const from = s.scheduled_at || s.start_date || s.proposed_dates?.[0]?.from;
			const to = s.scheduled_end || s.end_date || s.proposed_dates?.[0]?.to || from;
			if(!from) return acc;
			const fTs = new Date(from).setHours(0,0,0,0);
			const tTs = new Date(to).setHours(0,0,0,0);
			if(dayTs >= fTs && dayTs <= tTs){
				const status = s.status || 'PENDING';
				const color = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
				const title = s.formation?.title || s.catalogue?.title || 'Session';
				acc.push({ label: title, color });
			}
			return acc;
		}, []);
	};

	const openDayModal = (day)=> { setModalDay(day); setShowModal(true); };
	const closeModal = ()=> { setShowModal(false); setModalDay(null); };

		return (
			<div className="min-h-screen bg-gray-50 flex flex-col relative">
				<AdminNavbar />
				<div className="flex flex-1" style={{ marginTop: '64px' }}>
					<AdminSidebar user={user} onLogout={onLogout} onNavigate={onNavigate} activePage={activePage} />
					<div className="flex-1 flex flex-col p-6 overflow-y-auto" style={{ marginLeft: '288px' }}>
						<div className="w-full" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
							<div className="mx-auto w-full max-w-[1400px]">
			<h2 className="text-xl font-semibold mb-4">{viewMode === 'MONTH' ? monthLabel : weekRangeLabel}</h2>
								<div className="flex items-center justify-between w-full mb-4" style={{height:'36px'}}>
									{/* Status segmented control */}
									<div className="flex items-center">
										<div className="flex items-center gap-4 bg-[#EFEFF0] border border-[#E4E4E7] rounded-[4px] px-2 py-1" style={{height:'36px'}}>
											{[
												{key:'ALL', label:'Tout', width:94},
												{key:'PENDING', label:'En Attente', width:138},
												{key:'CONFIRMED', label:'Confirmé', width:114},
												{key:'COMPLETED', label:'Terminé', width:99},
												{key:'REJECTED', label:'Rejeté', width:119},
											].map(seg=>{
												const active = statusFilter===seg.key;
												return (
													<button
														key={seg.key}
														onClick={()=> setStatusFilter(seg.key)}
														className={`flex justify-center items-center text-[16px] rounded-[4px] transition-colors ${active? 'bg-white shadow text-[#050505]':'text-[#A1A1AA] hover:text-[#050505]'}`}
														style={{height:'28px', width: seg.width}}
													>
														{seg.label}
													</button>
												);
											})}
										</div>
									</div>

									{/* Right section: month nav + view toggle */}
									<div className="flex items-center justify-end gap-6">
										<div className="flex items-center gap-2" style={{height:'26px'}}>
											<button onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="flex items-center justify-center bg-[#EFEFF0] rounded-[2px] w-[26px] h-[26px] text-[#71717A] hover:text-black">◀</button>
											<div className="text-[20px] font-medium leading-none capitalize text-[#18181B]" style={{minWidth:'97px'}}>{monthLabel}</div>
											<button onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="flex items-center justify-center bg[#EFEFF0] rounded-[2px] w-[26px] h-[26px] text-[#71717A] hover:text-black">▶</button>
										</div>
										<div className="flex items-center bg-[#EFEFF0] border border-[#E4E4E7] rounded-[4px] px-2 py-1" style={{height:'36px', width:'194px'}}>
											<button onClick={()=> { setViewMode('MONTH'); }} className={`flex-1 flex items-center justify-center h-[28px] text-[16px] rounded-[4px] ${viewMode==='MONTH'?'bg-white shadow text-[#050505]':'text-[#A1A1AA]'}`}>Mois</button>
											<button onClick={()=> { setViewMode('WEEK'); setWeekStart(getMonday(new Date())); }} className={`flex-1 flex items-center justify-center h-[28px] text-[16px] rounded-[4px] ${viewMode==='WEEK'?'bg-white shadow text-[#050505]':'text-[#A1A1AA]'}`}>Semaine</button>
										</div>
									</div>
								</div>

								<div className="flex w-full" style={{ minHeight: '600px' }}>
									{/* Left column: Trainers */}
									<div className="flex flex-col w-60">
										<div className="flex items-center justify-center h-12 bg-[#F16E00] border-y border-r border-[#E4E4E7] rounded-tl-lg flex-shrink-0">
											<span className="text-white text-[16px] font-medium">Formateurs</span>
										</div>
										<div className="bg-white border border-t-0 border-[#E4E4E7] rounded-bl-lg overflow-y-auto flex-1">
											{loading && <div className="p-4 text-sm text-gray-500">Chargement...</div>}
											{!loading && trainers.length === 0 && (
												<div className="p-4 text-sm text-gray-500">Aucun formateur</div>
											)}
											{!loading && trainers.map((t, idx) => (
												<div key={idx} className="flex items-center gap-2 px-4" style={{ height: '56px', borderTop: idx > 0 ? '1px solid #E4E4E7' : 'none' }}>
													<TrainerAvatar name={t.name} />
													<div className="text-[16px] text-[#050505] truncate">{t.name}</div>
												</div>
											))}
										</div>
									</div>

									{/* Right: Calendar grid */}
									<div className="flex-1 flex flex-col min-w-0">
										{viewMode==='MONTH' && (
											<>
											{/* Header days */}
											<div className="grid grid-cols-7 flex-shrink-0">
												{dayNames.map((n, i) => (
													<div key={n} className={`flex items-center justify-center h-12 bg-[#F16E00] text-white text-[16px] font-medium border-[#E4E4E7] ${i === 6 ? 'rounded-tr-lg border-r' : ''}`} style={{ borderLeft: '1px solid #E4E4E7', borderTop: '1px solid #E4E4E7', borderBottom: '1px solid #E4E4E7' }}>
														{n}
													</div>
												))}
											</div>
											{/* 6 weeks */}
											<div className="grid grid-rows-6 flex-1">
												{Array.from({ length: 6 }).map((_, row) => (
													<div key={row} className="grid grid-cols-7">
														{Array.from({ length: 7 }).map((__, col) => {
															const idx = row * 7 + col;
															const day = grid[idx];
															const inThisMonth = day.getMonth() === month.getMonth();
															const outStyle = inThisMonth ? '#FFFFFF' : '#EFEFF0';
															const textColor = inThisMonth ? '#000000' : '#71717A';
															const evts = eventsByDay(day).slice(0, 3); // cap 3 chips per cell
															return (
															<div
																key={col}
																className="flex flex-col gap-1 border border-[#E4E4E7] p-2 cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden"
																style={{ minHeight: '110px', background: outStyle }}
																onClick={()=> openDayModal(day)}
															>
																<div className="text-[16px] font-medium flex-shrink-0" style={{ color: textColor }}>{String(day.getDate()).padStart(2, '0')}</div>
																<div className="flex flex-col gap-1 overflow-hidden min-h-0">
																	{evts.map((e, i) => <EventTag key={i} text={e.label} color={e.color} />)}
																</div>
															</div>
														);
													})}
												</div>
											))}
											</div>
										</>
										)}
										{viewMode==='WEEK' && weekDays.length===7 && (
											<WeekView
												weekDays={weekDays}
												filteredSessions={filteredSessions}
												openDayModal={openDayModal}
											/>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Modal overlay */}
				{showModal && modalDay && (
					<div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" style={{background:'rgba(0,0,0,0.4)'}} onClick={closeModal}>
						<div className="bg-[#FAF9F7] rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto relative" onClick={e=> e.stopPropagation()}>
							<div className="flex items-start justify-between px-8 pt-8 pb-4">
								<h2 className="text-[24px] font-semibold text-[#050505]">Détails des sessions</h2>
								<button onClick={closeModal} className="text-gray-500 hover:text-black text-2xl leading-none" aria-label="Fermer">×</button>
							</div>
							<div className="px-8 pb-8 space-y-6">
								{(() => { const list = sessionsForDay(modalDay); if(list.length===0) return <div className="text-sm text-gray-600">Aucune session pour ce jour.</div>; return list.map(s => {
									const status = s.status || 'PENDING';
									const color = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
									const badgeLabel = STATUS_LABELS[status] || status;
									const university = s.catalogue?.created_by?.university?.name || s.formation?.organization || '—';
									const trainer = s.teacher?.name || s.catalogue?.trainers?.[0]?.name || '—';
									const fromRaw = s.scheduled_at || s.start_date || s.proposed_dates?.[0]?.from;
									const toRaw = s.scheduled_end || s.end_date || s.proposed_dates?.[0]?.to;
									const fmt = (d)=> { if(!d) return '—'; const date = new Date(d); const str = date.toLocaleDateString('fr-FR',{ weekday:'long', day:'2-digit', month:'long'}); return str.charAt(0).toUpperCase()+str.slice(1); };
									return (
										<div key={s._id} className="bg-white border border-[#E4E4E7] rounded-lg p-6 relative">
											<div className="flex justify-between items-start mb-4">
												<h3 className="text-[16px] font-semibold leading-snug text-[#050505] max-w-[560px]">{s.formation?.title || s.catalogue?.title || 'Session'}</h3>
												<button className="text-gray-500 hover:text-orange-600" title="Ouvrir" onClick={()=> { /* future: open drawer */ }}>
													<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M5 5v16h16"/></svg>
												</button>
											</div>
											<div className="grid grid-cols-[100px_1fr] gap-y-2 text-[14px]">
												<span className="text-[#71717A]">Status:</span>
												<span>
													<span className="inline-flex items-center px-2 py-1 rounded text-white text-[14px]" style={{background:color}}>{badgeLabel}</span>
												</span>
												<span className="text-[#71717A]">Université:</span>
												<span className="text-[#050505]">{university}</span>
												<span className="text-[#71717A]">Formateur:</span>
												<span className="text-[#050505]">{trainer}</span>
												<span className="text-[#71717A]">Date:</span>
												<span className="text-[#050505]">{fmt(fromRaw)} - {fmt(toRaw)}</span>
											</div>
										</div>
									);
								}); })()}
							</div>
						</div>
					</div>
				)}
			</div>
			);
};

export default Calender;

