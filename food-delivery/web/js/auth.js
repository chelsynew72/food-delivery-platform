/* ================================================================
   ChopFast — Auth Module  (auth.js)
   ================================================================ */
const API_BASE = 'http://localhost:3000/api/v1';

const Tokens = {
  save(a,r){ localStorage.setItem('cf_access',a); localStorage.setItem('cf_refresh',r); },
  getAccess(){ return localStorage.getItem('cf_access'); },
  getRefresh(){ return localStorage.getItem('cf_refresh'); },
  clear(){ ['cf_access','cf_refresh','cf_user'].forEach(k=>localStorage.removeItem(k)); },
  saveUser(u){ localStorage.setItem('cf_user',JSON.stringify(u)); },
  getUser(){ try{ return JSON.parse(localStorage.getItem('cf_user')); }catch{ return null; } },
};

async function apiFetch(path, opts={}){
  const headers = {'Content-Type':'application/json', ...(opts.headers||{})};
  const token = Tokens.getAccess();
  if(token) headers['Authorization'] = `Bearer ${token}`;
  let res = await fetch(`${API_BASE}${path}`, {...opts, headers});
  if(res.status===401 && Tokens.getRefresh()){
    const ok = await tryRefresh();
    if(ok){ headers['Authorization']=`Bearer ${Tokens.getAccess()}`; res=await fetch(`${API_BASE}${path}`,{...opts,headers}); }
    else{ Tokens.clear(); window.location.href='index.html'; return null; }
  }
  if(!res.ok){ const e=await res.json().catch(()=>({message:`HTTP ${res.status}`})); throw new Error(e.message||`HTTP ${res.status}`); }
  if(res.status===204) return null;
  const body=await res.json();
  return body.data!==undefined ? body.data : body;
}

async function tryRefresh(){
  try{
    const res=await fetch(`${API_BASE}/auth/refresh`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${Tokens.getAccess()}`},body:JSON.stringify({refreshToken:Tokens.getRefresh()})});
    if(!res.ok) return false;
    const body=await res.json(); const t=body.data||body;
    Tokens.save(t.accessToken,t.refreshToken); return true;
  }catch{ return false; }
}

const Auth = {
  async register({firstName,lastName,email,phone,password,role}){
    const data=await apiFetch('/auth/register',{method:'POST',body:JSON.stringify({firstName,lastName,email,phone,password,role})});
    Tokens.save(data.accessToken,data.refreshToken);
    const user=await apiFetch('/users/me'); Tokens.saveUser(user); return user;
  },
  async login({email,password}){
    const data=await apiFetch('/auth/login',{method:'POST',body:JSON.stringify({email,password})});
    Tokens.save(data.accessToken,data.refreshToken);
    const user=await apiFetch('/users/me'); Tokens.saveUser(user); return user;
  },
  async logout(){
    try{ await apiFetch('/auth/logout',{method:'POST'}); }finally{ Tokens.clear(); window.location.href='index.html'; }
  },
  isLoggedIn(){ return !!Tokens.getAccess(); },
  currentUser(){ return Tokens.getUser(); },
};

function redirectAfterLogin(user){
  window.location.href = (user.role==='restaurant_owner') ? 'dashboard.html' : 'restaurants.html';
}

function updateNavAuth(){
  const user=Auth.currentUser();
  const navCta=document.getElementById('nav-cta');
  if(!navCta) return;
  if(user){
    const initials=(user.firstName?.[0]??'')+(user.lastName?.[0]??'');
    navCta.innerHTML=`
      <div style="position:relative;display:inline-block" id="u-wrap">
        <button onclick="document.getElementById('u-dd').classList.toggle('ddo')"
          style="display:flex;align-items:center;gap:8px;background:#fff;border:2px solid #EAEEE9;border-radius:50px;padding:6px 16px 6px 6px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.9rem">
          <div style="width:34px;height:34px;border-radius:50%;background:#00866A;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.85rem;font-family:'Sora',sans-serif">${initials}</div>
          ${user.firstName} ▾
        </button>
        <div id="u-dd" style="display:none;position:absolute;top:calc(100% + 10px);right:0;background:#fff;border-radius:20px;min-width:210px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.14);border:1px solid #EAEEE9;z-index:500">
          <div style="padding:16px 18px 12px;border-bottom:1px solid #EAEEE9">
            <div style="font-family:'Sora',sans-serif;font-weight:700;font-size:.92rem">${user.firstName} ${user.lastName}</div>
            <div style="font-size:.78rem;color:#6B7280;margin-top:2px">${user.email}</div>
            <div style="margin-top:6px;display:inline-block;background:#FFF3CC;color:#856404;font-size:.7rem;font-weight:700;padding:3px 10px;border-radius:50px">${user.role.replace('_',' ').toUpperCase()}</div>
          </div>
          <a href="restaurants.html" style="display:flex;align-items:center;gap:10px;padding:12px 18px;text-decoration:none;color:#1E2019;font-size:.88rem;font-weight:500" onmouseover="this.style.background='#F7F8F6'" onmouseout="this.style.background=''">🏠 Browse restaurants</a>
          <a href="orders.html" style="display:flex;align-items:center;gap:10px;padding:12px 18px;text-decoration:none;color:#1E2019;font-size:.88rem;font-weight:500" onmouseover="this.style.background='#F7F8F6'" onmouseout="this.style.background=''">📦 My orders</a>
          ${user.role==='restaurant_owner'?`<a href="dashboard.html" style="display:flex;align-items:center;gap:10px;padding:12px 18px;text-decoration:none;color:#1E2019;font-size:.88rem;font-weight:500" onmouseover="this.style.background='#F7F8F6'" onmouseout="this.style.background=''">📊 Dashboard</a>`:''}
          <div style="border-top:1px solid #EAEEE9">
            <button onclick="Auth.logout()" style="width:100%;text-align:left;padding:12px 18px;border:none;background:none;cursor:pointer;font-size:.88rem;color:#DC2626;font-family:'DM Sans',sans-serif;font-weight:600;display:flex;align-items:center;gap:10px" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background=''">🚪 Sign out</button>
          </div>
        </div>
      </div>`;
    // Toggle via class
    new MutationObserver(()=>{ const d=document.getElementById('u-dd'); if(d) d.style.display=d.classList.contains('ddo')?'block':'none'; }).observe(document.getElementById('u-dd')||document.body,{attributes:true,attributeFilter:['class']});
    document.addEventListener('click',e=>{ const w=document.getElementById('u-wrap'); const d=document.getElementById('u-dd'); if(w&&d&&!w.contains(e.target)) d.classList.remove('ddo'); });
  } else {
    navCta.innerHTML=`<button class="btn-ghost" onclick="openModal('login')">Sign In</button><button class="btn-pill" onclick="openModal('register')">Order Now</button>`;
  }
}

function showAuthError(id,msg){
  const el=document.getElementById(id);
  if(el) el.innerHTML=`<div style="background:#FEF2F2;border:1.5px solid #FECACA;border-radius:10px;padding:10px 14px;color:#B91C1C;font-size:.85rem;font-weight:500;display:flex;align-items:center;gap:8px;margin-bottom:14px">⚠️ ${msg}</div>`;
}
function clearAuthError(id){ const el=document.getElementById(id); if(el) el.innerHTML=''; }
function setButtonLoading(btn,loading,label){
  if(!btn) return;
  if(loading){ btn.disabled=true; btn.dataset.orig=btn.textContent; btn.textContent='Loading…'; }
  else{ btn.disabled=false; btn.textContent=btn.dataset.orig||label||'Submit'; }
}
function showToast(msg,dur=3200){
  document.getElementById('cf-toast')?.remove();
  const t=document.createElement('div'); t.id='cf-toast'; t.textContent=msg;
  t.style.cssText='position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#141414;color:#fff;padding:13px 24px;border-radius:50px;font-family:"DM Sans",sans-serif;font-size:.92rem;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.22);z-index:9999;white-space:nowrap';
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),dur);
}

window.Auth=Auth; window.Tokens=Tokens; window.apiFetch=apiFetch;
window.redirectAfterLogin=redirectAfterLogin; window.updateNavAuth=updateNavAuth;
window.showAuthError=showAuthError; window.clearAuthError=clearAuthError;
window.setButtonLoading=setButtonLoading; window.showToast=showToast;