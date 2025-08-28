import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import connectDB from "./config/db.js";
import User from "./models/user.model.js";

const MONGO_URL = process.env.MONGO_URL;

async function seed() {
  try {
    if (!MONGO_URL) throw new Error("MONGO_URL is required in .env");
    await connectDB(MONGO_URL);

    const users = [
      { username: process.env.USER1_NAME, password: process.env.USER1_PASS, role: "admin" },
      { username: process.env.USER2_NAME, password: process.env.USER2_PASS, role: "user" },
      { username: process.env.USER3_NAME, password: process.env.USER3_PASS, role: "user" },
      { username: process.env.USER4_NAME, password: process.env.USER4_PASS, role: "user" },
      { username: process.env.USER5_NAME, password: process.env.USER5_PASS, role: "user" },
    ];

    for (const u of users) {
      if (!u.username || !u.password) {
        console.log(`Skipping invalid entry: ${JSON.stringify(u)}`);
        continue;
      }

      const exists = await User.findOne({ username: u.username });
      if (exists) {
        console.log(`Skipping existing user: ${u.username}`);
        continue;
      }

      const hashed = await bcrypt.hash(u.password, 10);
      const user = new User({
        username: u.username,
        password: hashed,
        role: u.role,
      });

      await user.save();
      console.log(`✅ Created user: ${u.username}`);
    }

    console.log("🎉 Seeding done");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error while seeding:", err.message);
    process.exit(1);
  }
}

seed();
