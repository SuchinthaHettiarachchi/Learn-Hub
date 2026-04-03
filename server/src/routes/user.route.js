
import express from "express"
import { getUser, Login, Logout, Register, updateProfile, getAllUsers, createUser, updateUser, deleteUser } from "../controllers/user.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.js";


const userRoute = express.Router();


userRoute.post("/register", Register);
userRoute.post("/login", Login);
userRoute.get("/getUser", protectRoute, getUser);
userRoute.post("/logout", protectRoute, Logout);
userRoute.post('/updateProfile', protectRoute, upload.single("profilePhoto"), updateProfile);

// Admin-only user management routes
userRoute.get("/admin/users", protectRoute, adminRoute, getAllUsers);
userRoute.post("/admin/users", protectRoute, adminRoute, createUser);
userRoute.put("/admin/users/:id", protectRoute, adminRoute, updateUser);
userRoute.delete("/admin/users/:id", protectRoute, adminRoute, deleteUser);


export default userRoute;
