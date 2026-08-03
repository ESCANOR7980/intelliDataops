import { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus } from 'lucide-react';
import API, { fmtDate } from '../api';
import { useToast } from '../context/ToastContext';
import { statusBadge, Spinner } from '../components/UI';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'viewer', department:'' });
  const toast = useToast();
  const load = () => { setLoading(true); Promise.all([API.get('/auth/users'),API.get('/departments')]).then(([u,d])=>{ setUsers(u.data.users); setDepts(d.data.departments); }).finally(()=>setLoading(false)); };
  useEffect(load,[]);
  const save = async () => { try { await API.post('/auth/register',form); toast('User created'); setShowModal(false); load(); } catch(e){ toast(e.response?.data?.message||'Error','error'); } };
  const roleColor = r => ({ admin:'badge-red', analyst:'badge-purple', officer:'badge-blue', viewer:'badge-gray' }[r]||'badge-gray');
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">User Management</div><div className="page-sub">{users.length} platform users</div></div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={13}/>Add User</button>
      </div>
      <div className="card">
        {loading ? <Spinner /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Last Login</th><th>Joined</th></tr></thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u._id}>
                    <td>
                      <div className="flex-gap">
                        <div className="avatar" style={{ width:26,height:26,fontSize:10 }}>{u.name?.[0]}</div>
                        <div><strong>{u.name}</strong><div className="text-sm">{u.email}</div></div>
                      </div>
                    </td>
                    <td><span className={`badge ${roleColor(u.role)}`}>{u.role}</span></td>
                    <td>{u.department?.name||'—'}</td>
                    <td>{statusBadge(u.isActive?'active':'inactive')}</td>
                    <td>{fmtDate(u.lastLogin)}</td>
                    <td>{fmtDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title"><UsersIcon size={16} color="var(--accent)"/>Add User</div><button className="btn-icon" onClick={()=>setShowModal(false)}>✕</button></div>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="John Doe"/></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="user@gov.in"/></div>
            <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Min 6 characters"/></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Role</label><select className="form-select" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>{['admin','analyst','officer','viewer'].map(r=><option key={r} value={r}>{r}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Department</label><select className="form-select" value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))}><option value="">Select</option>{depts.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}</select></div>
            </div>
            <div className="flex-gap" style={{ justifyContent:'flex-end' }}><button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Create User</button></div>
          </div>
        </div>
      )}
    </div>
  );
}