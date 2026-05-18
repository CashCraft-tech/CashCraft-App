import { router } from 'expo-router';

/** Reset stack and go to app entry (index handles permissions + tabs). */
export function navigateToAppHome() {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace('/');
}

/** Reset stack and go to login. */
export function navigateToLogin() {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace('/auth/login');
}

export default function IgnoredRoute() { return null; }
