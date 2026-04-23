import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export const setupGooglePassport = ({ clientId, clientSecret, callbackUrl }) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: clientId,
        clientSecret,
        callbackURL: callbackUrl,
        scope: ["profile", "email"],
      },
      function (_accessToken, _refreshToken, profile, done) {
        return done(null, profile);
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  return passport;
};
