import router from "express";
import {
  registerUserHandler,
  loginUserHandler,
  googleCallbackHandler,
} from "../../composition.js";
import { setupGooglePassport } from "../oauth/googlePassport.js";

const authRoutes = router();
const passport = setupGooglePassport({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: process.env.CALLBACK_URL,
});

authRoutes.post("/register", registerUserHandler);
authRoutes.post("/login", loginUserHandler);
authRoutes.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  googleCallbackHandler
);

export default authRoutes;
