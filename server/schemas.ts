import mongoose from "mongoose";
import { AbstractList, AbstractListItem } from "../utils/types";

// 💡 Defining Schemas 💡
// These define the structure of documents within our database (MONGODB)
// In other words, it acts as a blueprint.

const AbstractListItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  desc: { type: String },
  date: { type: Date, required: true },
  completed: { type: Boolean, required: true },
});

const AbstractListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: [AbstractListItemSchema],
  date: { type: Date, required: true },
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  abstractLists: [AbstractListSchema],
  collabListIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "CollabList" }],
});

const CollabListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required:true },
  items: [AbstractListItemSchema],
  date: { type: Date, required: true },
});

// 💡 Defining Models 💡
// As a way for TS to enforce the structure, we first define interfaces identical to the schemas.
// Models are used to interact with the database (query, insert, update, delete).
// Example:
// const UserModel = mongoose.model<IUser>("User", UserSchema);
// Here, "User" would be our collection name and will use the UserSchema blueprint as a reference.
// and <IUser> is the interface we defined earlier.
// Once we have the UserModel set up, we can then execute functions like:
// const user = await UserModel.findOne({ email });

interface IUser {
  email: string; 
  password: string; 
  abstractLists: AbstractList[];  
  collabListIds: mongoose.Types.ObjectId[];  
}

interface ICollabList {
  title: string;  
  members: mongoose.Types.ObjectId[];  
  owner: mongoose.Types.ObjectId;  
  items: AbstractListItem[];  
  date: Date; 
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
export const CollabListModel = mongoose.model<ICollabList>("CollabList", CollabListSchema);
