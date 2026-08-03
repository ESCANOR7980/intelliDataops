import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import API, { fmtDate } from '../api';
import { useToast } from '../context/ToastContext';
import { statusBadge } from '../components/UI';

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', category:'privacy', compliance:'', severity:'medium', status:'draft' });
  const toast = useToast();
  const load = () => API.get('/policies').then(r=>setPolicies(r.data.policies));
  useEffect(()=>{ load(); },[]);
  const save = async () => { await API.post('/policies',form); toast('Policy created'); setShowModal(false); load(); };
  const del = async id => { if(!confirm('Delete?')) return; await API.delete(`/policies/${id}`); toast('Deleted'); load(); };
  const toggle = async p => { await API.put(`/policies/${p.id}`,{...p,status:p.status==='active'?'draft':'active'}); load(); };
  const sevColor = s => ({ critical:'badge-red', high:'badge-amber', medium:'badge-blue', low:'badge-gray' }[s]||'badge-gray');
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Data Governance Policies</div><div className="page-sub">Privacy, access, and compliance policy management</div></div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={13}/>New Policy</button>
      </div>
      <div className="grid-flow">
        {policies.map(p=>(
          <div key={p.id} className="card">
            <div className="flex-between">
              <div><div style={{ fontWeight:700, marginBottom:4 }}>{p.name}</div><div className="text-sm">{p.description}</div></div>
              <div className="flex-gap">
                <span className={`badge ${sevColor(p.severity)}`}>{p.severity}</span>
                {statusBadge(p.status)}
                <button className="btn btn-secondary btn-sm" onClick={()=>toggle(p)}>{p.status==='active'?'Deactivate':'Activate'}</button>
                <button className="btn-icon" onClick={()=>del(p.id)}><Trash2 size={12}/></button>
              </div>
            </div>
            <div className="flex-gap mt-16">
              <span className="badge badge-blue">{p.category}</span>
              {p.compliance&&<span className="badge badge-gray">{p.compliance}</span>}
              <span className="text-sm">{fmtDate(p.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title"><FileText size={16} color="var(--accent)"/>Create Policy</div><button className="btn-icon" onClick={()=>setShowModal(false)}>✕</button></div>
            <div className="form-group"><label className="form-label">Policy Name</label><input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Data Minimization Policy"/></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{['privacy','access','compliance','governance','security'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Severity</label><select className="form-select" value={form.severity} onChange={e=>setForm(f=>({...f,severity:e.target.value}))}>{['critical','high','medium','low'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            </div>
            <div className="form-group"><label className="form-label">Compliance Standard</label><input className="form-input" value={form.compliance} onChange={e=>setForm(f=>({...f,compliance:e.target.value}))} placeholder="GDPR, PDPB, RTI Act..."/></div>
            <div className="flex-gap" style={{ justifyContent:'flex-end' }}><button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}