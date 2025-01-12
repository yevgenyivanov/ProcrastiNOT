import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AbstractList, AbstractListItem } from "../utils/types";

// MongoDB URI (adjust for your setup)
const MONGO_URI =
  "mongodb+srv://cractical2:aqKsMTyCQbxn7Shm@cluster0.ml2xx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your MongoDB URI
const SERVER_PORT = 3000;

// MongoDB connection
mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const app = express();
app.use(express.json());

interface User {
  email: string;
  password: string;
  lists: AbstractList[];
}

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
});

const UserModel = mongoose.model<User>("User", UserSchema);

// Extend the Request interface to include the user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const jwtSecret = process.env.JWT_SECRET || "defaultsecret";
    const token = jwt.sign({ userId: user._id }, jwtSecret);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Register endpoint
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new UserModel({
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Middleware for JWT authentication
const authenticate = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const jwtSecret = process.env.JWT_SECRET || "defaultsecret";
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Pass the user to the next middleware or route handler using res.locals
    res.locals.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// GET /abstract-lists - Fetch user's AbstractLists
app.get(
  "/abstract-lists",
  authenticate,
  async (req: express.Request, res: express.Response) => {
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
  }
);

// POST /abstract-lists - Add a new AbstractList
app.post(
  "/abstract-lists",
  authenticate,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = res.locals.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { title, items } = req.body;

      // Create a new AbstractList
      const newList = new AbstractList(title);
      newList.items = items.map((item: any) =>
        AbstractListItem.fromPlainObject(item)
      );

      user.abstractLists.push(newList);
      await user.save();

      res.status(201).json({ message: "Abstract list added successfully" });
    } catch (error) {
      console.error("Error adding abstract list:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// PUT /abstract-lists/:id - Update an existing AbstractList
app.put("/abstract-lists/:id", authenticate, async (req, res) => {
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
});

// PUT /abstract-lists - Override user's AbstractLists
app.put(
  "/abstract-lists",
  authenticate,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = res.locals.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { abstractLists } = req.body;
      console.log(abstractLists);
      // Validate the input
      if (!Array.isArray(abstractLists)) {
        return res.status(400).json({ message: "Invalid input" });
      }

      // Override the existing abstractLists
      user.abstractLists = abstractLists.map((list: any) => ({
        title: list.title,
        items: list.items.map((item: any) => ({
          text: item.text,
          desc: item.desc,
          date: new Date(item.date),
          completed: item.completed,
        })),
        date: new Date(list.date),
      }));

      await user.save();

      res.status(200).json({ message: "Abstract lists overridden successfully" });
    } catch (error) {
      console.error("Error overriding abstract lists:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

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


app.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});
