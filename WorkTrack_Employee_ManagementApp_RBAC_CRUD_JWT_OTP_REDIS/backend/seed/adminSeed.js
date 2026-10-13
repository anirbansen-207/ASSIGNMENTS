import dotenv from "dotenv";
import connectDB from "../app/config/db.js";
import User from "../app/models/User.js";
import hashedPassword from "../app/utils/hashedPassword.js";

// .env configuration
dotenv.config();

// create admin
const createAdmin = async () => {
  try {
    // connect to database
    await connectDB();

    // check if admin exists
    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (admin) {
      console.log("Admin already exists");
      return;
    }

    // create admin
    const hashedPwd = await hashedPassword(process.env.ADMIN_PASSWORD);

    const adminUser = await User.create({
      name: "HR Admin 1",
      email: process.env.ADMIN_EMAIL,
      password: hashedPwd,
      role: "admin",
      department: "Administration",
      designation: "HR Admin",
      isVerified: true,
    });

    console.log("Admin created");

    return adminUser;
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

createAdmin();
