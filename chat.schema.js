import mongoose from "mongoose";

const chatSchema=new mongoose.Schema({
    username:String,
    message:String,
    timestamp:Date,
});

//creating model from the schema
export const ChatModel=mongoose.model('chatmodels',chatSchema);