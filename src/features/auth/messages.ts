/** Copy of the auth screens (PLT-010). One message per `AuthErrorCode`, never server text. */
import type { AuthErrorCode } from "@/contracts";

export const AUTH_COPY = {
  signUpTitle: "Create your account",
  logInTitle: "Welcome back",
  email: "Email",
  password: "Password",
  passwordHint: "At least 8 characters",
  createAccount: "Create account",
  creatingAccount: "Creating your account…",
  logIn: "Log in",
  loggingIn: "Logging in…",
  haveAccount: "Already have an account?",
  noAccount: "New to Polyglow?",
  logInInstead: "Log in instead",
  forgotPassword: "Forgot password?",
  showPassword: "Show password",
  offline: "You're offline. Connect to the internet to sign up or log in.",
  invalidEmail: "Enter a valid email address.",
  shortPassword: "Use at least 8 characters.",
  missingPassword: "Enter your password.",
  checkInboxTitle: "Check your inbox",
  backToLearn: "Back to Learn",
  signingIn: "Signing you in…",
  savingProgress: "Saving your progress…",
  progressSaved: "Your progress is saved.",
  saveFailed: "We couldn't save your progress yet. It's safe on this device.",
  tryAgain: "Try again",
  continue: "Continue",
  otherAccount:
    "This device is signed in to another account. Log out in Profile first, then log in again.",
  savePromptTitle: "Save your progress",
  savePromptText: "Create an account to keep your XP, streak and goal date on every device.",
  notNow: "Not now",
  close: "Close",
} as const;

/** "Open the link we sent to <email> to finish creating your account." (criterion 7). */
export function checkInboxText(email: string): string {
  return `Open the link we sent to ${email} to finish creating your account.`;
}

/** Shown above the button for a server error (criteria 5 and 6). */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: "That email and password don't match.",
  email_not_confirmed:
    "Please confirm your email first. Open the link we sent you, then log in again.",
  email_taken: "There's already an account with this email.",
  weak_password: "Use at least 8 characters.",
  rate_limited: "Too many attempts. Please wait a minute and try again.",
  network: "We couldn't reach Polyglow. Check your connection and try again.",
  provider_disabled: "This way of signing in isn't available right now. Use your email.",
  link_expired: "This link has expired. Request a new one.",
  session_expired: "Your session has ended. Please log in again.",
  unknown: "Something went wrong. Please try again.",
};
