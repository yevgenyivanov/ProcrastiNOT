import express from "express";
import { connectDB } from "./database";
import { registerUser, loginUser } from "./userController";
import {
  getAbstractLists,
  addAbstractList,
  updateAbstractList,
} from "./abstractListController";
import { updateCollabList, getCollabList, createCollabList, fetchAllCollabLists,fetchCollabListsIds } from "./collabListController";
import { authenticate } from "./middleware";
import { SERVER_PORT } from "./config";
import { Server } from "socket.io";
import { createServer } from "http";
import axios from "axios";

connectDB();

const app = express();
app.use(express.json());
const io = new Server(1234, { cors: { origin: "*" } });


// 📀 AUTHENTICATION API 📀
app.post("/register", registerUser);
app.post("/login", loginUser);

// 📀 PRIVATE-LISTS API 📀
app.get("/abstract-lists", authenticate, getAbstractLists);
app.post("/abstract-lists", authenticate, addAbstractList);
app.put("/abstract-lists/:id", authenticate, updateAbstractList);

// 📀 COLLABORATIVE-LISTS API 📀
app.post("/create-collab-list", authenticate, createCollabList);
app.get("/get-collab-lists-ids", authenticate, fetchCollabListsIds);
app.get("/get-all-collab-lists", authenticate, fetchAllCollabLists);
app.get("/get-collab-list/:id", authenticate, getCollabList);
app.put("/update-collab-list/:id", authenticate, updateCollabList);


// 📀 SOCKET.IO API 📀

const users: { [key: string]: { userId: string, listIds: string[] } } = {};
const lists: { [listId: string]: string[] } = {};

// TODO: We need to create some function that executes once a user updates a collab lists. The function looks at the lists object and emits some event that includes the updated listId to all sockets in that list. 

// # Once a collab list updates, an end user recieves the emitted event with the out-of-sync listId, which causes him to fetch the updated list from the server.

//TODO: Once a user disconnects, use his socket to gather all his listIds and remove his socket from the lists object.
//If that listId has no more sockets, delete the listId from the lists object.


io.on("connection", (socket) => {
  console.log(`⁇ User Connected: ${socket.id}`);

  socket.on("say-hello", (userId) => {
    socket.join(userId);
    users[socket.id] = { userId: userId,listIds: [] };
    console.log(`🔌 User ${users[socket.id].userId} joined from socket ${socket.id}`);
    socket.on("say-hello", async (userId) => {
      socket.join(userId);
      users[socket.id] = { userId: userId,listIds: [] };
      console.log(`🔌 User ${users[socket.id].userId} joined from socket ${socket.id}`);
    });
  });

  socket.on("event-list", (listId) => {
    socket.join(listId);
    if (!lists[listId]) {
      lists[listId] = [];
    }
    lists[listId].push(socket.id);
    users[socket.id].listIds.push(listId);
    console.log(`📝 List ${listId} joined by socket ${socket.id}`);
  });


  socket.on("disconnect", () => {
    console.log(users);
    console.log(`❌ User Disconnected: ${socket.id}`);
    delete users[socket.id];
    console.log(users);
  });
});

app.listen(SERVER_PORT, () =>
  console.log("✅ Server running on port " + SERVER_PORT)
);

export { io }; // Export `io` for use in other controllers
