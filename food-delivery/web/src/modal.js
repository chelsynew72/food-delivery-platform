


function openModal(type) {
  const overlay = document.getElementById('modal-overlay');
  const box     = document.getElementById('modal-content');
  if (!overlay || !box) return;

  box.innerHTML = MODALS[type]?.() ?? '';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Attach form handler after render
  const form = document.getElementById('cf-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      HANDLERS[type]?.();
    });
  }
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOnBg(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* ── Shared field builder ──────────────────────────────────────── */
const field = (label, type, id, placeholder, required = true) => `
  <div class="mf-group">
    <label for="${id}">${label}</label>
    <input type="${type}" id="${id}" placeholder="${placeholder}"
      ${required ? 'required' : ''} autocomplete="off" />
  </div>`;

const halfRow = (...fields) =>
  `<div class="mf-row">${fields.join('')}</div>`;

const selectField = (label, id, options) => `
  <div class="mf-group">
    <label for="${id}">${label}</label>
    <select id="${id}">
      ${options.map(o => `<option value="${o.v ?? o}">${o.l ?? o}</option>`).join('')}
    </select>
  </div>`;

/* ── Modal templates ───────────────────────────────────────────── */
const MODALS = {

  login: () => `
    <div class="modal-icon">👋</div>
    <h2>Welcome back</h2>
    <p>Sign in to your ChopFast account</p>
    <div id="auth-error"></div>
    <form id="cf-form" novalidate>
      ${field('Email address', 'email', 'f-email', 'you@example.com')}
      ${field('Password', 'password', 'f-password', '••••••••')}
      <div style="text-align:right;margin:-8px 0 14px">
        <a href="#" style="font-size:.82rem;color:#00866A;font-weight:600">Forgot password?</a>
      </div>
      <button type="submit" class="mf-btn" id="submit-btn">Sign In</button>
    </form>
    <div class="modal-switch">
      Don't have an account?
      <a onclick="openModal('register')">Sign up free</a>
    </div>`,

  register: () => `
    <div class="modal-icon">🎉</div>
    <h2>Create account</h2>
    <p>Join ChopFast and start ordering Cameroonian food</p>
    <div id="auth-error"></div>
    <form id="cf-form" novalidate>
      ${halfRow(
        field('First Name', 'text', 'f-first', 'Jean'),
        field('Last Name', 'text', 'f-last', 'Mbarga'),
      )}
      ${field('Email address', 'email', 'f-email', 'you@example.com')}
      ${field('Phone (optional)', 'tel', 'f-phone', '+237 6XX XXX XXX', false)}
      ${field('Password', 'password', 'f-password', 'Min 8 chars, upper + lower + number')}
      ${selectField('I want to…', 'f-role', [
        { v: 'customer',          l: '🛒 Order food' },
        { v: 'restaurant_owner',  l: '🍽️ List my restaurant' },
        { v: 'driver',            l: '🚴 Deliver orders' },
      ])}
      <button type="submit" class="mf-btn" id="submit-btn">Create Account</button>
    </form>
    <div class="modal-switch">
      Already have an account?
      <a onclick="openModal('login')">Sign in</a>
    </div>`,

  rider: () => `
    <div class="modal-icon">🚴</div>
    <h2>Become a Rider</h2>
    <p>Earn flexibly delivering with ChopFast across Cameroon</p>
    <div id="auth-error"></div>
    <form id="cf-form" novalidate>
      ${halfRow(
        field('First Name', 'text', 'f-first', 'Jean'),
        field('Last Name', 'text', 'f-last', 'Mbarga'),
      )}
      ${field('Email', 'email', 'f-email', 'you@example.com')}
      ${field('Phone', 'tel', 'f-phone', '+237 6XX XXX XXX')}
      ${field('Password', 'password', 'f-password', 'Min 8 chars')}
      ${selectField('City', 'f-city', ['Yaoundé','Douala','Bafoussam','Bamenda','Limbe','Garoua'])}
      ${selectField('Vehicle', 'f-vehicle', ['Motorbike','Bicycle','Car'])}
      <button type="submit" class="mf-btn" id="submit-btn">Register as Rider</button>
    </form>
    <div class="modal-switch">
      Already registered? <a onclick="openModal('login')">Sign in</a>
    </div>`,

  partner: () => `
    <div class="modal-icon">👨‍🍳</div>
    <h2>Become a Partner</h2>
    <p>Grow your restaurant with ChopFast's platform</p>
    <div id="auth-error"></div>
    <form id="cf-form" novalidate>
      ${halfRow(
        field('First Name', 'text', 'f-first', 'Jean'),
        field('Last Name', 'text', 'f-last', 'Mbarga'),
      )}
      ${field('Email', 'email', 'f-email', 'you@example.com')}
      ${field('Phone', 'tel', 'f-phone', '+237 6XX XXX XXX')}
      ${field('Password', 'password', 'f-password', 'Min 8 chars')}
      ${field('Restaurant Name', 'text', 'f-biz', 'Chez Mama Biya')}
      ${selectField('Cuisine type', 'f-cuisine', ['Cameroonian','Grills & BBQ','Fast Food','Bakery','Grocery','Pharmacy'])}
      <button type="submit" class="mf-btn" id="submit-btn">Register Restaurant</button>
    </form>
    <div class="modal-switch">
      Already registered? <a onclick="openModal('login')">Sign in</a>
    </div>`,

  career: () => `
    <div class="modal-icon">💼</div>
    <h2>Join Our Team</h2>
    <p>Be part of something big in Cameroon</p>
    <div id="auth-error"></div>
    <form id="cf-form" novalidate>
      ${halfRow(
        field('First Name', 'text', 'f-first', 'Jean'),
        field('Last Name', 'text', 'f-last', 'Mbarga'),
      )}
      ${field('Email', 'email', 'f-email', 'you@example.com')}
      ${selectField('Position', 'f-pos', [
        'Software Engineer','Operations Manager',
        'Marketing','Customer Support','Data Analyst','Other',
      ])}
      ${field('LinkedIn / Portfolio', 'url', 'f-link', 'https://linkedin.com/in/…', false)}
      <button type="submit" class="mf-btn" id="submit-btn">Apply Now</button>
    </form>`,
};

/* ── Form submit handlers ──────────────────────────────────────── */
const HANDLERS = {

  login: async () => {
    const btn   = document.getElementById('submit-btn');
    const email = document.getElementById('f-email')?.value.trim();
    const pass  = document.getElementById('f-password')?.value;
    clearAuthError('auth-error');

    if (!email || !pass) {
      showAuthError('auth-error', 'Please fill in all fields.');
      return;
    }

    setButtonLoading(btn, true);
    try {
      const user = await Auth.login({ email, password: pass });
      closeModal();
      updateNavAuth();
      showToast(`Welcome back, ${user.firstName}! 👋`);
      setTimeout(() => redirectAfterLogin(user), 800);
    } catch (err) {
      showAuthError('auth-error', err.message || 'Invalid email or password.');
    } finally {
      setButtonLoading(btn, false, 'Sign In');
    }
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

    // Client-side validation
    if (!first || !last || !email || !pass) {
      showAuthError('auth-error', 'Please fill in all required fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showAuthError('auth-error', 'Please enter a valid email address.');
      return;
    }
    if (pass.length < 8) {
      showAuthError('auth-error', 'Password must be at least 8 characters.');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pass)) {
      showAuthError('auth-error', 'Password needs uppercase, lowercase, and a number.');
      return;
    }

    setButtonLoading(btn, true);
    try {
      const user = await Auth.register({
        firstName: first, lastName: last,
        email, phone: phone || undefined, password: pass, role,
      });
      closeModal();
      updateNavAuth();
      showToast(`Welcome to ChopFast, ${user.firstName}! 🎉`);
      setTimeout(() => redirectAfterLogin(user), 800);
    } catch (err) {
      showAuthError('auth-error', err.message || 'Registration failed. Try a different email.');
    } finally {
      setButtonLoading(btn, false, 'Create Account');
    }
  },

  rider: async () => {
    const btn   = document.getElementById('submit-btn');
    const first = document.getElementById('f-first')?.value.trim();
    const last  = document.getElementById('f-last')?.value.trim();
    const email = document.getElementById('f-email')?.value.trim();
    const phone = document.getElementById('f-phone')?.value.trim();
    const pass  = document.getElementById('f-password')?.value;
    clearAuthError('auth-error');

    if (!first || !last || !email || !phone || !pass) {
      showAuthError('auth-error', 'Please fill in all fields.');
      return;
    }

    setButtonLoading(btn, true);
    try {
      const user = await Auth.register({
        firstName: first, lastName: last,
        email, phone, password: pass, role: 'driver',
      });
      closeModal();
      updateNavAuth();
      showToast(`Welcome, Rider ${user.firstName}! 🚴`);
      setTimeout(() => { window.location.href = 'restaurants.html'; }, 800);
    } catch (err) {
      showAuthError('auth-error', err.message || 'Registration failed.');
    } finally {
      setButtonLoading(btn, false, 'Register as Rider');
    }
  },

  partner: async () => {
    const btn   = document.getElementById('submit-btn');
    const first = document.getElementById('f-first')?.value.trim();
    const last  = document.getElementById('f-last')?.value.trim();
    const email = document.getElementById('f-email')?.value.trim();
    const phone = document.getElementById('f-phone')?.value.trim();
    const pass  = document.getElementById('f-password')?.value;
    clearAuthError('auth-error');

    if (!first || !last || !email || !phone || !pass) {
      showAuthError('auth-error', 'Please fill in all fields.');
      return;
    }

    setButtonLoading(btn, true);
    try {
      const user = await Auth.register({
        firstName: first, lastName: last,
        email, phone, password: pass, role: 'restaurant_owner',
      });
      closeModal();
      updateNavAuth();
      showToast(`Welcome, Partner ${user.firstName}! 🍽️`);
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } catch (err) {
      showAuthError('auth-error', err.message || 'Registration failed.');
    } finally {
      setButtonLoading(btn, false, 'Register Restaurant');
    }
  },

  career: async () => {
    const btn   = document.getElementById('submit-btn');
    const first = document.getElementById('f-first')?.value.trim();
    const last  = document.getElementById('f-last')?.value.trim();
    const email = document.getElementById('f-email')?.value.trim();
    clearAuthError('auth-error');

    if (!first || !last || !email) {
      showAuthError('auth-error', 'Please fill in all required fields.');
      return;
    }

    setButtonLoading(btn, true);
    // Careers just sends an email/interest — no account creation
    await new Promise(r => setTimeout(r, 1200));
    setButtonLoading(btn, false, 'Apply Now');
    closeModal();
    showToast('Application received! We\'ll be in touch soon. 💼');
  },
};

/* ── Toast notification ────────────────────────────────────────── */
function showToast(message, duration = 3500) {
  const existing = document.getElementById('cf-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'cf-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
    background:#1A1A1A; color:#fff;
    padding:13px 24px; border-radius:50px;
    font-family:'DM Sans',sans-serif; font-size:.92rem; font-weight:600;
    box-shadow:0 8px 32px rgba(0,0,0,0.25);
    z-index:9999; white-space:nowrap;
    animation:toastIn .35s cubic-bezier(.25,.46,.45,.94) both;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastIn  { from{opacity:0;transform:translateX(-50%) translateY(16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
    @keyframes toastOut { from{opacity:1;transform:translateX(-50%) translateY(0)} to{opacity:0;transform:translateX(-50%) translateY(16px)} }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut .35s ease forwards';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

/* ── Expose globals ────────────────────────────────────────────── */
window.openModal       = openModal;
window.closeModal      = closeModal;
window.closeModalOnBg  = closeModalOnBg;
window.showToast       = showToast;