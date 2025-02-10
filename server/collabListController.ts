import { Request, Response } from "express";
import { CollabListModel } from "./schemas";
import { UserModel } from "./schemas";
import { io } from "./server";

export const createCollabList = async (req:Request, res: Response) => {
  try {

    const user = res.locals.user;
    if (!user || !user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title } = req.body;

    const newCollabList = new CollabListModel({
      title,
      owner: user._id,
      members: [user._id],
      date: new Date(),
    });
    await newCollabList.save();

    // Associating the Collaborative List with the User
    user.collabListIds.push(newCollabList._id);
    await user.save();

    res.status(201).json({ message: "Collab list added successfully" });
  } catch (error) {
    console.error("Error adding collab list:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const fetchAllCollabLists = async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const collabLists = await CollabListModel.find({
        _id: { $in: user.collabListIds },
        members: user._id
      });
      res.status(200).json(collabLists);

    } catch (error) {
      console.error("Error fetching abstract lists:", error);
      res.status(500).json({ message: "Server error" });
    }
};

export const getCollabList = async (req: Request, res: Response) => {
  try{
    const user = res.locals.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const collabList = await CollabListModel.findOne({
      _id: id,
      members: user._id
    });

    if (!collabList) {
      return res.status(404).json({ message: "Collab list not found" });
    }
    res.status(200).json(collabList);
  } catch (error) {
    console.error("Error fetching collab list", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCollabList = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { title, items } = req.body;

    const collabList = await CollabListModel.findOne({
      _id: id,
      members: user._id
    });

    if (!collabList) {
      return res.status(404).json({ message: "Collab list not found" });
    }

    if(title) collabList.title = title;
    if(items) collabList.items = items;
    await collabList.save();

    res.status(200).json({ message: "Collab list updated successfully" });
  } catch (error) {
    console.error("Error updating collab list", error);
    res.status(500).json({ message: "Server error" });
  }
}

export const fetchCollabListsIds = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json(user.collabListIds);
  } catch (error) {
    console.error("Error fetching collab list ids", error);
    res.status(500).json({ message: "Server error" });
  }
}

