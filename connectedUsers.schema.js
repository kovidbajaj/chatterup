import mongoose from "mongoose";

const usersSchema=new mongoose.Schema({
    socketID:String,
    username:String,
    timestamp:Date,
});

// creating models from the schema
export const UserModel=mongoose.model('usermodel',usersSchema);