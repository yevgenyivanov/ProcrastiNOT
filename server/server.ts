import express from "express";
import { connectDB } from "./database";
import { registerUser, loginUser } from "./userController";
import {
  getAbstractLists,
  addAbstractList,
  updateAbstractList,
} from "./abstractListController";
import { updateCollabList, getCollabList, createCollabList, fetchAllCollabLists,fetchCollabListsIds,joinCollabList,updateRandomItem } from "./collabListController";
import { authenticate } from "./middleware";
import { SERVER_PORT } from "./config";
import { Server } from "socket.io";


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
app.put("/join-collab-list", authenticate, joinCollabList);

app.put("/update-random-item/:id", authenticate, updateRandomItem);

// 📀 SOCKET.IO API 📀

const users: { [key: string]: { userId: string, listIds: string[] } } = {};
const lists: { [listId: string]: string[] } = {};


io.on("connection", (socket) => {
  console.log(`⁇ User Connected: ${socket.id}`);

  socket.on("say-hello", (userId) => {
    socket.join(userId);
    users[socket.id] = { userId: userId,listIds: [] };
    console.log(`🔌 User ${users[socket.id].userId} joined from socket ${socket.id}`);
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
