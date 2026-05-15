//express framework import
import express from "express"

//import controllers to define routes
import * as tagController from "../controllers/tagController.js"
import * as taskController from "../controllers/taskController.js"

//creates an instance to start the routes below
const router = express.Router()

//tag routes
router.get ("/", tagController.getAllTags)
router.post("/", tagController.postTag);
router.delete("/:id", tagController.deleteTags);

//exports router to app.js
export default router