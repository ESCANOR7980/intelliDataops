import { useState, useEffect } from 'react';
import { Database, Plus, Zap, Trash2 } from 'lucide-react';
import API, { fmt, fmtDate } from '../api';
import { useToast } from '../context/ToastContext';
import { statusBadge, ScoreBar, Spinner } from '../components/UI';

const typeIcon = t => ({ REST_API:'🔌', GraphQL:'⚡', Database:'🗄️', CSV:'📊', JSON:'{}', XML:'📄', SOAP:'📝' }[t]||'📡');

export default function DataSources() {
  const [sources, setSources] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [testing, setTesting] = useState(null);
  const [form, setForm] = useState({ name:'', department:'', type:'REST_API', description:'', dataClassification:'internal', connectionConfig:{ url:'', method:'GET', authType:'none' }, tags:'' });
  const toast = useToast();
  const load = () => { setLoading(true); Promise.all([API.get('/datasources'),API.get('/departments')]).then(([s,d])=>{ setSources(s.data.dataSources); setDepts(d.data.departments); }).finally(()=>setLoading(false)); };
  useEffect(load, []);
  const save = async () => {
    try { await API.post('/datasources',{...form,tags:form.tags.split(',').map(t=>t.trim()).filter(Boolean)}); toast('Data source created'); setShowModal(false); load(); }
    catch(e){ toast(e.response?.data?.message||'Error','error'); }
  };
  const testConn = async id => {
    setTesting(id);
    try { const r = await API.post(`/datasources/${id}/test`); toast(r.data.message,r.data.success?'success':'error'); load(); }
    catch { toast('Test failed','error'); } finally { setTesting(null); }
  };
  const del = async id => { if(!confirm('Delete?')) return; await API.delete(`/datasources/${id}`); toast('Deleted'); load(); };
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Data Sources</div><div className="page-sub">{sources.length} sources connected</div></div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={13}/>Add Source</button>
      </div>
      {loading ? <Spinner /> : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Department</th><th>Type</th><th>Status</th><th>Quality</th><th>Records</th><th>Last Fetched</th><th>Actions</th></tr></thead>
              <tbody>
                {sources.length===0 ? <tr><td colSpan={8} style={{ textAlign:'center',padding:40,color:'var(--text3)' }}>No data sources yet</td></tr>
                : sources.map(s=>(
                  <tr key={s._id}>
                    <td><strong>{typeIcon(s.type)} {s.name}</strong><div className="text-sm">{s.description}</div></td>
                    <td><span className="dept-chip">{s.department?.name||'—'}</span></td>
                    <td><span className="badge badge-blue">{s.type}</span></td>
                    <td>{statusBadge(s.status)}</td>
                    <td style={{ minWidth:110 }}><ScoreBar score={s.qualityScore} /></td>
                    <td><span className="text-mono">{fmt(s.recordCount)}</span></td>
                    <td>{fmtDate(s.lastFetched)}</td>
                    <td><div className="flex-gap">
                      <button className="btn btn-secondary btn-sm" onClick={()=>testConn(s._id)} disabled={testing===s._id}>{testing===s._id?<span className="spinner" style={{width:12,height:12}}/>:<Zap size={11}/>}Test</button>
                      <button className="btn-icon" onClick={()=>del(s._id)}><Trash2 size={12}/></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title"><Database size={16} color="var(--accent)"/>Add Data Source</div><button className="btn-icon" onClick={()=>setShowModal(false)}>✕</button></div>
            <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="National Health Registry API"/></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Department</label>
                <select className="form-select" value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))}>
                  <option value="">Select department</option>{depts.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  {['REST_API','GraphQL','Database','CSV','JSON','XML','SOAP'].map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">URL</label><input className="form-input" value={form.connectionConfig.url} onChange={e=>setForm(f=>({...f,connectionConfig:{...f.connectionConfig,url:e.target.value}}))} placeholder="https://api.gov.in/endpoint"/></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Auth Type</label>
                <select className="form-select" value={form.connectionConfig.authType} onChange={e=>setForm(f=>({...f,connectionConfig:{...f.connectionConfig,authType:e.target.value}}))}>
                  {['none','apikey','bearer','basic','oauth2'].map(a=><option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Classification</label>
                <select className="form-select" value={form.dataClassification} onChange={e=>setForm(f=>({...f,dataClassification:e.target.value}))}>
                  {['public','internal','confidential','restricted'].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-input" value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="health, patients"/></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <div className="flex-gap" style={{ justifyContent:'flex-end' }}>
              <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}