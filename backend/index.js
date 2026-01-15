import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import courseRoute from './routes/course.route.js';
import userRoute from './routes/user.route.js';
import adminRoute from './routes/admin.route.js';
import orderRoute from './routes/order.route.js';
import cors from 'cors';

import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';


const app = express();
dotenv.config();
console.log('MONGO_URI:', process.env.MONGO_URI); // Debug: print MONGO_URI

//middleware
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' https://js.stripe.com 'unsafe-inline' blob:;"
  );
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true ,
  debug: true
}));

app.use(cors({
  origin: process.env.FRONTEND_URL, // frontend URL
  credentials: true, // allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // allowed headers
  
}))



const port = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_URI;

try{
  await mongoose.connect(DB_URI)
  console.log("Connected to DB Successfully");
}catch(error){
  console.log("DB Connection Error", error);
}

app.get('/', (req, res) => {
  res.send('Hello Course Selling App!');
});

//defining routes
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin",adminRoute);
app.use("/api/v1/order",orderRoute);

// Configuration
    cloudinary.config({ 
        cloud_name: process.env.cloud_name, 
        api_key: process.env.api_key, 
        api_secret: process.env.api_secret 
    });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});