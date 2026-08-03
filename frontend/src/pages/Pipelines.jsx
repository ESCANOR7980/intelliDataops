import { useState, useEffect } from 'react';
import { GitBranch, Plus, Play, Pause, Zap, Trash2, ArrowRight, Shield } from 'lucide-react';
import API, { fmt } from '../api';
import { useToast } from '../context/ToastContext';
import { statusBadge, Spinner, Empty } from '../components/UI';

export default function Pipelines() {
  const [pipelines, setPipelines] = useState([]);
  const [depts, setDepts] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', sourceDepartment:'', targetDepartment:'', dataSource:'', complianceLevel:'standard' });
  const toast = useToast();
  const load = () => { setLoading(true); Promise.all([API.get('/pipelines'),API.get('/departments'),API.get('/datasources')]).then(([p,d,s])=>{ setPipelines(p.data.pipelines); setDepts(d.data.departments); setSources(s.data.dataSources); }).finally(()=>setLoading(false)); };
  useEffect(load, []);
  const execute = async id => {
    setExecuting(id);
    try { const r = await API.post(`/pipelines/${id}/execute`); toast(r.data.message,r.data.success?'success':'error'); if(r.data.success) toast(`${fmt(r.data.recordsProcessed)} records processed`); load(); }
    catch { toast('Execution failed','error'); } finally { setExecuting(null); }
  };
  const toggle = async p => { await API.put(`/pipelines/${p._id}`,{status:p.status==='active'?'paused':'active'}); toast(`Pipeline ${p.status==='active'?'paused':'activated'}`); load(); };
  const save = async () => { try { await API.post('/pipelines',form); toast('Pipeline created'); setShowModal(false); load(); } catch(e){ toast(e.response?.data?.message||'Error','error'); } };
  const del = async id => { if(!confirm('Delete?')) return; await API.delete(`/pipelines/${id}`); toast('Deleted'); load(); };
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Data Pipelines</div><div className="page-sub">Cross-department data integration flows</div></div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={13}/>New Pipeline</button>
      </div>
      {loading ? <Spinner /> : pipelines.length===0 ? <Empty icon={GitBranch} text="No pipelines yet"/> : (
        <div className="grid-2">
          {pipelines.map(p=>(
            <div key={p._id} className="pipeline-card">
              <div className="flex-between" style={{ marginBottom:8 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>{p.name}</div>
                {statusBadge(p.status)}
              </div>
              {p.description && <div style={{ fontSize:12, color:'var(--text3)', marginBottom:10 }}>{p.description}</div>}
              <div className="pipeline-flow">
                <div className="dept-chip">{p.sourceDepartment?.icon} {p.sourceDepartment?.name||'Unknown'}</div>
                <ArrowRight size={13} color="var(--text3)"/>
                <div className="dept-chip">{p.targetDepartment?.icon} {p.targetDepartment?.name||'Unknown'}</div>
              </div>
              {p.transformations?.length>0 && <div className="flex-gap" style={{ flexWrap:'wrap', marginBottom:10 }}>{p.transformations.map((t,i)=><span key={i} className="transform-tag">{t.type}</span>)}</div>}
              <div className="grid-2" style={{ gap:8, marginBottom:12 }}>
                <div className="card-sm"><div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, textTransform:'uppercase' }}>Total Runs</div><div style={{ fontFamily:'var(--mono)', fontWeight:700, marginTop:3 }}>{p.stats?.totalRuns||0}</div></div>
                <div className="card-sm"><div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, textTransform:'uppercase' }}>Records</div><div style={{ fontFamily:'var(--mono)', fontWeight:700, marginTop:3 }}>{fmt(p.stats?.totalRecordsProcessed)}</div></div>
              </div>
              <div className="flex-between">
                <div className="flex-gap">
                  <span className={`badge badge-${p.complianceLevel==='strict'?'red':p.complianceLevel==='standard'?'amber':'gray'}`}>{p.complianceLevel}</span>
                  {p.blockchainHash && <span className="badge badge-green"><Shield size={9}/>Verified</span>}
                </div>
                <div className="flex-gap">
                  <button className="btn btn-secondary btn-sm" onClick={()=>toggle(p)}>{p.status==='active'?<><Pause size={11}/>Pause</>:<><Play size={11}/>Resume</>}</button>
                  <button className="btn btn-success btn-sm" onClick={()=>execute(p._id)} disabled={executing===p._id}>{executing===p._id?<span className="spinner" style={{width:12,height:12}}/>:<Zap size={11}/>}Run</button>
                  <button className="btn-icon" onClick={()=>del(p._id)}><Trash2 size={12}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title"><GitBranch size={16} color="var(--accent)"/>Create Pipeline</div><button className="btn-icon" onClick={()=>setShowModal(false)}>✕</button></div>
            <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Health ↔ Finance Cross-Check"/></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" style={{ minHeight:56 }} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Source Department</label><select className="form-select" value={form.sourceDepartment} onChange={e=>setForm(f=>({...f,sourceDepartment:e.target.value}))}><option value="">Select</option>{depts.map(d=><option key={d._id} value={d._id}>{d.icon} {d.name}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Target Department</label><select className="form-select" value={form.targetDepartment} onChange={e=>setForm(f=>({...f,targetDepartment:e.target.value}))}><option value="">Select</option>{depts.map(d=><option key={d._id} value={d._id}>{d.icon} {d.name}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Data Source</label><select className="form-select" value={form.dataSource} onChange={e=>setForm(f=>({...f,dataSource:e.target.value}))}><option value="">Select</option>{sources.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Compliance</label><select className="form-select" value={form.complianceLevel} onChange={e=>setForm(f=>({...f,complianceLevel:e.target.value}))}>{['basic','standard','strict'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <div className="flex-gap" style={{ justifyContent:'flex-end' }}><button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}