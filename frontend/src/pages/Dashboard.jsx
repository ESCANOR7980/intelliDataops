import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, Database, GitBranch, Activity, Shield, Users, TrendingUp, Zap, Plus, Eye } from 'lucide-react';
import API, { fmt, fmtDate } from '../api';
import { useToast } from '../context/ToastContext';
import { StatCard, Spinner, COLORS } from '../components/UI';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState([]);
  const toast = useToast();
  useEffect(() => {
    Promise.all([API.get('/analytics/overview'), API.get('/analytics/activity')])
      .then(([ov, ac]) => { setData(ov.data); setActivity(ac.data.activity||[]); })
      .catch(() => toast('Failed to load dashboard','error'));
  }, []);
  if (!data) return <Spinner />;
  const { overview, charts, recentBlocks } = data;
  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:6 }}><span className="badge badge-blue">SDG 16</span><span className="badge badge-green">Live</span></div>
          <div className="page-title">Platform Dashboard</div>
          <div className="page-sub">Government data interoperability operations overview</div>
        </div>
        <Link to="/pipelines"><button className="btn btn-primary"><Plus size={13} />New Pipeline</button></Link>
      </div>
      <div className="grid-4 mb-20">
        <StatCard label="Active Departments" value={overview.departments} sub="+2 this month" color="var(--accent)" bgColor="var(--accent-light)" icon={Building2} />
        <StatCard label="Data Sources" value={overview.dataSources} sub={`${overview.dataSources} registered`} color="var(--green)" bgColor="var(--green-light)" icon={Database} />
        <StatCard label="Active Pipelines" value={overview.activePipelines} sub={`${overview.pipelines} total`} color="var(--purple)" bgColor="var(--purple-light)" icon={GitBranch} />
        <StatCard label="Records Processed" value={fmt(overview.totalRecordsProcessed)} sub={`${overview.totalPipelineRuns} runs`} color="var(--amber)" bgColor="var(--amber-light)" icon={Activity} />
      </div>
      <div className="grid-4 mb-20">
        <StatCard label="Blockchain Blocks" value={overview.blockchainBlocks} sub="Immutable trail" color="var(--green)" bgColor="var(--green-light)" icon={Shield} />
        <StatCard label="Platform Users" value={overview.users} sub="Active accounts" color="var(--accent)" bgColor="var(--accent-light)" icon={Users} />
        <StatCard label="Success Rate" value="94.2%" sub="Last 30 days" color="var(--green)" bgColor="var(--green-light)" icon={TrendingUp} />
        <StatCard label="Avg Data Quality" value="84.6" sub="Score /100" color="var(--amber)" bgColor="var(--amber-light)" icon={Zap} />
      </div>
      <div className="grid-2 mb-20">
        <div className="card">
          <div className="section-title"><Activity size={13} />Activity — Last 7 Days</div>
          {activity.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={activity}>
                <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1a56db" stopOpacity={0.12}/><stop offset="95%" stopColor="#1a56db" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill:'var(--text3)', fontSize:10 }} />
                <YAxis tick={{ fill:'var(--text3)', fontSize:10 }} />
                <Tooltip contentStyle={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:6, fontSize:12 }} />
                <Area type="monotone" dataKey="transactions" stroke="#1a56db" fill="url(#ag)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding:32 }}><Activity size={24} color="var(--border2)" /><p>No activity yet</p></div>}
        </div>
        <div className="card">
          <div className="section-title"><Database size={13} />Data Sources by Type</div>
          {charts.sourcesByType?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={charts.sourcesByType.map(d=>({name:d._id,value:d.count}))} cx="50%" cy="50%" outerRadius={75} innerRadius={35} dataKey="value" label={({name,value})=>`${name}(${value})`} labelLine={false}>
                  {charts.sourcesByType.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:6, fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding:32 }}><Database size={24} color="var(--border2)" /><p>No data sources</p></div>}
        </div>
      </div>
      <div className="card">
        <div className="flex-between mb-16">
          <div className="section-title" style={{ marginBottom:0 }}><Shield size={13} />Recent Blockchain Audit Trail</div>
          <Link to="/blockchain"><button className="btn btn-secondary btn-sm"><Eye size={12} />View All</button></Link>
        </div>
        <div className="grid-flow">
          {recentBlocks?.map((b,i) => (
            <div key={b._id}>
              {i > 0 && <div className="block-connector" />}
              <div className="block-item">
                <div className="block-num">#{b.blockNumber}</div>
                <div style={{ flex:1 }}>
                  <div className="flex-between"><span className="badge badge-blue">{b.data?.type?.replace(/_/g,' ')}</span><span className="text-sm">{fmtDate(b.timestamp)}</span></div>
                  <div className="block-hash" style={{ marginTop:4 }}>{b.hash?.substring(0,52)}...</div>
                  {b.data?.recordCount > 0 && <div className="text-sm" style={{ marginTop:3 }}>{fmt(b.data.recordCount)} records · {b.validator?.name||'System'}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}