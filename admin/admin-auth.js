/**
 * Авторизация админ-панели MalSu — sessionStorage.
 * Учётные данные хранятся в настройках (localStorage).
 */
window.AdminAuth = {
  SESSION_KEY: "malsu-admin-auth",

  DEFAULT_CREDENTIALS: {
    login: "admin",
    password: "admin123",
  },

  getCredentials() {
    const raw = window.SettingsService?.getRaw?.() || {};
    const auth = raw.adminAuth || {};
    return {
      login: auth.login || this.DEFAULT_CREDENTIALS.login,
      password: auth.password || this.DEFAULT_CREDENTIALS.password,
    };
  },

  isAuthenticated() {
    return sessionStorage.getItem(this.SESSION_KEY) === "1";
  },

  login(username, password) {
    const creds = this.getCredentials();
    if (username === creds.login && password === creds.password) {
      sessionStorage.setItem(this.SESSION_KEY, "1");
      return true;
    }
    return false;
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    window.location.href = "login.html";
  },

  requireAuth() {
    if (this.isAuthenticated()) return true;
    const loginPath = window.location.pathname.endsWith("login.html")
      ? "login.html"
      : "login.html";
    window.location.href = loginPath;
    return false;
  },

  redirectIfAuthenticated() {
    if (this.isAuthenticated()) {
      window.location.href = "index.html";
    }
  },
};
