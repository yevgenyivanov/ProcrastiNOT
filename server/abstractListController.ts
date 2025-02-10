import { Request, Response } from "express";
import { AbstractList, AbstractListItem } from "../utils/types";


// GET /abstract-lists - Fetch user's AbstractLists
export const getAbstractLists = async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Return the user's abstractLists
      res.status(200).json(user.abstractLists);
    } catch (error) {
      console.error("Error fetching abstract lists:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

// POST /abstract-lists - Add a new AbstractList
export const addAbstractList = async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { title} = req.body;

      // Create a new AbstractList
      const newList = new AbstractList(title);

      user.abstractLists.push(newList);
      await user.save();

      res.status(201).json({ message: "Abstract list added successfully" });
    } catch (error) {
      console.error("Error adding abstract list:", error);
      res.status(500).json({ message: "Server error" });
    }
};


// PUT /abstract-lists/:id - Update an existing AbstractList
export const updateAbstractList =  async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const { id } = req.params;
    const { title, items } = req.body;

    const list = user.abstractLists.id(id);
    if (!list) {
      return res.status(404).json({ message: "Abstract list not found" });
    }

    if (title) list.title = title;
    if (items) list.items = items;

    await user.save();
    res.status(200).json({ message: "Abstract list updated successfully" });
  } catch (error) {
    console.error("Error updating abstract list:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// PUT /abstract-lists - Override user's AbstractLists
// app.put(
//   "/abstract-lists",
//   authenticate,
//   async (req: express.Request, res: express.Response) => {
//     try {
//       const user = res.locals.user;

//       if (!user) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }

//       const { abstractLists } = req.body;
//       console.log(abstractLists);
//       // Validate the input
//       if (!Array.isArray(abstractLists)) {
//         return res.status(400).json({ message: "Invalid input" });
//       }

//       // Override the existing abstractLists
//       user.abstractLists = abstractLists.map((list: any) => ({
//         title: list.title,
//         items: list.items.map((item: any) => ({
//           text: item.text,
//           desc: item.desc,
//           date: new Date(item.date),
//           completed: item.completed,
//         })),
//         date: new Date(list.date),
//       }));

//       await user.save();

//       res.status(200).json({ message: "Abstract lists overridden successfully" });
//     } catch (error) {
//       console.error("Error overriding abstract lists:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );

// DELETE /abstract-lists/:id - Delete an AbstractList
// app.delete("/abstract-lists/:id", authenticate, async (req, res) => {
//   try {
//     const user = res.locals.user;
//     const { id } = req.params;

//     user.abstractLists = user.abstractLists.filter((list) => list._id.toString() !== id);
//     await user.save();

//     res.status(200).json({ message: "Abstract list deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting abstract list:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });