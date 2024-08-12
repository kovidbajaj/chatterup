import express from "express";
import { Server } from "socket.io";
import cors from "cors"
import http from "http";
import path from "path";
import dotenv from "dotenv"
import connectToMongoDB from "./db.config.js";
import { UserModel } from "./connectedUsers.schema.js";
import { ChatModel } from "./chat.schema.js";
import ChatterUpController from "./src/controller/chatterup.controller.js";
dotenv.config();


/*
*****************************************************************************


NOTE FOR EVALUATOR->
RELOAD THE PAGE IF WEBPAGE ON FIRST TRY NOT ASK FOR "enter your name" PROMPT


*****************************************************************************
*/


//create an instance of chatterup controller class
const chatterUp=new ChatterUpController;

const app=express();
app.use(express.static(path.join(path.resolve(),'src','views')));


// 1. Create Http server
const server=http.createServer(app);

// 2. Create Socket server
const io=new Server(server,{
    cors:{
        origin:'*',
        methods:["GET","POST"],
    }
})

// 3. Use Socket Events
io.on("connection",(socket)=>{
    // console.log(socket.id);
    console.log("Connection Established");

    socket.on("load_messages",(username)=>{
        ChatModel.find().limit(50).sort({timestamp:1}).then(messages=>{
            socket.emit("load_all_messages",messages)
        }).catch(err=>{
            console.log(err);
        })
    })

    socket.on("notification_sound",()=>{
        socket.broadcast.emit("broadcast_sound");
    })

    socket.on("send_message",async(messageInfo)=>{
        //save the message info in DB
        const{username,message,timestamp}=messageInfo;
       try{
        const chatModel=new ChatModel({
            username:username,
            message:message,
            timestamp:timestamp,
        });
        await chatModel.save();
       }catch(err){
        console.log(err);
       }
        socket.broadcast.emit("broadcast_message",messageInfo);
    })

    socket.on("typing",(username)=>{
        socket.broadcast.emit("broadcasted_typing",username);
    })
    socket.on("stop_typing",(username)=>{
        socket.broadcast.emit("broadcasted_stoptyping",username);
    })

    socket.on('new_user',async (username)=>{
        
            UserModel.find().sort({timestamp:1}).then(usernames=>{
                const info={usernames:usernames,username:username,socketID:socket.id}
                socket.emit('load_usernames',info)
            }).catch(err=>{
                console.log(err);
            })
            // Storing username info along with timestamp in Database
            try{
                const userModel=new UserModel({
                    socketID:socket.id,
                    username:username,
                    timestamp:new Date(),
                })
                await userModel.save();
            }catch(err){
                console.log(err);
            }

        //server will broadcast this name to all connected clients
        const userInfo={
            username:username,
            socketID:socket.id,
        }
        socket.broadcast.emit('broadcasted_user',userInfo);
    })
 
    socket.on("disconnect",async()=>{
        console.log("Connection Disconnected");
        await UserModel.deleteOne({socketID:socket.id});
        const socketID=socket.id;
        socket.broadcast.emit('remove_user',socketID);
    })
})

app.get('/',chatterUp.getView)

// 4. Listen for Http server
server.listen(3000,()=>{
    console.log("Server is running at port 3000");
    connectToMongoDB();
})