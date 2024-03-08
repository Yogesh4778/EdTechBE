import Redis from "ioredis";
import { app } from "./app";
import connectDB from "./utils/Database";
import { v2 as cloudinary} from "cloudinary"
require("dotenv").config();
// const port = process.env.PORT || 8000;

//cloudinary config
cloudinary.config({
cloud_name:process.env.CLOUD_NAME,
api_key:process.env.CLOUD_API_KEY,
secret_key:process.env.CLOUD_SECRET_KEY
})

//create server
app.listen(process.env.PORT , ()=>{
console.log(`Server is connect to ${process.env.PORT}`);
connectDB();
})

