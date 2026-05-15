import db from "../db.js";

// GET /tasks
export const getAllTasks = async ({ search, sort } = {}) => {
  let query = `
    SELECT tasks.id, tasks.title, tasks.done, tags.name AS tag
    FROM tasks
    LEFT JOIN task_tags ON tasks.id = task_tags.task_id
    LEFT JOIN tags ON task_tags.tag_id = tags.id
  `;
  const params = [];

  if (search) {
    query += " WHERE tasks.title LIKE ?";
    params.push(`%${search}%`);
  }

  if (sort === "asc") query += " ORDER BY tasks.title ASC";
  else if (sort === "desc") query += " ORDER BY tasks.title DESC";

  const [rows] = await db.query(query, params);
  return rows;
};

// POST /tasks
// POST /tasks - Versão corrigida
export const createTasks = async (data) => {
  const [queryResult] = await db.query(
    "INSERT INTO tasks (title) VALUES (?)",
    [data.title]
  );

  const taskId = queryResult.insertId;

  if (data.tag) {
    await associateTagByName(taskId, data.tag);
  }

  const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [taskId]);
  return rows[0];
};

//export const createTasks = async (data) => {
//  // 1. Insere a tarefa na tabela principal
//  const [queryResult] = await db.query(
//    "INSERT INTO tasks (title) VALUES (?)",
//    [data.title]
//  );
//  
//  const taskId = queryResult.insertId;
//
//  // 2. Se houver uma tag no envio (manual ou IA), faz a associação
//  // Note que aqui verificamos 'data.tag' (nome) ou 'data.tagId' (ID) 
//  // para cobrir tanto o formulário quanto a IA.
//  if (data.tagId) {
//    await postTaskTag(taskId, data.tagId);
//  } else if (data.tag) {
//    // Caso venha o nome da tag (comum na IA ou dropdown de nomes)
//    const [tagRows] = await db.query("SELECT id FROM tags WHERE name = ?", [data.tag]);
//    if (tagRows.length > 0) {
//      await postTaskTag(taskId, tagRows[0].id);
//    }
//  }
//
//  // 3. Retorna a tarefa completa para o front-end
//  const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [taskId]);
//  return rows[0];
//};
//
// PATCH /tasks/:id
export const updateTasks = async (taskId, data) => {
  const fields = [];
  const params = [];

  if (data.title !== undefined) { fields.push("title = ?"); params.push(data.title); }
  if (data.done !== undefined)  { fields.push("done = ?");  params.push(data.done); }

  if (fields.length === 0) return null;

  params.push(taskId);
  await db.query(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`, params);

  const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [taskId]);
  return rows[0];
};

export const associateTagByName = async (taskId, tagName) => {
  const [tagRows] = await db.query(
    "SELECT id FROM tags WHERE name = ?",
    [tagName]
  );
  if (tagRows.length > 0) {
    await postTaskTag(taskId, tagRows[0].id);
  }
};

export const updateTaskWithTag = async (taskId, data) => {
  // Atualiza título e done
  const updated = await updateTasks(taskId, data);
  if (!updated) return null;

  // Atualiza tag se foi enviada
  if (data.tag) {
    const [tagRows] = await db.query(
      "SELECT id FROM tags WHERE name = ?",
      [data.tag]
    );
    if (tagRows.length > 0) {
      await db.query("DELETE FROM task_tags WHERE task_id = ?", [taskId]);
      await postTaskTag(taskId, tagRows[0].id);
    }
  }

  return updated;
};


// DELETE /tasks/:id
export const deleteTasks = async (taskId) => {
  const [queryResult] = await db.query("DELETE FROM tasks WHERE id = ?", [taskId]);
  return queryResult;
};



// GET /tasks/stats
export const getTaskStats = async () => {
  const [rows] = await db.query(`
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN done = 0 THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) AS done
    FROM tasks
  `);
  return rows[0];
};


// GET tags list (para o system prompt)
export const getAllTagNames = async () => {
  const [rows] = await db.query("SELECT name FROM tags");
  return rows.map(row => row.name);
};


// GET task_tags
export const getTaskTag = async () => {
  const [rows] = await db.query("SELECT * FROM task_tags");
  return rows;
};

// POST /tasks/:id/tags
export const postTaskTag = async (taskId, tagId) => {
  const [task] = await db.query("SELECT id FROM tasks WHERE id = ?", [taskId]);
  if (task.length === 0) throw new Error("Task not found");

  const [tag] = await db.query("SELECT id FROM tags WHERE id = ?", [tagId]);
  if (tag.length === 0) throw new Error("Tag not found");

  const [exists] = await db.query(
    "SELECT * FROM task_tags WHERE task_id = ? AND tag_id = ?",
    [taskId, tagId]
  );
  if (exists.length > 0) throw new Error("Task and tag are already associated");

  const [result] = await db.query(
    "INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)",
    [taskId, tagId]
  );

  return { id: result.insertId, taskId: parseInt(taskId), tagId: parseInt(tagId) };
};


export const removeTaskTagsByTagId = async (tagId) => {
  const [result] = await db.query("DELETE FROM task_tags WHERE tag_id = ?", [tagId]);
  return result;
};

//this taskService is going to be used in the aiService to execute the functions that the IA is going to call, 
// for example, when the IA calls the create_task function, the aiService is going to call the createTasks function 
// from the taskService to create a new task in the database.