require('dotenv').config({ path: './.env' });
const express = require("express"); 
const app = express(); 
const connectDb = require("./utils/db");
const cors = require("cors"); 
const MongoStore = require('connect-mongo');
const session = require('express-session');
const PORT = process.env.PORT || 8000; // Define port


app.use(cors({
    origin: ['https://tranquil-dolphin-a28337.netlify.app' ], // Replace with your client origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true, // Enable cookies and other credentials in CORS requests
}));

app.use(session({
    secret: process.env.SESSION_SECRET_KEY, // Store in .env file
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',  // Use 'true' for HTTPS
      sameSite: 'none', // Required for cross-origin requests
      maxAge: 1000 * 60 * 60,  // 1 hour
    }
  }));

const errorMiddleware = require('./Middleware/errorMiddleware');

const cookieParser = require('cookie-parser');
const path = require('path');

const router = require("./Routers/authRouter")
const eventRouter = require("./Routers/eventRouter")
const adminRouter = require("./Routers/adminRouter")

// const participantPdf = require('./routes/participantPdf')
// app.use('/', participantPdf);

app.set("view engine", 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));



app.use("/api/auth", router)
app.use("/api/event", eventRouter)
app.use("/api/admin", adminRouter)

app.use(errorMiddleware)
connectDb().then(()=>{
    app.listen( PORT,()=>{
        console.log("App is listened on the port 8000")
    })
})
