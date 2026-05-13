import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/syncro";
const adminEmail = "admin@task.io";
const adminPassword = "admin123";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["admin", "member"], default: "member" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seedAdmin() {
  await mongoose.connect(MONGODB_URI);

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await User.updateOne(
    { email: adminEmail },
    {
      $set: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin User",
        role: "admin",
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log("Admin account is ready: admin@task.io / admin123");
  await mongoose.disconnect();
}

seedAdmin().catch(async (error) => {
  console.error("Failed to seed admin:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
