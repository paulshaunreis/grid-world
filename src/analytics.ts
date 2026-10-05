import posthog from 'posthog-js';

const projectToken = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim();
const apiHost = import.meta.env.VITE_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com';

const allowedEvents = new Set([
  'grid_world_session_started',
  'grid_world_first_interaction',
]);

let initialized = false;

/**
 * Analytics is inert until a project token is configured. Only the two static
 * gameplay events below are accepted, with no player, age, world, URL, or text
 * properties. PostHog keeps the anonymous identifier in memory only.
 */
export function initializeGridAnalytics(): void {
  if (initialized || !projectToken) return;

  posthog.init(projectToken, {
    api_host: apiHost,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    persistence: 'memory',
    ip: false,
    person_profiles: 'never',
    before_send: (event) => {
      if (!event || !allowedEvents.has(event.event)) return null;

      const distinctId = event.properties?.distinct_id;
      event.properties = {
        ...(typeof distinctId === 'string' ? { distinct_id: distinctId } : {}),
        $process_person_profile: false,
      };
      return event;
    },
  });

  initialized = true;
}

export function captureGridAnalytics(event: string): void {
  if (!initialized || !allowedEvents.has(event)) return;
  posthog.capture(event, { $process_person_profile: false });
}
