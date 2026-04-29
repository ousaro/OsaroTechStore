import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export const setupGooglePassport = ({ clientId, clientSecret, callbackUrl }) => {
  passport.use(
    new GoogleStrategy(
      { clientID: clientId, clientSecret, callbackURL: callbackUrl, scope: ["profile", "email"] },
      (_accessToken, _refreshToken, profile, done) => done(null, profile)
    )
  );
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
  return passport;
};
