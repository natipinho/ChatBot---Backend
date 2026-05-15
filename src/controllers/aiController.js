import * as aiService from "../services/aiService.js";
import * as taskService from "../services/taskService.js";


// HELPER — função geral que resolve ID da tarefa por posição ou título - usado no chatController para UPDATE e DELETE
function resolveTaskId(botJSON, tasks) {
  if (botJSON.id) return botJSON.id;

  if (botJSON.target && tasks && tasks.length > 0) {
    const positions = {
      first: 0, second: 1, third: 2, fourth: 3, fifth: 4,
      last: tasks.length - 1,
    };
    const index = positions[botJSON.target];
    if (index !== undefined) return tasks[index].id;
  }

  if (botJSON.title && tasks) {
    const found = tasks.find(t =>
      t.title.toLowerCase().includes(botJSON.title.toLowerCase())
    );
    if (found) return found.id;
  }

  return null;
}


export const chat = async (req, res) => {
  const { message, tasks, userId } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const botJSON = await aiService.sendMessage(message, tasks);
    console.log("botJSON:", JSON.stringify(botJSON));
    let taskResult = null;

    if (botJSON.action === "CREATE") {
      taskResult = botJSON.result;

      if (botJSON.tag && taskResult) {
        await taskService.associateTagByName(taskResult.id, botJSON.tag);
      }

    } else if (botJSON.action === "UPDATE") {
      const updateId = resolveTaskId(botJSON, tasks);

      if (updateId) {
        taskResult = await taskService.updateTasks(updateId, botJSON);
      }

    } else if (botJSON.action === "DELETE") {
      const deleteId = resolveTaskId(botJSON, tasks);

      if (deleteId) {
        taskResult = await taskService.deleteTasks(deleteId);
      }

    } else if (botJSON.action === "LIST") {
      taskResult = await taskService.getAllTasks({});
    }

    res.status(200).json({ bot: botJSON, result: taskResult });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error processing chat message." });
  }
};
