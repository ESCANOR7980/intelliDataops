import { useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Globe, ArrowRight } from 'lucide-react';
import API, { fmt } from '../api';
import { useToast } from '../context/ToastContext';
import { ScoreBar, Spinner, statusBadge, COLORS } from '../components/UI';

export default function Analytics() {
  const [interop, setInterop] = useState(null);
  const [dataFlow, setDataFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  useEffect(() => {
    Promise.all([API.get('/analytics/interop-score'),API.get('/analytics/data-flow')]).then(([i,d])=>{ setInterop(i.data); setDataFlow(d.data); }).catch(()=>toast('Failed to load','error')).finally(()=>setLoading(false));
  }, []);
  if (loading) return <Spinner />;
  const barData = interop?.departments?.map(d=>({ name:d.code, score:d.interopScore }))||[];
  return (
    <div>
      <div className="page-header"><div><div className="page-title">Analytics & Intelligence</div><div className="page-sub">Data-driven insights for evidence-based policy making</div></div></div>
      <div className="grid-2 mb-20">
        <div className="card">
          <div className="flex-between mb-16">
            <div className="section-title" style={{ marginBottom:0 }}><TrendingUp size={13}/>Interoperability Scores</div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ fontSize:11, color:'var(--text3)' }}>Avg:</span><span style={{ fontFamily:'var(--mono)', fontWeight:700, color:'var(--green)', fontSize:16 }}>{interop?.averageScore||0}</span><span style={{ fontSize:11, color:'var(--text3)' }}>/100</span></div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {interop?.departments?.map(d=>(
              <div key={d._id}>
                <div className="flex-between" style={{ marginBottom:5 }}><span style={{ fontSize:13, fontWeight:600 }}>{d.name}</span><span className="badge badge-blue">{d.category}</span></div>
                <ScoreBar score={d.interopScore}/>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="section-title"><TrendingUp size={13}/>Score Distribution</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top:5, right:5, left:-20, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="name" tick={{ fill:'var(--text3)', fontSize:10 }}/>
              <YAxis domain={[0,100]} tick={{ fill:'var(--text3)', fontSize:10 }}/>
              <Tooltip contentStyle={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:6, fontSize:12 }}/>
              <Bar dataKey="score" radius={[4,4,0,0]}>{barData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <div className="section-title"><Globe size={13}/>Data Flow Network</div>
        {dataFlow?.links?.length>0 ? (
          <div className="table-wrap">
            <table><thead><tr><th>Pipeline</th><th>From</th><th></th><th>To</th><th>Status</th><th>Records</th></tr></thead>
              <tbody>{dataFlow.links.map((l,i)=>(
                <tr key={i}>
                  <td><strong>{l.pipeline}</strong></td>
                  <td><span className="dept-chip">{l.source}</span></td>
                  <td><ArrowRight size={13} color="var(--text3)"/></td>
                  <td><span className="dept-chip">{l.target||'—'}</span></td>
                  <td>{statusBadge(l.status)}</td>
                  <td><span className="text-mono">{fmt(l.records)}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="empty-state"><Globe size={28} color="var(--border2)"/><p>No active data flows</p></div>}
      </div>
    </div>
  );
}