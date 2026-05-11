/* ================================================================
   ChopFast — Modal System  (modals.js)
   All forms wired to real backend via auth.js
   ================================================================ */

function openModal(type) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;
  content.innerHTML = MODALS[type] ? MODALS[type]() : '';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // attach submit handler
  const form = document.getElementById('cf-form');
  if (form) form.addEventListener('submit', e => { e.preventDefault(); HANDLERS[type]?.(); });
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOnBg(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── Field helpers ─────────────────────────────────────────────── */
const f = (label, type, id, ph, req=true) => `
  <div class="mf-group">
    <label for="${id}">${label}</label>
    <input type="${type}" id="${id}" placeholder="${ph}" ${req?'required':''} autocomplete="off"/>
  </div>`;

const row = (...fields) => `<div class="mf-row">${fields.join('')}</div>`;

const sel = (label, id, opts) => `
  <div class="mf-group">
    <label for="${id}">${label}</label>
    <select id="${id}">${opts.map(o=>`<option value="${o.v??o}">${o.l??o}</option>`).join('')}</select>
  </div>`;

/* ── Modal CSS shared across all pages ─────────────────────────── */
(function injectModalCSS(){
  if(document.getElementById('cf-modal-css')) return;
  const s=document.createElement('style'); s.id='cf-modal-css';
  s.textContent=`
    .mf-group{margin-bottom:1rem}
    .mf-group label{display:block;font-weight:600;font-size:.83rem;margin-bottom:6px;color:#1E2019}
    .mf-group input,.mf-group select{width:100%;border:2px solid #EAEEE9;border-radius:12px;padding:12px 16px;font-family:'DM Sans',sans-serif;font-size:.95rem;color:#1E2019;outline:none;transition:border-color .2s;background:#F7F8F6}
    .mf-group input:focus,.mf-group select:focus{border-color:#00866A;background:#fff}
    .mf-row{display:flex;gap:10px}
    .mf-row .mf-group{flex:1}
    .btn-full{width:100%;background:#00866A;color:#fff;border:none;border-radius:50px;padding:15px;font-weight:700;font-size:1rem;font-family:'DM Sans',sans-serif;cursor:pointer;transition:background .2s;margin-top:.5rem}
    .btn-full:hover:not(:disabled){background:#006652}
    .btn-full:disabled{opacity:.6;cursor:default}
    .modal-switch{text-align:center;margin-top:1.2rem;font-size:.88rem;color:#6B7280}
    .modal-switch a{color:#00866A;font-weight:600;cursor:pointer}
    .modal-divider{display:flex;align-items:center;gap:12px;margin:1.25rem 0;color:#6B7280;font-size:.82rem}
    .modal-divider::before,.modal-divider::after{content:'';flex:1;height:1px;background:#EAEEE9}
    .btn-social{width:100%;background:#F7F8F6;color:#1E2019;border:2px solid #EAEEE9;border-radius:50px;padding:13px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.95rem;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:.75rem}
    .btn-social:hover{border-color:#00866A;background:#fff}
    #modal-content h2{font-family:'Sora',sans-serif;font-size:1.65rem;font-weight:800;margin-bottom:.4rem;letter-spacing:-0.02em;color:#141414}
    #modal-content>p{color:#6B7280;font-size:.9rem;margin-bottom:1.5rem}
  `;
  document.head.appendChild(s);
})();

/* ── Modal templates ───────────────────────────────────────────── */
const MODALS = {
  login: () => `
    <h2>Welcome back 👋</h2>
    <p>Sign in to your ChopFast account</p>
    <div id="auth-error"></div>
    <button class="btn-social" onclick="showToast('Google login coming soon!')">🌐 Continue with Google</button>
    <div class="modal-divider">or continue with email</div>
    <form id="cf-form" novalidate>
      ${f('Email address','email','f-email','you@example.com')}
      ${f('Password','password','f-password','••••••••')}
      <div style="text-align:right;margin:-6px 0 14px">
        <a href="#" style="font-size:.82rem;color:#00866A;font-weight:600;text-decoration:none">Forgot password?</a>
      </div>
      <button type="submit" class="btn-full" id="submit-btn">Sign In</button>
    </form>
    <div class="modal-switch">Don't have an account? <a onclick="openModal('register')">Sign up free</a></div>`,

  register: () => `
    <h2>Create account 🎉</h2>
    <p>Join ChopFast and start ordering local food</p>
    <div id="auth-error"></div>
    <form id="cf-form" novalidate>
      ${row(f('First Name','text','f-first','Jean'), f('Last Name','text','f-last','Mbarga'))}
      ${f('Email address','email','f-email','you@example.com')}
      ${f('Phone (optional)','tel','f-phone','+237 6XX XXX XXX',false)}
      ${f('Password','password','f-password','Min 8 chars, A-z + number')}
      ${sel('I want to…','f-role',[
        {v:'customer',         l:'🛒 Order food'},
        {v:'restaurant_owner', l:'🍽️ List my restaurant'},
        {v:'driver',           l:'🚴 Deliver orders'},
      ])}
      <button type="submit" class="btn-full" id="submit-btn">Create Account</button>
    </form>
    <div class="modal-switch">Already have an account? <a onclick="openModal('login')">Sign in</a></div>`,

  rider: () => `
    <h2>Become a Rider 🚴</h2>
    <p>Earn flexibly delivering with ChopFast across Cameroon</p>
    <div id="auth-error"></div>
    <form id="cf-form" novalidate>
      ${row(f('First Name','text','f-first','Jean'), f('Last Name','text','f-last','Mbarga'))}
      ${f('Email','email','f-email','you@example.com')}
      ${f('Phone','tel','f-phone','+237 6XX XXX XXX')}
      ${f('Password','password','f-password','Min 8 chars')}
      ${sel('City','f-city',['Yaoundé','Douala','Bafoussam','Bamenda','Limbe','Garoua'])}
      ${sel('Vehicle','f-vehicle',['Motorbike','Bicycle','Car'])}
      <button type="submit" class="btn-full" id="submit-btn">Register as Rider</button>
    </form>
    <div class="modal-switch">Already registered? <a onclick="openModal('login')">Sign in</a></div>`,

  partner: () => `
    <h2>List Your Restaurant 👨‍🍳</h2>
    <p>Reach thousands of customers and grow your sales with ChopFast</p>
    <div id="auth-error"></div>
    <form id="cf-form" novalidate>
      ${row(f('First Name','text','f-first','Jean'), f('Last Name','text','f-last','Mbarga'))}
      ${f('Email','email','f-email','you@example.com')}
      ${f('Phone','tel','f-phone','+237 6XX XXX XXX')}
      ${f('Password','password','f-password','Min 8 chars')}
      ${f('Restaurant / Shop Name','text','f-biz','e.g. Chez Mama Biya')}
      ${sel('Cuisine type','f-cuisine',['Cameroonian','Grills & BBQ','Fast Food','Bakery','Grocery','Pharmacy'])}
      <button type="submit" class="btn-full" id="submit-btn">Register Restaurant</button>
    </form>
    <div class="modal-switch">Already registered? <a onclick="openModal('login')">Sign in</a></div>`,

  career: () => `
    <h2>Work With Us 💼</h2>
    <p>Ambitious, humble, collaborative? We're building something big in Cameroon</p>
    <div id="auth-error"></div>
    <form id="cf-form" novalidate>
      ${row(f('First Name','text','f-first','Jean'), f('Last Name','text','f-last','Mbarga'))}
      ${f('Email','email','f-email','you@example.com')}
      ${sel('Position of interest','f-pos',['Software Engineer','Operations Manager','Marketing','Customer Support','Data Analyst','Other'])}
      ${f('LinkedIn / Portfolio URL','url','f-link','https://linkedin.com/in/…',false)}
      <button type="submit" class="btn-full" id="submit-btn">Apply Now</button>
    </form>`,
};

/* ── Validators ────────────────────────────────────────────────── */
function validateEmail(v){ return /\S+@\S+\.\S+/.test(v); }
function validatePassword(v){
  if(v.length<8) return 'Password must be at least 8 characters.';
  if(!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v)) return 'Password needs uppercase, lowercase and a number.';
  return null;
}

/* ── Form handlers ─────────────────────────────────────────────── */
const HANDLERS = {

  login: async () => {
    const btn   = document.getElementById('submit-btn');
    const email = document.getElementById('f-email')?.value.trim();
    const pass  = document.getElementById('f-password')?.value;
    clearAuthError('auth-error');
    if(!email||!pass){ showAuthError('auth-error','Please fill in all fields.'); return; }
    if(!validateEmail(email)){ showAuthError('auth-error','Please enter a valid email address.'); return; }
    setButtonLoading(btn,true);
    try{
      const user = await Auth.login({email, password:pass});
      closeModal();
      updateNavAuth();
      showToast(`Welcome back, ${user.firstName}! 👋`);
      setTimeout(()=>redirectAfterLogin(user), 900);
    } catch(err){
      showAuthError('auth-error', err.message.includes('credentials')
        ? 'Incorrect email or password. Please try again.'
        : err.message || 'Login failed. Please try again.');
    } finally { setButtonLoading(btn,false,'Sign In'); }
  },

  register: async () => {
    const btn   = document.getElementById('submit-btn');
    const first = document.getElementById('f-first')?.value.trim();
    const last  = document.getElementById('f-last')?.value.trim();
    const email = document.getElementById('f-email')?.value.trim();
    const phone = document.getElementById('f-phone')?.value.trim();
    const pass  = document.getElementById('f-password')?.value;
    const role  = document.getElementById('f-role')?.value;
    clearAuthError('auth-error');
    if(!first||!last||!email||!pass){ showAuthError('auth-error','Please fill in all required fields.'); return; }
    if(!validateEmail(email)){ showAuthError('auth-error','Please enter a valid email address.'); return; }
    const passErr = validatePassword(pass);
    if(passErr){ showAuthError('auth-error',passErr); return; }
    setButtonLoading(btn,true);
    try{
      const user = await Auth.register({firstName:first,lastName:last,email,phone:phone||undefined,password:pass,role});
      closeModal();
      updateNavAuth();
      showToast(`Welcome to ChopFast, ${user.firstName}! 🎉`);
      setTimeout(()=>redirectAfterLogin(user), 900);
    } catch(err){
      showAuthError('auth-error', err.message.includes('Email already')
        ? 'This email is already registered. Try signing in instead.'
        : err.message || 'Registration failed. Please try again.');
    } finally { setButtonLoading(btn,false,'Create Account'); }
  },

  rider: async () => {
    const btn   = document.getElementById('submit-btn');
    const first = document.getElementById('f-first')?.value.trim();
    const last  = document.getElementById('f-last')?.value.trim();
    const email = document.getElementById('f-email')?.value.trim();
    const phone = document.getElementById('f-phone')?.value.trim();
    const pass  = document.getElementById('f-password')?.value;
    clearAuthError('auth-error');
    if(!first||!last||!email||!phone||!pass){ showAuthError('auth-error','Please fill in all required fields.'); return; }
    if(!validateEmail(email)){ showAuthError('auth-error','Please enter a valid email address.'); return; }
    const passErr = validatePassword(pass);
    if(passErr){ showAuthError('auth-error',passErr); return; }
    setButtonLoading(btn,true);
    try{
      const user = await Auth.register({firstName:first,lastName:last,email,phone,password:pass,role:'driver'});
      closeModal();
      updateNavAuth();
      showToast(`Welcome aboard, Rider ${user.firstName}! 🚴`);
      setTimeout(()=>{ window.location.href='restaurants.html'; },900);
    } catch(err){
      showAuthError('auth-error', err.message.includes('Email already')
        ? 'This email is already registered. Try signing in instead.'
        : err.message || 'Registration failed. Please try again.');
    } finally { setButtonLoading(btn,false,'Register as Rider'); }
  },

  partner: async () => {
    const btn   = document.getElementById('submit-btn');
    const first = document.getElementById('f-first')?.value.trim();
    const last  = document.getElementById('f-last')?.value.trim();
    const email = document.getElementById('f-email')?.value.trim();
    const phone = document.getElementById('f-phone')?.value.trim();
    const pass  = document.getElementById('f-password')?.value;
    clearAuthError('auth-error');
    if(!first||!last||!email||!phone||!pass){ showAuthError('auth-error','Please fill in all required fields.'); return; }
    if(!validateEmail(email)){ showAuthError('auth-error','Please enter a valid email address.'); return; }
    const passErr = validatePassword(pass);
    if(passErr){ showAuthError('auth-error',passErr); return; }
    setButtonLoading(btn,true);
    try{
      const user = await Auth.register({firstName:first,lastName:last,email,phone,password:pass,role:'restaurant_owner'});
      closeModal();
      updateNavAuth();
      showToast(`Welcome, Partner ${user.firstName}! 🍽️ Let's grow together.`);
      setTimeout(()=>{ window.location.href='dashboard.html'; },900);
    } catch(err){
      showAuthError('auth-error', err.message.includes('Email already')
        ? 'This email is already registered. Try signing in instead.'
        : err.message || 'Registration failed. Please try again.');
    } finally { setButtonLoading(btn,false,'Register Restaurant'); }
  },

  career: async () => {
    const btn   = document.getElementById('submit-btn');
    const first = document.getElementById('f-first')?.value.trim();
    const last  = document.getElementById('f-last')?.value.trim();
    const email = document.getElementById('f-email')?.value.trim();
    clearAuthError('auth-error');
    if(!first||!last||!email){ showAuthError('auth-error','Please fill in all required fields.'); return; }
    if(!validateEmail(email)){ showAuthError('auth-error','Please enter a valid email address.'); return; }
    setButtonLoading(btn,true);
    // Careers is a contact form — no account creation needed
    await new Promise(r=>setTimeout(r,1200));
    setButtonLoading(btn,false,'Apply Now');
    closeModal();
    showToast("Application received! We'll be in touch soon. 💼");
  },
};

window.openModal      = openModal;
window.closeModal     = closeModal;
window.closeModalOnBg = closeModalOnBg;