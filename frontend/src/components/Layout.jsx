import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Database, GitBranch, Shield, Building2, LogOut, Menu, Link2, FileText, Users, Bell, BarChart2, ChevronRight } from 'lucide-react';

const NAV = [
  { section:'Overview', items:[{ to:'/dashboard', icon:LayoutDashboard, label:'Dashboard' },{ to:'/analytics', icon:BarChart2, label:'Analytics' }]},
  { section:'Data Management', items:[{ to:'/departments', icon:Building2, label:'Departments' },{ to:'/datasources', icon:Database, label:'Data Sources' }]},
  { section:'Integration', items:[{ to:'/pipelines', icon:GitBranch, label:'Pipelines' },{ to:'/integrations', icon:Link2, label:'Integrations' }]},
  { section:'Governance', items:[{ to:'/blockchain', icon:Shield, label:'Audit Chain' },{ to:'/policies', icon:FileText, label:'Policies' }]},
  { section:'Admin', items:[{ to:'/users', icon:Users, label:'Users' }]},
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = NAV.flatMap(g => g.items).find(i => i.to === location.pathname);
  return (
    <div className="layout">
      <div className={`sidebar ${open ? '' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon"><Shield size={16} color="white" /></div>
          <div><div className="sidebar-logo-text">IntelliDataOps</div><div className="sidebar-logo-sub">Gov Interoperability</div></div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(g => (
            <div key={g.section} className="nav-section">
              <div className="nav-label">{g.section}</div>
              {g.items.map(item => (
                <Link key={item.to} to={item.to} className={`nav-item ${location.pathname===item.to?'active':''}`}>
                  <item.icon size={15} />{item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-row">
            <div className="avatar">{user?.name?.[0]||'A'}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="user-name" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="btn-icon" onClick={() => { logout(); navigate('/login'); }}><LogOut size={13} /></button>
          </div>
        </div>
      </div>
      <div className={`main ${open?'':'full'}`}>
        <div className="topbar">
          <button className="btn-icon" onClick={() => setOpen(s => !s)}><Menu size={15} /></button>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:12, color:'var(--text3)' }}>IntelliDataOps</span>
            <ChevronRight size={12} color="var(--text3)" />
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{currentPage?.label||'Dashboard'}</span>
          </div>
          <div className="info-chip"><span className="status-dot" />System Operational</div>
          <button className="btn-icon"><Bell size={14} /></button>
          <div className="avatar" style={{ width:26, height:26, fontSize:10 }}>{user?.name?.[0]}</div>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}