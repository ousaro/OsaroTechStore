// Initialize express router
import router from 'express';

// import passport
import passport from 'passport';
import passportSetUp from "../APIs/googleAuth.js" // this is the file that contains the google strategy essential to make google auth works

// import controller
import { registerUser, loginUser } from '../controllers/userAuthController.js';

// create router
const userAuthRoutes = router();





// routes
    // local auth
userAuthRoutes.post('/register', registerUser);
userAuthRoutes.post('/login', loginUser);

    // google auth
userAuthRoutes.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

userAuthRoutes.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
    function (req, res) {
       
        // Successful authenticati
        if (req.isAuthenticated()) {
            // Successful authentication, redirect to UserType with user info
            res.redirect(`${process.env.CLIENT_URL}/SetPassword?user=${encodeURIComponent(JSON.stringify(req.user))}`);
        } else {
            // Failure case, redirect to home page
            res.redirect(`${process.env.CLIENT_URL}/login`);
        }
      
    });


export default userAuthRoutes;