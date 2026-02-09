/**
 * config.js
 * Application-wide configuration settings and constants.
 */

// Interaction Settings
export const BUTTON_COOLDOWN_MS = 1000;

// API Endpoints
// Note: In production, you might want to switch this automatically
export const RENDER_BACKEND_URL = 'https://resumellm.onrender.com/ask';
export const LOCAL_BACKEND_URL = 'http://localhost:5001/ask';
export const IS_LOCAL_DEVELOPMENT = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

// UI Constants
export const DOWNLOAD_ICON_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
export const NOT_FOUND_COURSE_MESSAGE_START = "i could not find specific details for that course";