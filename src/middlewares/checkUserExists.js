//import database
import db from "../db.js";

//middleware to check if user exists before executing controllers actions
export const checkUserExists = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    res.status(500).json({ error: "Error checking user." });
  }
};