import db from "../db.js";
import { removeTaskTagsByTagId } from "./taskService.js";


//service ENDPOINTS: GET /tags
//gets array of tags
export const getAllTags = async () => {
  const [rows] = await db.query(
  "SELECT * FROM tags")  
  return rows;
};


//service ENDPOINTS: POST /tags
//creates a new tag
export const postTag = async (data) => {
const [queryResult] = await db.query (
  "INSERT INTO tags (name) VALUES (?)",
[data.name]
);

const [rows] = await db.query ("SELECT * FROM tags WHERE id = ?", 
  [queryResult.insertId]
);

return rows[0];
};


//service ENDPOINTS: DELETE /tags/:id
//deletes a tag and removes all its associations with tasks
export const deleteTag = async (tagId) => {
  await removeTaskTagsByTagId(tagId)
  const [queryResult] = await db.query ("DELETE FROM tags WHERE id=?",
    [tagId]
  );
  return queryResult
};