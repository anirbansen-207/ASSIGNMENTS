
import express from "express";

import authRoutes from "./authRoutes.js";
import adminRoutes from "./adminRoutes.js";
import managerRoutes from "./managerRoutes.js";
import employeeRoutes from "./employeeRoutes.js";
import departmentRoutes from "./departmentRoutes.js";
import teamRoutes from "./teamRoutes.js";
import taskRoutes from "./taskRoutes.js";
import taskCommentRoutes from "./taskCommentRoutes.js";
import taskActivityRoutes from "./taskActivityRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import leaveRoutes from "./leaveRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import extraWorkRoutes from "./extraWorkRoutes.js";
import adminActivityRoutes from "./adminActivityRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/manager", managerRoutes);
router.use("/employee", employeeRoutes);
router.use("/department", departmentRoutes);
router.use("/team", teamRoutes);
router.use("/task", taskRoutes);
router.use("/task-comment", taskCommentRoutes);
router.use("/task-activity", taskActivityRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/leave", leaveRoutes);
router.use("/notification", notificationRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/extra-work", extraWorkRoutes);
router.use("/admin-activity", adminActivityRoutes);

export default router;
