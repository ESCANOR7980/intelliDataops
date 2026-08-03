import { useState, useEffect } from 'react';
import { Building2, Plus, Search } from 'lucide-react';
import API, { fmt, fmtDate } from '../api';
import { useToast } from '../context/ToastContext';
import { statusBadge, ScoreBar, Spinner, Empty } from '../components/UI';

export default function Departments() {
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name:'', code:'', ministry:'', category:'other', description:'', dataClassification:'internal', color:'#1a56db', icon:'🏛️' });
  const toast = useToast();
  const load = () => { setLoading(true); API.get('/departments').then(r => setDepts(r.data.departments)).finally(() => setLoading(false)); };
  useEffect(load, []);
  const save = async () => {
    try { await API.post('/departments', form); toast('Department created'); setShowModal(false); setForm({ name:'', code:'', ministry:'', category:'other', description:'', dataClassification:'internal', color:'#1a56db', icon:'🏛️' }); load(); }
    catch (e) { toast(e.response?.data?.message||'Error','error'); }
  };
  const filtered = depts.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Departments</div><div className="page-sub">{depts.length} government departments registered</div></div>
        <div className="flex-gap">
          <div className="search-wrap"><Search className="search-icon" size={13} /><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={13} />Add Department</button>
        </div>
      </div>
      {loading ? <Spinner /> : filtered.length === 0 ? <Empty icon={Building2} text="No departments found" /> : (
        <div className="grid-3">
          {filtered.map(d => (
            <div key={d._id} className="dept-card">
              <div className="flex-between" style={{ marginBottom:12 }}>
                <span style={{ fontSize:26 }}>{d.icon}</span>
                {statusBadge(d.isActive ? 'active' : 'inactive')}
              </div>
              <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:2 }}>{d.name}</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:10 }}>{d.ministry} · <span style={{ fontFamily:'var(--mono)', fontWeight:600 }}>{d.code}</span></div>
              <div className="flex-gap" style={{ flexWrap:'wrap', marginBottom:12 }}>
                <span className="badge badge-blue">{d.category}</span>
                <span className="badge badge-purple">{d.dataClassification}</span>
              </div>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Interoperability Score</div>
              <ScoreBar score={d.interopScore} />
              <div className="divider" />
              <div className="flex-between">
                <span className="text-sm">{fmt(d.totalRecords)} records</span>
                <span className="text-sm">{d.lastSync ? fmtDate(d.lastSync) : 'Not synced'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title"><Building2 size={16} color="var(--accent)" />Add Department</div><button className="btn-icon" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Ministry of Health" /></div>
              <div className="form-group"><label className="form-label">Code</label><input className="form-input" value={form.code} onChange={e => setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="MOH" /></div>
            </div>
            <div className="form-group"><label className="form-label">Ministry</label><input className="form-input" value={form.ministry} onChange={e => setForm(f=>({...f,ministry:e.target.value}))} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                  {['health','finance','education','transport','agriculture','social','security','environment','other'].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Classification</label>
                <select className="form-select" value={form.dataClassification} onChange={e => setForm(f=>({...f,dataClassification:e.target.value}))}>
                  {['public','internal','confidential','restricted'].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Icon</label><input className="form-input" value={form.icon} onChange={e => setForm(f=>({...f,icon:e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">Color</label><input type="color" className="form-input" style={{ height:38,padding:3 }} value={form.color} onChange={e => setForm(f=>({...f,color:e.target.value}))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} /></div>
            <div className="flex-gap" style={{ justifyContent:'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}