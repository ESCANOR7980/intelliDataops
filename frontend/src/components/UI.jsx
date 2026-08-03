export const statusBadge = s => {
  const map = { active:'badge-green', inactive:'badge-gray', error:'badge-red', paused:'badge-amber', pending:'badge-amber', draft:'badge-gray', success:'badge-green', failed:'badge-red' };
  return <span className={`badge ${map[s]||'badge-gray'}`}>{s}</span>;
};
export const ScoreBar = ({ score }) => {
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)';
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-bg"><div className="score-bar-fill" style={{ width:`${score}%`, background:color }} /></div>
      <span style={{ fontSize:11, fontWeight:700, color, minWidth:28, fontFamily:'var(--mono)' }}>{score}</span>
    </div>
  );
};
export const Spinner = () => <div className="loading-wrap"><span className="spinner" /><span>Loading...</span></div>;
export const Empty = ({ icon: Icon, text }) => (
  <div className="empty-state">{Icon && <Icon size={28} color="var(--border2)" />}<p>{text||'No data found'}</p></div>
);
export const COLORS = ['#1a56db','#7e3af2','#0e9f6e','#c27803','#e02424','#f97316'];
export const StatCard = ({ label, value, sub, color='var(--accent)', bgColor='var(--accent-light)', icon:Icon }) => (
  <div className="stat-card">
    {Icon && <div className="stat-icon" style={{ background:bgColor }}><Icon size={18} color={color} /></div>}
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);