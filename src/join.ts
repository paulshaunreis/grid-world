import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from './persistence/config';
import { SupabasePersistence } from './persistence/SupabasePersistence';
import { GridAuthService } from './auth/GridAuthService';
import { mountGridAuthPanel } from './ui/GridAuthPanel';

/**
 * Join page: real citizen registration.
 * Mounts the full auth flow (account -> identity -> avatar -> world).
 * If Supabase isn't configured, shows an honest unavailable message.
 */
function init() {
  const statusEl = document.getElementById('join-status');

  if (!supabaseConfigured) {
    if (statusEl) {
      statusEl.innerHTML = `
        <div class="join-notice">
          <h3>Registration is not available yet</h3>
          <p>The citizen account service isn't configured on this deployment.
          You can still explore as a guest.</p>
          <a href="/play.html" class="glass-btn">ENTER AS GUEST</a>
        </div>`;
    }
    return;
  }

  const persistence = new SupabasePersistence(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!);
  const auth = new GridAuthService(persistence.getClient());

  const panel = mountGridAuthPanel(auth, profile => {
    // On successful registration/profile: go to the world.
    const handle = profile.handle || 'citizen';
    window.location.href = `/play.html?citizen=${encodeURIComponent(handle)}`;
  });

  // Auto-open in join mode.
  panel.open('join');

  // "Already have an account" link switches to login.
  document.getElementById('join-login-link')?.addEventListener('click', e => {
    e.preventDefault();
    panel.open('login');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
