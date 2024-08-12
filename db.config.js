import mongoose from "mongoose";

import dotenv from "dotenv"
dotenv.config();
const url=process.env.DB_URL;
async function connectToMongoDB(){
    try{
        await mongoose.connect(url);
        console.log("Mongo DB connnected using Mongoose");
    }catch(err){
        console.log(err);
    }
}
export default connectToMongoDB;