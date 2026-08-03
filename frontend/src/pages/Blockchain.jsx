import { useState, useEffect } from 'react';
import { Shield, CheckCircle2, AlertCircle, Hash } from 'lucide-react';
import API, { fmt, fmtDate, fmtTime } from '../api';
import { useToast } from '../context/ToastContext';
import { StatCard, Spinner } from '../components/UI';

export default function Blockchain() {
  const [blocks, setBlocks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const toast = useToast();
  useEffect(() => {
    Promise.all([API.get('/blockchain?limit=15'),API.get('/blockchain/stats')]).then(([b,s])=>{ setBlocks(b.data.blocks); setStats(s.data.stats); }).finally(()=>setLoading(false));
  }, []);
  const verify = async () => {
    setVerifying(true);
    try { const r = await API.get('/blockchain/verify'); setVerifyResult(r.data); toast(r.data.isValid?'Chain integrity verified ✓':'Issues found!',r.data.isValid?'success':'error'); }
    catch { toast('Error','error'); } finally { setVerifying(false); }
  };
  const typeColor = t => ({ pipeline_run:'badge-blue', policy_update:'badge-purple', access_grant:'badge-amber', audit_log:'badge-gray', schema_change:'badge-green' }[t]||'badge-gray');
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Blockchain Audit Chain</div><div className="page-sub">Immutable, tamper-proof audit trail for all data operations</div></div>
        <button className="btn btn-secondary" onClick={verify} disabled={verifying}>{verifying?<><span className="spinner" style={{width:13,height:13}}/>Verifying...</>:<><Shield size={13}/>Verify Chain</>}</button>
      </div>
      {stats && (
        <div className="grid-4 mb-20">
          <StatCard label="Total Blocks" value={stats.totalBlocks} color="var(--accent)" bgColor="var(--accent-light)" icon={Hash}/>
          <StatCard label="Latest Block" value={`#${stats.latestBlock}`} color="var(--green)" bgColor="var(--green-light)" icon={Shield}/>
          <StatCard label="Records Secured" value={fmt(stats.totalRecordsSecured)} color="var(--purple)" bgColor="var(--purple-light)" icon={Shield}/>
          <StatCard label="Chain Status" value={verifyResult?(verifyResult.isValid?'✓ Valid':'✗ Issues'):'— Unknown'} color={verifyResult?.isValid?'var(--green)':'var(--text3)'} bgColor={verifyResult?.isValid?'var(--green-light)':'var(--card2)'} icon={CheckCircle2}/>
        </div>
      )}
      {loading ? <Spinner /> : (
        <div className="card">
          <div className="section-title"><Hash size={13}/>Block History</div>
          <div className="grid-flow">
            {blocks.map((b,i)=>(
              <div key={b._id}>
                {i>0 && <div className="block-connector"/>}
                <div className="block-item">
                  <div className="block-num">#{b.blockNumber}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="flex-between" style={{ flexWrap:'wrap', gap:6, marginBottom:4 }}>
                      <div className="flex-gap"><span className={`badge ${typeColor(b.data?.type)}`}>{b.data?.type?.replace(/_/g,' ')}</span>{b.data?.recordCount>0&&<span className="text-sm">{fmt(b.data.recordCount)} records</span>}</div>
                      <span className="text-sm">{fmtDate(b.timestamp)} {fmtTime(b.timestamp)}</span>
                    </div>
                    <div className="block-hash"><span style={{ color:'var(--text2)',fontWeight:600 }}>Hash: </span>{b.hash?.substring(0,52)}...</div>
                    <div className="block-hash" style={{ marginTop:2 }}><span style={{ color:'var(--text2)',fontWeight:600 }}>Prev: </span>{b.previousHash?.substring(0,52)}...</div>
                    {(b.data?.sourceDept||b.data?.targetDept)&&<div className="text-sm" style={{ marginTop:4 }}>{b.data.sourceDept} → {b.data.targetDept}{b.validator?.name&&` · ${b.validator.name}`}</div>}
                  </div>
                  <div style={{ color:b.isValid?'var(--green)':'var(--red)', flexShrink:0 }}>{b.isValid?<CheckCircle2 size={15}/>:<AlertCircle size={15}/>}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}