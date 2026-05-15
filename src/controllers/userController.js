//imports user service
import * as userService from "../services/userService.js";

//gets users
export const getUsers = async (req, res) => {
  try {
    const { search, sort } = req.query;
    const queryResult = await userService.getAllUsers({ search, sort });
    res.json(queryResult);
  } catch (err) {
    res.status(500).json({ error: "Error finding user." });
  }
};

//creates new user
export const createUsers = async (req, res) => {
  try {
    const user = await userService.createUsers(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Error creating user." });
  }
};

//updates user (PUT - all fields are required)
export const updateUsers = async (req, res) => {
  try {
    const { name, email, active } = req.body;

    // PUT requires all fields
    if (name === undefined || email === undefined || active === undefined) {
      return res.status(400).json({ error: "All fields are required: name, email, active." });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ error: "Invalid email!" });
    }

    if (typeof active !== "boolean") {
      return res.status(400).json({ error: "Active status must be a boolean." });
    }

    const user = await userService.updateUsers(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error updating user." });
  }
};

//updates user (PATCH - only sent fields updated)
export const patchUsers = async (req, res) => {
  try {
    const { email, active } = req.body;

    if (email !== undefined && !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email!" });
    }

    if (active !== undefined && typeof active !== "boolean") {
      return res.status(400).json({ error: "Active status must be a boolean." });
    }

    const user = await userService.updateUsers(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error patching user." });
  }
};

//delete user
export const deleteUsers = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Error deleting user." });
  }
};

//check user statistics
export const getUserStats = async (req, res) => {
  try {
    const stats = await userService.checkUserStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: "Error fetching stats" });
  }
};