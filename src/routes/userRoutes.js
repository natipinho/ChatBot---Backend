//express framework import
import express from "express"

//import controller to define routes
import * as userController from "../controllers/userController.js"
import * as taskController from "../controllers/taskController.js"

//import middleware to check if user exists
import { checkUserExists } from "../middlewares/checkUserExists.js"

//creates an instance to start the routes below
const router = express.Router()

//user routes
router.get ("/", userController.getUsers)
router.get("/stats", userController.getUserStats)
router.post ("/", userController.createUsers)
router.get("/:id/tasks", checkUserExists, taskController.getUserTasks)
router.put ("/:id", checkUserExists, userController.updateUsers)
router.patch("/:id", checkUserExists, userController.patchUsers)
router.delete ("/:id", checkUserExists, userController.deleteUsers)

//exports router to app.js
export default router