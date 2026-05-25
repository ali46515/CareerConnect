// src/middleware/helmet.js
import helmet from "helmet";

export const securityHeaders = helmet({
  contentSecurityPolicy: false, // can be customized per project
  referrerPolicy: { policy: "no-referrer" },
  hidePoweredBy: true,
});
