/**
 * Sentry is only loaded when not in __DEV__ (so staging and production EAS builds).
 * Local "npx expo start" / Expo Go keeps __DEV__ true → Sentry is disabled to avoid crashes.
 *
 * IMPORTANT: initSentry() must be called from the app entry point (index.ts) before
 * any other app code runs. That way crashes (e.g. white screen on launch) are captured.
 *
 * Environments:
 * - EAS "preview" build → Sentry enabled, environment: 'staging'
 * - EAS "production" build → Sentry enabled, environment: 'production'
 */

import Constants from 'expo-constants';

let _sentry: typeof import('sentry-expo') | null = null;

function getSentry() {
  if (__DEV__) return null;
  if (_sentry == null) {
    try {
      _sentry = require('sentry-expo');
    } catch (e) {
      console.warn('sentry-expo load failed:', e);
      return null;
    }
  }
  return _sentry;
}

function getSentryEnvironment(): 'staging' | 'production' {
  try {
    const profile =
      Constants.expoConfig?.extra?.easBuildProfile ??
      (Constants as any).manifest?.extra?.easBuildProfile ??
      (Constants as any).manifest2?.extra?.expoConfig?.extra?.easBuildProfile;
    return profile === 'preview' ? 'staging' : 'production';
  } catch {
    return 'production';
  }
}

const SENTRY_DSN =
  'https://153e5ed50614a93604c7331d8ca788c0@o4510877188685824.ingest.us.sentry.io/4510877220929536';

export function initSentry() {
  if (__DEV__) return;
  try {
    const Sentry = getSentry();
    if (Sentry) {
      Sentry.init({
        dsn: SENTRY_DSN,
        enableInExpoDevelopment: false,
        debug: false,
        environment: getSentryEnvironment(),
        tracesSampleRate: 1.0,
        enableAutoSessionTracking: true,
      });
    }
  } catch (e) {
    console.warn('Sentry init failed:', e);
  }
}

export function captureException(error: unknown, options?: { tags?: Record<string, string>; extra?: Record<string, unknown> }) {
  if (__DEV__) return;
  try {
    const Sentry = getSentry();
    if (Sentry?.React?.captureException) {
      Sentry.React.captureException(error, options);
    }
  } catch (e) {
    console.warn('Sentry captureException failed:', e);
  }
}

/** Call this from a staging or production build to send a test error and verify Sentry. */
export function captureTestEvent(): boolean {
  if (__DEV__) {
    console.warn('Sentry: Test events only send in staging/production builds. Use an EAS preview or production build.');
    return false;
  }
  try {
    const Sentry = getSentry();
    if (Sentry?.React?.captureException) {
      Sentry.React.captureException(new Error('Tandil Sentry test event'), { tags: { test: 'true' } });
      return true;
    }
  } catch (e) {
    console.warn('Sentry test event failed:', e);
  }
  return false;
}
