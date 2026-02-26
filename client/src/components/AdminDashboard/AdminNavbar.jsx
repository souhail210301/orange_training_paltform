import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../../utils/api';

const AdminNavbar = ({ onViewAllNotifications, onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const panelRef = useRef(null);
  useEffect(()=>{ const id = setInterval(()=>setNow(Date.now()),60000); return ()=>clearInterval(id); },[]);
  const rel = (d) => {
    if(!d) return ''; const diff = Math.floor((now - new Date(d).getTime())/1000);
    if(diff<5) return "À l'instant"; if(diff<60) return `Il y a ${diff} s`; const m=Math.floor(diff/60); if(m<60) return `Il y a ${m} min`; const h=Math.floor(m/60); if(h<24) return `Il y a ${h} h`; const day=Math.floor(h/24); if(day<7) return `Il y a ${day} j`; const w=Math.floor(day/7); if(w<4) return `Il y a ${w} sem`; return new Date(d).toLocaleDateString();
  };
  const fetchNotifs = async () => {
    try { setLoading(true); const res = await apiFetch('/notifications'); if(res.ok){ const data= await res.json(); setList(data.slice(0,10)); }} finally { setLoading(false);} };
  // Fetch full list when opening panel
  useEffect(()=>{ if(open) fetchNotifs(); },[open]);
  // Initial fetch to drive unread dot
  useEffect(()=>{ fetchNotifs(); },[]);
  // Poll every 30s when panel closed to update unread indicator
  useEffect(()=>{
    const id = setInterval(()=>{ if(!open) fetchNotifs(); },30000);
    return ()=> clearInterval(id);
  },[open]);
  const profileRef = useRef(null);
  useEffect(()=>{
    const handler = (e) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
      if (profileOpen && profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, profileOpen]);
  return (
  <nav className="w-full bg-white flex items-center justify-between px-4 md:px-8 py-3 shadow-sm fixed top-0 left-0 z-40" style={{height:'64px'}}>
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-3">
        {/* Hamburger (mobile) */}
        <button
          type="button"
          aria-label="Ouvrir le menu"
          className="lg:hidden p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
          onClick={() => onToggleSidebar && onToggleSidebar()}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <img src="/certif_logo.png" alt="Certif Logo" className="h-10 w-auto" />
      </div>
      {/* Search bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-lg">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
          </span>
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>
    {/* Notification and profile */}
  <div className="flex items-center gap-3 md:gap-4">
        {/* Notification bell */}
        <div className="relative" ref={panelRef}>
          <button onClick={()=>setOpen(o=>!o)} className="bg-white rounded-full p-2 shadow hover:bg-gray-100 relative">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          {list.some(n=>!n.read) && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
          {open && (
            <div className="absolute right-0 mt-3 w-96 bg-white border rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Notifications</span>
                  {list.filter(n=>!n.read).length>0 && <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">{list.filter(n=>!n.read).length}</span>}
                </div>
                <button onClick={() => { if(onViewAllNotifications) onViewAllNotifications(); setOpen(false); }} className="text-xs text-orange-600 hover:underline">Voir Tout</button>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y">
                {loading && <div className="p-4 text-sm text-gray-500">Chargement...</div>}
                {!loading && list.length===0 && <div className="p-4 text-sm text-gray-500">Aucune notification.</div>}
                {list.map(n => {
                  const title = n.title;
                  const body = n.body;
                  const isInvite = n.type === 'MENTOR_INVITE' && (!n.inviteStatus || n.inviteStatus === 'PENDING');
                  return (
                    <div key={n._id} className="flex flex-col gap-2 p-3 hover:bg-gray-50 text-sm cursor-pointer" onClick={async (e)=>{ // only mark read when clicking background, not buttons
                      if ((e.target.tagName === 'BUTTON')) return;
                      if(!n.read){ setList(prev=>prev.map(x=>x._id===n._id?{...x,read:true}:x)); apiFetch(`/notifications/${n._id}/read`,{method:'PATCH'});} }}>
                      <div className="flex gap-3">
                        <div className="flex-none w-12 h-12 bg-orange-500 rounded flex items-center justify-center">
                          <img src="/logo_orange_certif.png" alt="Logo" className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold leading-snug">{title}</div>
                          {body && <div className="text-gray-600 text-xs leading-snug mt-0.5">{body}</div>}
                          <div className="text-[10px] text-gray-400 mt-1">{rel(n.createdAt)}</div>
                        </div>
                        <div className="pt-1">
                          <span className={`w-2 h-2 block rounded-full ${n.read?'bg-gray-300':'bg-orange-500'}`}></span>
                        </div>
                      </div>
                      {isInvite && (
                        <div className="flex gap-2 pl-15 pr-2">
                          <button
                            className="px-2 py-1 bg-orange-500 text-white text-xs rounded"
                            onClick={async ()=>{
                              const res = await apiFetch(`/notifications/${n._id}/respond-invite`, { method:'POST', body: JSON.stringify({ decision:'ACCEPTED' }) });
                              if(res.ok){ setList(prev=>prev.map(x=>x._id===n._id?{...x, inviteStatus:'ACCEPTED', type:'MENTOR_INVITE_RESPONSE', title:'Invitation acceptée', body:'Vous avez accepté cette invitation.'}:x)); }
                            }}
                          >Accepter</button>
                          <button
                            className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded"
                            onClick={async ()=>{
                              const res = await apiFetch(`/notifications/${n._id}/respond-invite`, { method:'POST', body: JSON.stringify({ decision:'DECLINED' }) });
                              if(res.ok){ setList(prev=>prev.map(x=>x._id===n._id?{...x, inviteStatus:'DECLINED', type:'MENTOR_INVITE_RESPONSE', title:'Invitation refusée', body:'Vous avez refusé cette invitation.'}:x)); }
                            }}
                          >Refuser</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="bg-orange-500 rounded-full p-2 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
          >
            <img src="/avatar.png" alt="Profile" className="h-7 w-7 object-contain" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="py-1 text-sm">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-orange-500 hover:text-white flex items-center gap-2"
                  onClick={() => {
                    // Close first to avoid state churn during route changes
                    setProfileOpen(false);
                    const dest = '/admin/profile';
                    const current = `${location.pathname}${location.search}`;
                    if (current !== dest) navigate(dest);
                  }}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5z"/></svg>
                  </span>
                  Profil
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-orange-500 hover:text-white flex items-center gap-2"
                  onClick={() => {
                    setProfileOpen(false);
                    const dest = '/admin/profile?tab=password';
                    const current = `${location.pathname}${location.search}`;
                    if (current !== dest) navigate(dest);
                  }}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5">
                    <img src="/lock_icon.png" alt="lock" className="w-4 h-4" />
                  </span>
                  Mot de Passe
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-orange-500 hover:text-white flex items-center gap-2"
                  onClick={() => {
                    // Delegate to parent handler if provided for consistency
                    setProfileOpen(false);
                    if (typeof onViewAllNotifications === 'function') {
                      onViewAllNotifications();
                    } else {
                      const dest = '/admin/profile?tab=notifications';
                      const current = `${location.pathname}${location.search}`;
                      if (current !== dest) navigate(dest);
                    }
                  }}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5">
                    <img src="/notif_icon.png" alt="notifications" className="w-4 h-4" />
                  </span>
                  Notifications
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-orange-500 hover:text-white flex items-center gap-2"
                  onClick={() => {
                    setProfileOpen(false);
                    const dest = '/admin/profile?tab=settings';
                    const current = `${location.pathname}${location.search}`;
                    if (current !== dest) navigate(dest);
                  }}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5">
                    <img src="/settings_icon.png" alt="settings" className="w-4 h-4" />
                  </span>
                  Paramètres
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
