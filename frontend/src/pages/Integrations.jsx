import { useState, useEffect } from 'react';
import { Link2 } from 'lucide-react';
import API from '../api';
import { useToast } from '../context/ToastContext';
import { statusBadge, Spinner } from '../components/UI';

const FORMATS = [
  { name:'REST API', icon:'🔌', desc:'RESTful endpoint with JWT auth', badge:'badge-blue' },
  { name:'GraphQL', icon:'⚡', desc:'Flexible query interface', badge:'badge-purple' },
  { name:'CSV Export', icon:'📊', desc:'Comma-separated data exports', badge:'badge-green' },
  { name:'JSON Feed', icon:'{}', desc:'Real-time JSON data feeds', badge:'badge-amber' },
  { name:'XML / SOAP', icon:'📄', desc:'Legacy system compatibility', badge:'badge-gray' },
  { name:'Webhooks', icon:'🔔', desc:'Event-driven push notifications', badge:'badge-blue' },
];

export default function Integrations() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  useEffect(() => { API.get('/datasources').then(r=>setSources(r.data.dataSources)).catch(()=>toast('Failed to load','error')).finally(()=>setLoading(false)); }, []);
  return (
    <div>
      <div className="page-header"><div><div className="page-title">Integration Hub</div><div className="page-sub">Open APIs and data formats for government system connectivity</div></div></div>
      <div className="grid-3 mb-20">
        {FORMATS.map((f,i)=>(
          <div key={i} className="card" style={{ textAlign:'center', padding:24 }}>
            <div style={{ fontSize:30, marginBottom:10 }}>{f.icon}</div>
            <div style={{ fontWeight:700, marginBottom:6 }}>{f.name}</div>
            <div className="text-sm" style={{ marginBottom:12 }}>{f.desc}</div>
            <span className={`badge ${f.badge}`}>Supported</span>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="section-title"><Link2 size={13}/>Available Endpoints</div>
        {loading ? <Spinner /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Data Source</th><th>Department</th><th>Endpoint</th><th>Status</th><th>Format</th></tr></thead>
              <tbody>
                {sources.map(s=>(
                  <tr key={s._id}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.department?.name}</td>
                    <td><code style={{ fontFamily:'var(--mono)', fontSize:11, background:'var(--bg3)', padding:'2px 6px', borderRadius:4 }}>/api/integrations/{s._id}/data</code></td>
                    <td>{statusBadge(s.status)}</td>
                    <td><span className="badge badge-blue">{s.type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}