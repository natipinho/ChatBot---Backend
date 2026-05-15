import express from "express"
import * as taskController from "../controllers/taskController.js"

const router = express.Router()

//task routes
router.get("/", taskController.getAllTasks)
router.get("/stats", taskController.getTaskStats)
router.post("/", taskController.createTasks)
router.put("/:id", taskController.updateTasks)
router.delete("/:id", taskController.deleteTasks)
router.patch("/:id", taskController.updateTasks)

//tag - task association routes
router.get("/task-tags", taskController.getTaskTag)
router.post("/:id/tags", taskController.postTaskTag)

export default router