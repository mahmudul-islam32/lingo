/** Public API of the auth feature (PLT-010 …). Import from `@/features/auth` only. */
export { AUTH_COPY, AUTH_ERROR_MESSAGES, checkInboxText } from "./messages";
export { isNetworkError, mapAuthError } from "./errors";
export {
  isValidEmail,
  isValidPassword,
  MIN_PASSWORD_LENGTH,
  validateCredentials,
} from "./validation";
export {
  AUTH_CALLBACK_PATH,
  callbackUrl,
  exchangeCode,
  logInWithEmail,
  signUpWithEmail,
  type ClientLoader,
  type LogInOutcome,
  type SignUpOutcome,
} from "./email-auth";
export { finishSignIn, type FinishSignInOptions, type SignInMethod } from "./finish-sign-in";
export {
  createSessionStore,
  sessionStore,
  useSession,
  type SessionState,
  type SessionStatus,
  type SessionStoreDeps,
  type SessionUser,
  type SessionView,
} from "./session-store";
export { SessionBootstrap } from "./SessionBootstrap";
export { SignUpScreen, CheckInbox } from "./components/SignUpScreen";
export { LogInScreen } from "./components/LogInScreen";
export { AuthCallbackScreen, readCallbackParams } from "./components/AuthCallbackScreen";
export { logInHref, signUpHref } from "./components/EmailAuthForm";
