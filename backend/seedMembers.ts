import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/syncro";
const defaultPassword = "member123";

const members = [
  { name: "Demo Member One", email: "member1@task.io" },
  { name: "Demo Member Two", email: "member2@task.io" },
  { name: "Demo Member Three", email: "member3@task.io" },
  { name: "Demo Member Four", email: "member4@task.io" },
];

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["admin", "member"], default: "member" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seedMembers() {
  await mongoose.connect(MONGODB_URI);

  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  for (const member of members) {
    await User.updateOne(
      { email: member.email },
      {
        $set: {
          ...member,
          password: hashedPassword,
          role: "member",
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  console.log(`Seeded ${members.length} test members. Password for each: ${defaultPassword}`);
  await mongoose.disconnect();
}

seedMembers().catch(async (error) => {
  console.error("Failed to seed members:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
