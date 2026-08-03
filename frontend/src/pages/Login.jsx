import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email:'admin@intellidataops.gov', password:'admin123' });
  const [loading, setLoading] = useState(false);
  const handle = async e => {
    e.preventDefault(); setLoading(true);
    try { await login(form.email, form.password); navigate('/dashboard'); }
    catch { toast('Invalid credentials', 'error'); }
    finally { setLoading(false); }
  };
  return (
    <div className="login-bg">
      <div className="login-wrap">
        <div className="login-left">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <div style={{ width:36, height:36, background:'rgba(255,255,255,0.2)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}><Shield size={20} color="white" /></div>
            <div className="login-brand">IntelliDataOps</div>
          </div>
          <div className="login-tagline">Open-source data integration platform enabling interoperability between government systems while maintaining security and citizen privacy.</div>
          <div className="login-features">
            {['Blockchain-backed immutable audit trail','Privacy-first data pipelines','Cross-department interoperability','Real-time analytics & reporting'].map(f => (
              <div key={f} className="login-feature"><CheckCircle2 size={14} color="rgba(255,255,255,0.7)" />{f}</div>
            ))}
          </div>
          <div className="login-badge">🇮🇳 SDG 16 — Infosys Hackathon 2024</div>
        </div>
        <div className="login-right">
          <div style={{ marginBottom:28 }}>
            <div className="login-title">Sign in to platform</div>
            <div className="login-sub">Use your government credentials to continue</div>
          </div>
          <form onSubmit={handle}>
            <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="name@gov.in" required /></div>
            <div className="form-group" style={{ marginBottom:20 }}><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" required /></div>
            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'10px' }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width:14,height:14 }} />Signing in...</> : <><Lock size={13} />Sign In</>}
            </button>
          </form>
          <div style={{ marginTop:24, padding:14, background:'var(--bg3)', borderRadius:8, border:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text2)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>Demo Credentials</div>
            <div style={{ fontSize:12, color:'var(--text3)', lineHeight:1.8, fontFamily:'var(--mono)' }}>
              <div>admin@intellidataops.gov / admin123</div>
              <div>analyst@intellidataops.gov / analyst123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}