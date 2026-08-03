const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f0f2f5; --bg2: #ffffff; --bg3: #f8f9fb;
    --card: #ffffff; --card2: #f4f6f9;
    --border: #e2e6ed; --border2: #d0d7e2;
    --accent: #1a56db; --accent2: #1044b8; --accent-light: #e8f0fe;
    --green: #0e9f6e; --green-light: #e6f9f3;
    --red: #e02424; --red-light: #fde8e8;
    --amber: #c27803; --amber-light: #fef3c7;
    --purple: #7e3af2; --purple-light: #ede9fe;
    --text: #111928; --text2: #4b5563; --text3: #9ca3af;
    --font: 'Inter', sans-serif; --mono: 'JetBrains Mono', monospace;
    --radius: 10px; --radius-sm: 6px;
    --shadow: 0 1px 3px rgba(0,0,0,0.08); --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font); font-size: 14px; line-height: 1.5; overflow-x: hidden; }
  * { scrollbar-width: thin; scrollbar-color: var(--border2) transparent; }
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  .layout { display: flex; min-height: 100vh; }
  .sidebar { width: 248px; background: var(--bg2); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; transition: transform 0.25s; }
  .sidebar.closed { transform: translateX(-248px); }
  .main { margin-left: 248px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; transition: margin 0.25s; }
  .main.full { margin-left: 0; }
  .topbar { height: 56px; background: var(--bg2); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 20px; gap: 12px; position: sticky; top: 0; z-index: 50; }
  .content { padding: 24px; flex: 1; }

  .sidebar-header { padding: 14px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
  .sidebar-logo-icon { width: 32px; height: 32px; background: var(--accent); border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sidebar-logo-text { font-size: 14px; font-weight: 700; color: var(--text); }
  .sidebar-logo-sub { font-size: 10px; color: var(--text3); }
  .sidebar-nav { flex: 1; padding: 10px 8px; overflow-y: auto; }
  .nav-section { margin-bottom: 2px; }
  .nav-label { font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 10px 4px; }
  .nav-item { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: var(--radius-sm); color: var(--text2); text-decoration: none; font-size: 13px; font-weight: 500; transition: all 0.12s; cursor: pointer; border: none; background: none; width: 100%; }
  .nav-item:hover { background: var(--bg3); color: var(--text); }
  .nav-item.active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
  .sidebar-footer { padding: 10px 8px; border-top: 1px solid var(--border); }
  .user-row { display: flex; align-items: center; gap: 9px; padding: 8px 10px; }
  .avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; flex-shrink: 0; }
  .user-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .user-role { font-size: 11px; color: var(--text3); text-transform: capitalize; }

  .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); }
  .card-sm { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px; }
  .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; box-shadow: var(--shadow); transition: box-shadow 0.2s, transform 0.2s; }
  .stat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
  .stat-icon { width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
  .stat-value { font-size: 24px; font-weight: 700; font-family: var(--mono); color: var(--text); }
  .stat-label { font-size: 12px; color: var(--text2); font-weight: 500; margin-top: 3px; }
  .stat-sub { font-size: 11px; color: var(--text3); margin-top: 2px; }

  .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
  .grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; }
  @media (max-width: 1280px) { .grid-4 { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 900px) { .grid-4,.grid-3,.grid-2 { grid-template-columns: 1fr; } .sidebar { transform: translateX(-248px); } .main { margin-left: 0; } }

  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.12s; font-family: var(--font); }
  .btn-primary { background: var(--accent); color: #fff; } .btn-primary:hover { background: var(--accent2); }
  .btn-secondary { background: var(--bg2); color: var(--text2); border-color: var(--border2); } .btn-secondary:hover { background: var(--bg3); color: var(--text); border-color: var(--accent); }
  .btn-danger { background: var(--red-light); color: var(--red); border-color: #fca5a5; }
  .btn-success { background: var(--green-light); color: var(--green); border-color: #6ee7b7; } .btn-success:hover { background: #d1fae5; }
  .btn-sm { padding: 4px 10px; font-size: 12px; }
  .btn-icon { padding: 6px; border-radius: var(--radius-sm); background: var(--bg2); border: 1px solid var(--border); color: var(--text2); cursor: pointer; display: inline-flex; align-items: center; transition: all 0.12s; }
  .btn-icon:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-green { background: var(--green-light); color: var(--green); }
  .badge-red { background: var(--red-light); color: var(--red); }
  .badge-amber { background: var(--amber-light); color: var(--amber); }
  .badge-blue { background: var(--accent-light); color: var(--accent); }
  .badge-purple { background: var(--purple-light); color: var(--purple); }
  .badge-gray { background: var(--card2); color: var(--text3); border: 1px solid var(--border); }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead { background: var(--bg3); }
  th { padding: 9px 14px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); white-space: nowrap; }
  td { padding: 10px 14px; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: middle; color: var(--text2); }
  td strong { color: var(--text); } tr:last-child td { border-bottom: none; } tr:hover td { background: var(--bg3); }

  .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
  .form-label { font-size: 12px; font-weight: 600; color: var(--text2); }
  .form-input, .form-select, .form-textarea { background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 8px 11px; color: var(--text); font-size: 13px; font-family: var(--font); transition: border-color 0.15s, box-shadow 0.15s; width: 100%; outline: none; }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(26,86,219,0.1); }
  .form-textarea { resize: vertical; min-height: 76px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(2px); padding: 20px; }
  .modal { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 24px; max-width: 540px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
  .modal-title { font-size: 15px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }

  .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
  .page-title { font-size: 20px; font-weight: 700; color: var(--text); }
  .page-sub { font-size: 13px; color: var(--text3); margin-top: 2px; }
  .section-title { font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 12px; display: flex; align-items: center; gap: 7px; text-transform: uppercase; letter-spacing: 0.6px; }

  .block-item { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px; display: flex; align-items: flex-start; gap: 12px; transition: border-color 0.15s; }
  .block-item:hover { border-color: var(--accent); }
  .block-num { background: var(--accent); border-radius: 5px; padding: 5px 8px; font-family: var(--mono); font-size: 10px; font-weight: 700; color: #fff; min-width: 42px; text-align: center; flex-shrink: 0; }
  .block-hash { font-family: var(--mono); font-size: 10px; color: var(--text3); word-break: break-all; }
  .block-connector { width: 1px; height: 8px; background: var(--border); margin: 0 20px; }

  .pipeline-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); transition: box-shadow 0.2s; }
  .pipeline-card:hover { box-shadow: var(--shadow-md); }
  .pipeline-flow { display: flex; align-items: center; gap: 8px; margin: 10px 0; flex-wrap: wrap; }
  .dept-chip { background: var(--bg3); border: 1px solid var(--border); border-radius: 20px; padding: 3px 10px; font-size: 12px; font-weight: 600; color: var(--text2); display: flex; align-items: center; gap: 4px; }
  .transform-tag { background: var(--accent-light); color: var(--accent); border-radius: 4px; padding: 1px 6px; font-size: 10px; font-family: var(--mono); font-weight: 600; }

  .score-bar-wrap { display: flex; align-items: center; gap: 8px; }
  .score-bar-bg { flex: 1; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .score-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }

  .dept-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); transition: box-shadow 0.2s, border-color 0.2s; }
  .dept-card:hover { box-shadow: var(--shadow-md); border-color: var(--accent); }

  .search-wrap { position: relative; }
  .search-wrap input { background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 7px 11px 7px 32px; color: var(--text); font-size: 13px; outline: none; transition: all 0.15s; width: 200px; font-family: var(--font); }
  .search-wrap input:focus { border-color: var(--accent); width: 240px; box-shadow: 0 0 0 3px rgba(26,86,219,0.1); }
  .search-icon { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); color: var(--text3); }

  .toast-wrap { position: fixed; bottom: 20px; right: 20px; display: flex; flex-direction: column; gap: 8px; z-index: 999; }
  .toast { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 11px 14px; display: flex; align-items: center; gap: 9px; font-size: 13px; box-shadow: var(--shadow-md); animation: slideIn 0.25s ease; max-width: 300px; font-weight: 500; }
  .toast.success { border-left: 3px solid var(--green); } .toast.error { border-left: 3px solid var(--red); }
  @keyframes slideIn { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  .login-bg { min-height: 100vh; background: linear-gradient(135deg, #1e3a8a 0%, #1a56db 100%); display: flex; align-items: center; justify-content: center; padding: 20px; }
  .login-wrap { display: grid; grid-template-columns: 1fr 1fr; max-width: 860px; width: 100%; border-radius: 14px; overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,0.3); }
  .login-left { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 44px 36px; display: flex; flex-direction: column; justify-content: center; }
  .login-right { background: var(--bg2); padding: 44px 36px; }
  .login-brand { font-size: 26px; font-weight: 800; color: white; margin-bottom: 6px; }
  .login-tagline { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6; }
  .login-features { margin-top: 28px; display: flex; flex-direction: column; gap: 12px; }
  .login-feature { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.85); font-size: 13px; }
  .login-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 4px 12px; font-size: 11px; color: rgba(255,255,255,0.9); font-weight: 600; margin-top: 28px; width: fit-content; }
  .login-title { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .login-sub { font-size: 13px; color: var(--text3); margin-bottom: 24px; }
  @media (max-width: 640px) { .login-wrap { grid-template-columns: 1fr; } .login-left { display: none; } }

  .flex-between { display: flex; align-items: center; justify-content: space-between; }
  .flex-center { display: flex; align-items: center; justify-content: center; }
  .flex-gap { display: flex; align-items: center; gap: 8px; }
  .mt-16 { margin-top: 16px; } .mt-20 { margin-top: 20px; }
  .mb-16 { margin-bottom: 16px; } .mb-20 { margin-bottom: 20px; }
  .text-sm { font-size: 12px; color: var(--text3); }
  .text-mono { font-family: var(--mono); font-size: 11px; }
  .divider { border: none; border-top: 1px solid var(--border); margin: 14px 0; }
  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; color: var(--text3); gap: 10px; }
  .empty-state p { font-size: 13px; }
  .spinner { width: 18px; height: 18px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-wrap { display: flex; align-items: center; justify-content: center; padding: 60px; gap: 10px; color: var(--text3); font-size: 13px; }
  .grid-flow { display: flex; flex-direction: column; gap: 10px; }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); display: inline-block; }
  .info-chip { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; background: var(--bg3); border: 1px solid var(--border); border-radius: 20px; font-size: 11px; color: var(--text2); font-weight: 500; }
`;
export default STYLES;