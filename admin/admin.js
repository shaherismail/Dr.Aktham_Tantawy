// admin.js — Application Bootstrap Entry Point
// ============================================================
// This file is intentionally minimal.
// Its only responsibilities are:
//   1. Initialize Supabase connection
//   2. Check authentication state
//   3. Set up the SPA router
//   4. Bind global UI events (theme toggle, search)
//
// All business logic lives in the modules/ directory.
// All Supabase access flows through services/.
// All shared state lives in state/AppState.js.
// ============================================================

import { initConnectionKeys, setupAuthListeners } from './modules/auth.js';
import { setupRouting } from './modules/router.js';
import { setupThemeToggle } from './modules/settings.js';

document.addEventListener('DOMContentLoaded', () => {
    initConnectionKeys();   // Initialize Supabase client + check existing session
    setupAuthListeners();   // Bind login form + logout button
    setupRouting();         // Register hash router + global search input
    setupThemeToggle();     // Bind dark/light mode toggle button
});
