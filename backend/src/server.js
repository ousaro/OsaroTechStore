import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from "express-session"
import passport from 'passport';
import cors from "cors"
// import routes
import userAuthRoutes from './routes/userAuthRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';



dotenv.config();

// variables
const port = process.env.PORT || 5000;
//const mongoURI = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TEST : process.env.NODE_ENV === 'development' ? process.env.MONGO_URI_DEV : process.env.MONGO_URI;
const username = process.env.MONGO_INITDB_ROOT_USERNAME;
const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
const host = process.env.MONGO_HOST;
const portDb = process.env.MONGO_PORT;
const dbName = process.env.MONGO_DB_NAME;

const mongoURI = `mongodb://${username}:${password}@${host}:${portDb}/${dbName}`;
//const mongoURI = `mongodb://${host}:${portDb}/${dbName}`;

// create express app
const app = express();


// MiddleWare
app.use(express.json({ limit: '50mb' })); // allow using body in post request
app.use(express.urlencoded({ limit: '50mb', extended: true })); // allow using body in post request
app.use(cookieParser()); // allow using cookie in request
app.use(cors()); // allow cross-origin requests

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize())
app.use(passport.session())


app.use((req, res, next) => { // middleware to log the request path and method
    console.log(req.path, req.method)
    next()
})



// import routes
app.use("/api/users/auth", userAuthRoutes);

app.use("/api/users", userRoutes)
 
app.use("/api/products", productRoutes)

app.use("/api/categories", categoryRoutes)

app.use("/api/orders", orderRoutes)

app.use("/api", paymentRoutes)





// connect to db
mongoose.connect(mongoURI)
    .then(()=>{
        // listen for requests
        app.listen(port,()=>{
            console.log("Connect to the database & Listening to the port", port);
    })
    })
    .catch((error)=>{
        console.log(error);
    })


export default app;