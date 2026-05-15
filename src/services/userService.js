//import database
import db from "../db.js";

//service ENDPOINTS: GET /users -- GET /users?sort=asc|desc -- GET /users?search=title
//gets users, sorts them A-Z or Z-A, searches users by name
export const getAllUsers = async ({ sort, search } = {}) => {
  let query = "SELECT * FROM users";
  const params = [];

  if (search) {
    query += " WHERE name LIKE ?";
    params.push(`%${search}%`);
  }

  if (sort === "asc") {
    query += " ORDER BY name ASC";
  } else if (sort === "desc") {
    query += " ORDER BY name DESC";
  }

  const [rows] = await db.query(query, params);
  return rows;
};

//service ENDPOINTS: POST /users
//creates new users
export const createUsers = async (data) => {
  const [queryResult] = await db.query(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [data.name, data.email],
  );
  const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
    queryResult.insertId,
  ]);
  return rows[0];
};

//service ENDPOINTS: PUT /users/:id - PATCH /users/:id
//update users by name, email and/or active status
export const updateUsers = async (userId, data) => {
  const fields = [];
  const params = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    params.push(data.name);
  }
  if (data.email !== undefined) {
    fields.push("email = ?");
    params.push(data.email);
  }
  if (data.active !== undefined) {
    fields.push("active = ?");
    params.push(data.active);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update.");
  }

  params.push(userId);

  await db.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    params
  );

  const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
  return rows[0];
};

//service ENDPOINTS: DELETE /users/:id
//delete users
export const deleteUser = async (userId) => {
  const [queryResult] = await db.query("DELETE FROM users WHERE id=?", [
    userId,
  ]);
  return queryResult;
};

//service ENDPOINTS: GET /users/stats
//displays statistics of the users
export const checkUserStats = async () => {
  const query = `
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS inactive,
      SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active,
      ROUND(SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) AS active_percent
  FROM users
      `;

  const [rows] = await db.query(query);
  return rows[0];
};
