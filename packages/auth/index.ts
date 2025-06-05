// Export delle configurazioni principali
export { authOptions } from "./config/authOptions";

// Export delle Server Actions 2FA
export { setup2FA, verify2FA, disable2FA } from "./actions/twoFactorActions";
export { testQRCodeGeneration } from "./actions/testQRCode";
export { simpleTest } from "./actions/simpleTest";

// Export delle Server Actions per le sessioni - NUOVE!
export {
  getUserSessions,
  terminateSession,
  terminateAllOtherSessions,
  updateCurrentSessionInfo,
} from "./actions/sessionActions";

// Export delle altre azioni
export { updateProfile } from "./actions/updateProfile";

// Export dei tipi
export type {} from "./types/next-auth";
