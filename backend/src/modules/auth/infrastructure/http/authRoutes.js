import router from "express";
import {
  passport,
  registerUserHandler,
  loginUserHandler,
  googleCallbackHandler,
} from "../../index.js";

const authRoutes = router();

authRoutes.post("/register", registerUserHandler);
authRoutes.post("/login", loginUserHandler);
authRoutes.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  googleCallbackHandler
);

export default authRoutes;
