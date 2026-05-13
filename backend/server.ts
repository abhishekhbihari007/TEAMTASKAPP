import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const PORT = 3000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/syncro";
const JWT_SECRET = process.env.JWT_SECRET || "temp_secret_key_for_dev_change_me_in_secrets";

async function startServer() {
  const app = express();
  
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "operational", DB: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" });
  });

  // --- Models ---
  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    createdAt: { type: Date, default: Date.now }
  });
  const User = mongoose.model("User", userSchema);

  const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now }
  });
  const Project = mongoose.model("Project", projectSchema);

  const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["todo", "in-progress", "completed", "overdue"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    dueDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
  });
  const Task = mongoose.model("Task", taskSchema);

  // MongoDB Connection
  if (MONGODB_URI.includes("127.0.0.1") || MONGODB_URI.includes("localhost")) {
    console.warn("⚠️  DATABASE WARNING: Running with local MongoDB fallback. If you are in production (Cloud Run), this WILL fail.");
    console.warn("👉 Action Required: Add 'MONGODB_URI' to the AI Studio Secrets panel.");
  }

  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log("Connected to MongoDB Atlas");
      // Seed default admin for evaluation
      const adminEmail = "admin@task.io";
      const existingAdmin = await User.findOne({ email: adminEmail });
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const admin = new User({
          email: adminEmail,
          password: hashedPassword,
          name: "Admin User",
          role: "admin"
        });
        await admin.save();
        console.log("Default Admin created: admin@task.io / admin123");
      }
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
    });

  // --- Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name are required" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword, name, role: "member" });
      await user.save();
      res.status(201).json({ message: "User created" });
    } catch (error: any) {
      if (error.code === 11000) return res.status(400).json({ error: "Email already exists" });
      next(error);
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (role && !["admin", "member"].includes(role)) {
        return res.status(400).json({ error: "Invalid role selected" });
      }
      if (role && user.role !== role) {
        return res.status(403).json({ error: `This account is not registered as ${role}` });
      }
      const token = jwt.sign({ userId: user._id, role: user.role, name: user.name }, JWT_SECRET);
      res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      next(error);
    }
  });

  // Projects
  app.get("/api/projects", authenticateToken, async (req: any, res, next) => {
    try {
      const projects = await Project.find({
        $or: [{ owner: req.user.userId }, { members: req.user.userId }]
      }).populate("owner", "name email");
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects/:id", authenticateToken, async (req: any, res, next) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate("owner", "name email")
        .populate("members", "name email");
      if (!project) return res.status(404).json({ error: "Project not found" });
      res.json(project);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/projects", authenticateToken, async (req: any, res, next) => {
    try {
      if (req.user.role !== "admin") return res.status(403).json({ error: "Only admins can create projects" });
      const project = new Project({ ...req.body, owner: req.user.userId });
      await project.save();
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/projects/:id", authenticateToken, async (req: any, res, next) => {
    try {
      if (req.user.role !== "admin") return res.status(403).json({ error: "Only admins can update projects" });
      const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate("members", "name email");
      if (!project) return res.status(404).json({ error: "Project not found" });
      res.json(project);
    } catch (error) {
      next(error);
    }
  });

  // Users
  app.get("/api/users", authenticateToken, async (req: any, res, next) => {
    try {
      const users = await User.find({}, "name email role");
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  // Tasks
  app.get("/api/tasks", authenticateToken, async (req: any, res, next) => {
    try {
      const tasks = await Task.find({ project: req.query.projectId }).populate("assignee", "name email");
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/tasks/dashboard", authenticateToken, async (req: any, res, next) => {
    try {
      let taskQuery: any = {};
      if (req.user.role !== "admin") {
        // Show all tasks in projects the member belongs to
        const memberProjects = await Project.find({
          $or: [{ owner: req.user.userId }, { members: req.user.userId }]
        }).select("_id");
        const projectIds = memberProjects.map((p: any) => p._id);
        taskQuery = { project: { $in: projectIds } };
      }
      const tasks = await Task.find(taskQuery)
        .populate("project", "name")
        .populate("assignee", "name email")
        .sort({ createdAt: -1 });
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tasks", authenticateToken, async (req: any, res, next) => {
    try {
      const task = new Task(req.body);
      await task.save();
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/tasks/:id", authenticateToken, async (req: any, res, next) => {
    try {
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!task) return res.status(404).json({ error: "Task not found" });
      res.json(task);
    } catch (error) {
      next(error);
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.join(process.cwd(), "client"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "client", "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // --- Global Error Handler ---
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} →`, err.message);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ error: err.message || "Internal server error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
