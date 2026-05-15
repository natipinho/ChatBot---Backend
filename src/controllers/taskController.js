import * as taskService from "../services/taskService.js";

export const getAllTasks = async (req, res) => {
  try {
    const { search, sort } = req.query;
    const queryResult = await taskService.getAllTasks({ search, sort });
    res.json(queryResult);
  } catch (err) {
    res.status(500).json({ error: "Error fetching tasks." });
  }
};

export const createTasks = async (req, res) => {
  const title = req.body.title;
  try {
    if (!title || title.length < 5) {
      return res.status(400).json({ error: "Titles must contain more than 5 characters." });
    }
    const newTask = await taskService.createTasks(req.body);
    res.status(201).json(newTask);
  } catch (err) {
    return res.status(500).json({ error: "Error creating task." });
  }
};

export const updateTasks = async (req, res) => {
  try {
    const updatedTask = await taskService.updateTaskWithTag(req.params.id, req.body);
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json(updatedTask);
  } catch (err) {
    return res.status(500).json({ error: "Error updating task." });
  }
};

export const deleteTasks = async (req, res) => {
  try {
    const result = await taskService.deleteTasks(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Error deleting task." });
  }
};

export const getTaskStats = async (req, res) => {
  try {
    const stats = await taskService.getTaskStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: "Error fetching stats" });
  }
};

export const getTaskTag = async (req, res) => {
  try {
    const taskTag = await taskService.getTaskTag();
    res.status(200).json(taskTag);
  } catch (error) {
    res.status(500).json({ error: "Error fetching task-tag relationship" });
  }
};

export const postTaskTag = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const { tagId } = req.body;
    const taskTag = await taskService.postTaskTag(taskId, tagId);
    res.status(201).json(taskTag);
  } catch (error) {
    const message = error.message;
    if (message === "Task not found" || message === "Tag not found") {
      return res.status(404).json({ error: message });
    }
    if (message === "Task and tag are already associated") {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserTasks = async (req, res) => {
  try {
    const tasks = await taskService.getTasksByUser(req.params.id);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user tasks." });
  }
};