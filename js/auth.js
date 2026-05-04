(function () {
  'use strict';

  const API = 'http://localhost:3000/api/auth';

  /* ── Password validation rules (ต้อง match กับ backend) ── */
  function validatePassword(password) {
    const errors = [];
    if (password.length < 8)             errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password))         errors.push('At least 1 uppercase letter');
    if (!/[!@#$%^&*]/.test(password))    errors.push('At least 1 special character (!@#$%^&*)');
    return errors;
  }

  /* ── UI helpers ── */
  function showError(formId, message) {
    var el = document.querySelector('#' + formId + ' .auth-error');
    if (el) { el.textContent = message; el.classList.remove('d-none'); }
  }

  function hideError(formId) {
    var el = document.querySelector('#' + formId + ' .auth-error');
    if (el) el.classList.add('d-none');
  }

  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait...' : btn.dataset.label;
  }

  /* ── Session state ── */
  function saveSession(token, user) {
    localStorage.setItem('fm_token', token);
    localStorage.setItem('fm_user', JSON.stringify(user));
  }

  function getSession() {
    var token = localStorage.getItem('fm_token');
    var user  = localStorage.getItem('fm_user');
    return token ? { token: token, user: JSON.parse(user) } : null;
  }

  function clearSession() {
    localStorage.removeItem('fm_token');
    localStorage.removeItem('fm_user');
  }

  /* ── Update navbar user button ── */
  function updateNavbar() {
    var session = getSession();
    var btn = document.getElementById('user-nav-btn');
    if (!btn) return;

    if (session) {
      btn.title = 'Logged in as ' + session.user.firstName;
      btn.classList.add('bg-primary', 'text-white');
      btn.classList.remove('bg-light');
    } else {
      btn.title = 'Login / Register';
      btn.classList.remove('bg-primary', 'text-white');
      btn.classList.add('bg-light');
    }
  }

  /* ── Login ── */
  function handleLogin(e) {
    e.preventDefault();
    hideError('login-form');

    var email    = document.getElementById('login-email').value.trim();
    var password = document.getElementById('login-password').value;
    var btn      = document.getElementById('login-btn');

    if (!email || !password) {
      return showError('login-form', 'Please fill in all fields.');
    }

    setLoading(btn, true);

    fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then(function (res) { return res.json().then(function (data) { return { status: res.status, data: data }; }); })
      .then(function (res) {
        if (res.data.success) {
          saveSession(res.data.token, res.data.user);
          updateNavbar();
          bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
          showToast('Welcome back, ' + res.data.user.firstName + '!', 'success');
        } else {
          showError('login-form', res.data.message || 'Login failed.');
        }
      })
      .catch(function () { showError('login-form', 'Cannot connect to server. Is the backend running?'); })
      .finally(function () { setLoading(btn, false); });
  }

  /* ── Register ── */
  function handleRegister(e) {
    e.preventDefault();
    hideError('register-form');

    var firstName = document.getElementById('reg-firstname').value.trim();
    var email     = document.getElementById('reg-email').value.trim();
    var password  = document.getElementById('reg-password').value;
    var btn       = document.getElementById('register-btn');

    if (!firstName || !email || !password) {
      return showError('register-form', 'Please fill in all fields.');
    }

    /* Frontend validation — catch early before hitting the server */
    var errors = validatePassword(password);
    if (errors.length > 0) {
      return showError('register-form', 'Password must include: ' + errors.join(', ') + '.');
    }

    setLoading(btn, true);

    fetch(API + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: firstName, email: email, password: password }),
    })
      .then(function (res) { return res.json().then(function (data) { return { status: res.status, data: data }; }); })
      .then(function (res) {
        if (res.data.success) {
          showToast('Account created! Please log in.', 'success');
          /* Switch to login tab */
          document.getElementById('login-tab').click();
          document.getElementById('reg-form-el').reset();
        } else {
          showError('register-form', res.data.message || 'Registration failed.');
        }
      })
      .catch(function () { showError('register-form', 'Cannot connect to server. Is the backend running?'); })
      .finally(function () { setLoading(btn, false); });
  }

  /* ── Logout ── */
  function handleLogout() {
    clearSession();
    updateNavbar();
    showToast('Logged out.', 'info');
  }

  /* ── Real-time password strength feedback ── */
  function initPasswordStrength() {
    var input = document.getElementById('reg-password');
    var hint  = document.getElementById('password-hint');
    if (!input || !hint) return;

    input.addEventListener('input', function () {
      var errors = validatePassword(this.value);
      if (this.value.length === 0) {
        hint.textContent = '';
        return;
      }
      if (errors.length === 0) {
        hint.textContent = 'Strong password ✓';
        hint.className = 'form-text text-success';
      } else {
        hint.textContent = 'Missing: ' + errors.join(', ');
        hint.className = 'form-text text-danger';
      }
    });
  }

  /* ── Toast notification ── */
  function showToast(message, type) {
    var container = document.getElementById('toast-container');
    if (!container) return;
    var bg = type === 'success' ? 'bg-success' : type === 'info' ? 'bg-secondary' : 'bg-danger';
    var id = 'toast-' + Date.now();
    container.insertAdjacentHTML('beforeend',
      '<div id="' + id + '" class="toast align-items-center text-white ' + bg + ' border-0 mb-2" role="alert">' +
        '<div class="d-flex"><div class="toast-body">' + message + '</div>' +
        '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>'
    );
    var toast = new bootstrap.Toast(document.getElementById(id), { delay: 3000 });
    toast.show();
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    updateNavbar();
    initPasswordStrength();

    var loginFormEl = document.getElementById('login-form-el');
    var regFormEl   = document.getElementById('reg-form-el');
    var logoutBtn   = document.getElementById('logout-btn');

    if (loginFormEl) loginFormEl.addEventListener('submit', handleLogin);
    if (regFormEl)   regFormEl.addEventListener('submit', handleRegister);
    if (logoutBtn)   logoutBtn.addEventListener('click', handleLogout);
  });

})();
