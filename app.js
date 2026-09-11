/**
 * Steelcase Media Plan Proposal
 * - User Authentication (Registration & Login)
 * - Inline Editable Content Engine
 * - Dynamic Customizable Dropdowns with "+ Add Item"
 * - Theme, Print, and Navigation Management
 */

// Global State
const APP_STATE = {
  currentUser: null,
  isEditMode: false,
  activeDropdownElement: null,
  activeDropdownGroup: null
};

// Default Dropdown Option Sets
const DEFAULT_DROPDOWNS = {
  markets: ["India", "Singapore", "China"],
  platforms: ["LinkedIn LeadGen", "Meta / IG", "Pinterest", "WeChat"],
  priorities: ["High", "Medium", "Low-med", "Low"],
  offers: [
    "Work Better Magazine",
    "Work Better Magazine download",
    "Work Better Magazine download or webinar invite",
    "Work Better Magazine Download",
    "Follow Official Account + Work Better Magazine"
  ]
};

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initPrintButton();
  initScrollSpy();
  initDropdownStorage();
  initAuthManager();
  initContentHydration();
  initContentEditor();
  initDropdownManager();
  initDataActions();
});

/* ==========================================================================
   1. Theme Toggle & ScrollSpy
   ========================================================================== */

function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  const savedTheme = localStorage.getItem('steelcase_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'night' || (!savedTheme && prefersDark)) {
    body.classList.remove('theme-light');
    body.classList.add('theme-night');
  } else {
    body.classList.remove('theme-night');
    body.classList.add('theme-light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isNight = body.classList.contains('theme-night');
      if (isNight) {
        body.classList.remove('theme-night');
        body.classList.add('theme-light');
        localStorage.setItem('steelcase_theme', 'light');
      } else {
        body.classList.remove('theme-light');
        body.classList.add('theme-night');
        localStorage.setItem('steelcase_theme', 'night');
      }
    });
  }
}

function initPrintButton() {
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }
}

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const outlineLinks = document.querySelectorAll('.outline-link');
  if (!sections.length || !outlineLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        outlineLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  sections.forEach(sec => observer.observe(sec));
}

/* ==========================================================================
   2. Authentication System (Registration, Password Hashing, Login, Session)
   ========================================================================== */

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getUsers() {
  const users = localStorage.getItem('steelcase_auth_users');
  return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
  localStorage.setItem('steelcase_auth_users', JSON.stringify(users));
}

async function seedDefaultUserIfEmpty() {
  const users = getUsers();
  if (Object.keys(users).length === 0) {
    const adminHash = await hashPassword('admin123');
    users['admin@steelcase.com'] = {
      email: 'admin@steelcase.com',
      passwordHash: adminHash,
      createdAt: new Date().toISOString()
    };
    saveUsers(users);
  }
}

function initAuthManager() {
  seedDefaultUserIfEmpty();

  const authModal = document.getElementById('authModal');
  const openAuthModalBtn = document.getElementById('openAuthModalBtn');
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  const tabSignIn = document.getElementById('tabSignIn');
  const tabRegister = document.getElementById('tabRegister');
  const authForm = document.getElementById('authForm');
  const authEmail = document.getElementById('authEmail');
  const authPassword = document.getElementById('authPassword');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const authErrorMsg = document.getElementById('authErrorMsg');
  const passwordHint = document.getElementById('passwordHint');
  const authBar = document.getElementById('authBar');
  const userEmailDisplay = document.getElementById('userEmailDisplay');
  const logoutBtn = document.getElementById('logoutBtn');
  const editModeCheckbox = document.getElementById('editModeCheckbox');

  let isRegisterTab = false;

  // Restore existing session
  const savedSession = localStorage.getItem('steelcase_auth_session');
  if (savedSession) {
    try {
      const session = JSON.parse(savedSession);
      APP_STATE.currentUser = session;
      updateAuthUI();
    } catch (e) {
      localStorage.removeItem('steelcase_auth_session');
    }
  }

  // Open / Close Modal
  if (openAuthModalBtn) {
    openAuthModalBtn.addEventListener('click', () => {
      authModal.style.display = 'flex';
      clearAuthErrors();
      authEmail.focus();
    });
  }

  if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener('click', () => {
      authModal.style.display = 'none';
    });
  }

  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      authModal.style.display = 'none';
    }
  });

  // Switch tabs
  tabSignIn.addEventListener('click', () => {
    isRegisterTab = false;
    tabSignIn.classList.add('active');
    tabRegister.classList.remove('active');
    authSubmitBtn.textContent = 'Sign In';
    modalSubtitle.textContent = 'Sign in to edit titles, descriptions, and custom dropdowns.';
    passwordHint.style.display = 'none';
    clearAuthErrors();
  });

  tabRegister.addEventListener('click', () => {
    isRegisterTab = true;
    tabRegister.classList.add('active');
    tabSignIn.classList.remove('active');
    authSubmitBtn.textContent = 'Create Account';
    modalSubtitle.textContent = 'Create an editor account with your work email and password.';
    passwordHint.style.display = 'block';
    clearAuthErrors();
  });

  function clearAuthErrors() {
    authErrorMsg.style.display = 'none';
    authErrorMsg.textContent = '';
  }

  function showAuthError(msg) {
    authErrorMsg.textContent = msg;
    authErrorMsg.style.display = 'block';
  }

  // Form Submission
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthErrors();

    const email = authEmail.value.trim().toLowerCase();
    const password = authPassword.value;

    if (!email || !email.includes('@')) {
      showAuthError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      showAuthError('Password must be at least 6 characters.');
      return;
    }

    const users = getUsers();
    const hash = await hashPassword(password);

    if (isRegisterTab) {
      // Register New Account
      if (users[email]) {
        showAuthError('An account with this email already exists. Please Sign In.');
        return;
      }

      users[email] = {
        email: email,
        passwordHash: hash,
        createdAt: new Date().toISOString()
      };
      saveUsers(users);

      // Log in immediately
      const session = { email, loggedInAt: new Date().toISOString() };
      localStorage.setItem('steelcase_auth_session', JSON.stringify(session));
      APP_STATE.currentUser = session;

      authModal.style.display = 'none';
      authForm.reset();
      updateAuthUI();
      showToast(`Welcome! Account created for ${email}`);
    } else {
      // Sign In Existing Account
      const user = users[email];
      if (!user) {
        showAuthError('No account found with this email. Please create an account.');
        return;
      }

      if (user.passwordHash !== hash) {
        showAuthError('Incorrect password. Please try again.');
        return;
      }

      const session = { email, loggedInAt: new Date().toISOString() };
      localStorage.setItem('steelcase_auth_session', JSON.stringify(session));
      APP_STATE.currentUser = session;

      authModal.style.display = 'none';
      authForm.reset();
      updateAuthUI();
      showToast(`Signed in as ${email}`);
    }
  });

  // Log Out
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('steelcase_auth_session');
      APP_STATE.currentUser = null;
      setEditMode(false);
      updateAuthUI();
      showToast('Logged out successfully.');
    });
  }

  // Edit Mode Checkbox Toggle
  if (editModeCheckbox) {
    editModeCheckbox.addEventListener('change', (e) => {
      if (!APP_STATE.currentUser) {
        e.target.checked = false;
        authModal.style.display = 'flex';
        showAuthError('You must sign in or create an account to enable Edit Mode.');
        return;
      }
      setEditMode(e.target.checked);
    });
  }

  function updateAuthUI() {
    if (APP_STATE.currentUser) {
      openAuthModalBtn.style.display = 'none';
      authBar.style.display = 'flex';
      userEmailDisplay.textContent = APP_STATE.currentUser.email;
      // Default to enabling Edit Mode once logged in
      setEditMode(true);
      editModeCheckbox.checked = true;
    } else {
      openAuthModalBtn.style.display = 'inline-flex';
      authBar.style.display = 'none';
      setEditMode(false);
      editModeCheckbox.checked = false;
    }
  }
}

function setEditMode(active) {
  APP_STATE.isEditMode = active;
  const notice = document.getElementById('editModeNotice');
  const checkbox = document.getElementById('editModeCheckbox');

  if (checkbox) checkbox.checked = active;

  if (active) {
    document.body.classList.add('edit-mode-active');
    if (notice) notice.style.display = 'block';
  } else {
    document.body.classList.remove('edit-mode-active');
    if (notice) notice.style.display = 'none';
    closeDropdownPopup();
  }
}

/* ==========================================================================
   3. Content Hydration & Inline Text Editing
   ========================================================================== */

function getStoredEdits() {
  const edits = localStorage.getItem('steelcase_content_edits');
  return edits ? JSON.parse(edits) : {};
}

function saveStoredEdits(edits) {
  localStorage.setItem('steelcase_content_edits', JSON.stringify(edits));
}

function initContentHydration() {
  const edits = getStoredEdits();
  if (Object.keys(edits).length === 0) return;

  // Hydrate text elements
  document.querySelectorAll('[data-edit-key]').forEach(el => {
    const key = el.getAttribute('data-edit-key');
    if (edits[key] !== undefined) {
      el.textContent = edits[key];
    }
  });
}

function initContentEditor() {
  document.querySelectorAll('.editable-target').forEach(el => {
    el.addEventListener('click', (e) => {
      if (!APP_STATE.isEditMode) return;
      if (el.isContentEditable) return;

      activateInlineEditing(el);
    });
  });
}

function activateInlineEditing(el) {
  el.contentEditable = 'true';
  el.focus();

  // Select all text on focus if short text
  const isMultiline = el.getAttribute('data-edit-type') === 'multiline';
  if (!isMultiline) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  let originalText = el.textContent;

  function commitEdit() {
    el.contentEditable = 'false';
    const newText = el.textContent.trim();
    const key = el.getAttribute('data-edit-key');

    if (newText !== originalText && key) {
      const edits = getStoredEdits();
      edits[key] = newText;
      saveStoredEdits(edits);
      showToast('Changes auto-saved');
    }
    cleanupListeners();
  }

  function cancelEdit() {
    el.contentEditable = 'false';
    el.textContent = originalText;
    cleanupListeners();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    } else if (e.key === 'Enter') {
      if (!isMultiline) {
        e.preventDefault();
        commitEdit();
      } else if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        commitEdit();
      }
    }
  }

  function onBlur() {
    commitEdit();
  }

  function cleanupListeners() {
    el.removeEventListener('keydown', onKeyDown);
    el.removeEventListener('blur', onBlur);
  }

  el.addEventListener('keydown', onKeyDown);
  el.addEventListener('blur', onBlur);
}

/* ==========================================================================
   4. Dynamic Customizable Dropdowns with "+ Add Item"
   ========================================================================== */

function initDropdownStorage() {
  const stored = localStorage.getItem('steelcase_dropdown_options');
  if (!stored) {
    localStorage.setItem('steelcase_dropdown_options', JSON.stringify(DEFAULT_DROPDOWNS));
  }
}

function getDropdownOptions(group) {
  const stored = localStorage.getItem('steelcase_dropdown_options');
  const all = stored ? JSON.parse(stored) : DEFAULT_DROPDOWNS;
  return all[group] || DEFAULT_DROPDOWNS[group] || [];
}

function addDropdownOption(group, newOption) {
  const stored = localStorage.getItem('steelcase_dropdown_options');
  const all = stored ? JSON.parse(stored) : DEFAULT_DROPDOWNS;
  if (!all[group]) all[group] = [];

  const trimmed = newOption.trim();
  if (trimmed && !all[group].includes(trimmed)) {
    all[group].push(trimmed);
    localStorage.setItem('steelcase_dropdown_options', JSON.stringify(all));
  }
}

function initDropdownManager() {
  const popup = document.getElementById('customDropdownPopup');
  const closeBtn = document.getElementById('closeDropdownPopupBtn');
  const addBtn = document.getElementById('addDropdownOptionBtn');
  const addInput = document.getElementById('newDropdownOptionInput');

  // Close button
  if (closeBtn) closeBtn.addEventListener('click', closeDropdownPopup);

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!popup || popup.style.display === 'none') return;
    if (popup.contains(e.target)) return;
    if (APP_STATE.activeDropdownElement && APP_STATE.activeDropdownElement.contains(e.target)) return;
    closeDropdownPopup();
  });

  // Add new option click handler
  function handleAddOption() {
    const val = addInput.value.trim();
    if (!val || !APP_STATE.activeDropdownGroup || !APP_STATE.activeDropdownElement) return;

    addDropdownOption(APP_STATE.activeDropdownGroup, val);
    applyDropdownSelection(val);
    addInput.value = '';
    closeDropdownPopup();
    showToast(`Added option "${val}"`);
  }

  if (addBtn) addBtn.addEventListener('click', handleAddOption);
  if (addInput) {
    addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddOption();
      } else if (e.key === 'Escape') {
        closeDropdownPopup();
      }
    });
  }

  // Attach listener to all dropdown cells
  document.querySelectorAll('.editable-dropdown').forEach(el => {
    el.addEventListener('click', (e) => {
      if (!APP_STATE.isEditMode) return;
      e.stopPropagation();
      openDropdownPopup(el);
    });
  });
}

function openDropdownPopup(targetEl) {
  const popup = document.getElementById('customDropdownPopup');
  const titleEl = document.getElementById('dropdownGroupLabel');
  const container = document.getElementById('dropdownOptionsContainer');
  const addInput = document.getElementById('newDropdownOptionInput');

  const group = targetEl.getAttribute('data-dropdown-group');
  if (!group) return;

  APP_STATE.activeDropdownElement = targetEl;
  APP_STATE.activeDropdownGroup = group;

  // Title
  titleEl.textContent = `Select ${group.charAt(0).toUpperCase() + group.slice(1)}`;
  addInput.placeholder = `+ Add new ${group.slice(0, -1)}...`;
  addInput.value = '';

  // Render options
  const options = getDropdownOptions(group);
  const currentValue = targetEl.textContent.trim();

  container.innerHTML = '';
  options.forEach(opt => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    if (opt.toLowerCase() === currentValue.toLowerCase()) {
      item.classList.add('selected');
    }

    item.innerHTML = `
      <span>${opt}</span>
      ${opt.toLowerCase() === currentValue.toLowerCase() ? '<span class="dropdown-item-check">✓</span>' : ''}
    `;

    item.addEventListener('click', () => {
      applyDropdownSelection(opt);
      closeDropdownPopup();
    });

    container.appendChild(item);
  });

  // Position popup relative to targetEl
  popup.style.display = 'flex';
  const rect = targetEl.getBoundingClientRect();
  const popupWidth = 280;
  const viewportWidth = window.innerWidth;

  let left = rect.left;
  if (left + popupWidth > viewportWidth - 20) {
    left = viewportWidth - popupWidth - 20;
  }

  let top = rect.bottom + 6;
  if (top + 300 > window.innerHeight) {
    top = Math.max(10, rect.top - 310);
  }

  popup.style.left = `${Math.max(10, left)}px`;
  popup.style.top = `${top}px`;
}

function applyDropdownSelection(value) {
  const el = APP_STATE.activeDropdownElement;
  if (!el) return;

  el.textContent = value;
  const key = el.getAttribute('data-edit-key');
  if (key) {
    const edits = getStoredEdits();
    edits[key] = value;
    saveStoredEdits(edits);
    showToast(`Updated to "${value}"`);
  }

  // Adjust badge classes if priority
  const group = el.getAttribute('data-dropdown-group');
  if (group === 'priorities') {
    el.classList.remove('high', 'medium', 'low-med', 'low');
    const valLower = value.toLowerCase();
    if (valLower.includes('high')) el.classList.add('high');
    else if (valLower.includes('med')) el.classList.add('medium');
    else el.classList.add('low');
  }
}

function closeDropdownPopup() {
  const popup = document.getElementById('customDropdownPopup');
  if (popup) popup.style.display = 'none';
  APP_STATE.activeDropdownElement = null;
  APP_STATE.activeDropdownGroup = null;
}

/* ==========================================================================
   5. Data Reset, Export, and Toast Notifications
   ========================================================================== */

function initDataActions() {
  const resetBtn = document.getElementById('resetDataBtn');
  const exportBtn = document.getElementById('exportDataBtn');

  // Reset to default original proposal data
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all customized edits and dropdowns back to original default proposal data?')) {
        localStorage.removeItem('steelcase_content_edits');
        localStorage.removeItem('steelcase_dropdown_options');
        location.reload();
      }
    });
  }

  // Export current customized data as JSON file
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const exportData = {
        meta: {
          project: "Steelcase Media Plan (ID, CN, SG) July 2026",
          exportedBy: APP_STATE.currentUser ? APP_STATE.currentUser.email : 'guest',
          exportedAt: new Date().toISOString()
        },
        contentEdits: getStoredEdits(),
        customDropdowns: {
          markets: getDropdownOptions('markets'),
          platforms: getDropdownOptions('platforms'),
          priorities: getDropdownOptions('priorities'),
          offers: getDropdownOptions('offers')
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `steelcase_mediaplan_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Proposal exported as JSON.');
    });
  }
}

function showToast(message) {
  const toast = document.getElementById('saveToast');
  const textEl = document.getElementById('saveToastText');
  if (!toast || !textEl) return;

  textEl.textContent = message;
  toast.style.display = 'flex';

  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.style.display = 'none';
  }, 2400);
}
