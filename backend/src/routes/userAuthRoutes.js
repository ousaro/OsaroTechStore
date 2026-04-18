// Initialize express router
import router from 'express';
import {
  passport,
  registerUserHandler,
  loginUserHandler,
  googleCallbackHandler,
} from '../modules/auth/index.js';

// create router
const userAuthRoutes = router();

// routes
// local auth
userAuthRoutes.post('/register', registerUserHandler);
userAuthRoutes.post('/login', loginUserHandler);

// google auth
userAuthRoutes.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
userAuthRoutes.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
    googleCallbackHandler
);

export default userAuthRoutes;
