import { Type } from "@google/genai";
import { ai } from "../../ai.js";
import * as taskService from "./taskService.js";

let history = [];

const MODELS = [
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
];

async function generateWithFallback(params) {
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model: model,
      });
      return response;
    } catch (err) {
      console.log(`Modelo ${model} falhou, tentando próximo...`);
    }
  }
  throw new Error("Todos os modelos falharam.");
}

export const sendMessage = async (message, tasks) => {
  // Busca tags da BD dinamicamente
  const tagNames = await taskService.getAllTagNames();
  const tagsList = tagNames.join(", ");

  // Declaração da função create_task com tags dinâmicas
  const createTaskDeclaration = {
    name: "create_task",
    description: "Creates a new task in the task list.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "The title of the task to create.",
        },
        tag: {
          type: Type.STRING,
          description: `The tag that best fits the task. Must be one of: ${tagsList}. If none fits, use "general".`,
          enum: tagNames,
        },
      },
      required: ["title"],
    },
  };

  const SYSTEM_PROMPT = `
You're a ChatBot, a task management assistant to help users manage tasks.
For CREATE actions, always use the create_task function — never respond with JSON for creates.
For all other actions, respond with valid JSON only. No extra text, no markdown, no code blocks.
NEVER include technical details like IDs in the confirmation message.
Always answer in the same language as the user sent the message.

REQUIRED FIELDS IN ALL NON-CREATE RESPONSES:
- "action": the action to perform
- "message": your natural language response to the user, which should be concise, informative and polite.

When creating or update tasks, make sure title is no longer than  title VARCHAR(255) in the database, otherwise it will cause an error. 
If the title is too long, inform user that the title is too long and ask for a shorter one.
When creating tasks, you can suggest a tag for the task based on its content. 

AVAILABLE ACTIONS (except CREATE which uses function calling):

1. UPDATE task:
{ "action": "UPDATE", "id": 123, "title": "...", "done": true, "message": "..." }
- Use "target": "last" | "first" | "second" | "third" | "fourth" | "fifth" when the user refers to position instead of id
- Include only the fields the user wants to change

2. DELETE task:
{ "action": "DELETE", "id": 123, "message": "..." }
- Use "target": "last" | "first" | "second" | "third" | "fourth" | "fifth" when the user refers to position
- Use "title": "..." when the user mentions the task name
- Only when the user uses words like "delete", "remove", or "erase"

3. FILTER tasks:
{ "action": "FILTER", "filter": "all" | "done" | "pending", "message": "..." }

4. GENERAL CHAT:
{ "action": "CHAT", "message": "..." }

EXAMPLES:
- "Mark the last task as done"
→ { "action": "UPDATE", "target": "last", "done": true, "message": "Task marked as done!" }
- "Delete the meeting task"
→ { "action": "DELETE", "title": "meeting", "message": "Task deleted successfully." }
- "Show pending tasks"
→ { "action": "FILTER", "filter": "pending", "message": "Showing pending tasks." }
`;

  const config = {
    tools: [
      {
        functionDeclarations: [createTaskDeclaration],
      },
    ],
    systemInstruction: SYSTEM_PROMPT,
  };

  // Contexto da lista de tarefas
  const taskContext =
    tasks && tasks.length > 0
      ? `\n\nCurrent task list:\n${tasks.map((t, i) => `${i + 1}. [id:${t.id}] ${t.title} (${t.done ? "done" : "pending"})`).join("\n")}`
      : "";

  const fullMessage = message + taskContext;
  history.push({ role: "user", parts: [{ text: fullMessage }] });

  // Primeira chamada ao Gemini
  const response = await generateWithFallback({
    model: "gemini-3.1-flash-lite",
    contents: history,
    config: config,
  });

  // Function Calling — create_task
  if (response.functionCalls && response.functionCalls.length > 0) {
    const toolCall = response.functionCalls[0];
    console.log("toolCall:", JSON.stringify(toolCall));

    if (toolCall.name === "create_task") {
      const result = await taskService.createTasks({
        title: toolCall.args.title,
      });

      const functionResponsePart = {
        name: toolCall.name,
        response: { result },
        id: toolCall.id,
      };

      history.push(response.candidates[0].content);
      history.push({
        role: "user",
        parts: [{ functionResponse: functionResponsePart }],
      });

      const finalResponse = await generateWithFallback({
        model: "gemini-3.1-flash-lite",
        contents: history,
        config: config,
      });

      history.push({ role: "model", parts: [{ text: finalResponse.text }] });

      try {
        const parsed = JSON.parse(finalResponse.text);
        if (parsed.message) finalMessage = parsed.message;
      } catch {
        // se não for JSON, usa o texto diretamente
      }

      return {
        action: "CREATE",
        message: finalResponse.text,
        result: result,
        tag: toolCall.args.tag,
      };
    }
  }

  // Outras ações — resposta JSON normal
  const responseText = response.text;
  history.push({ role: "model", parts: [{ text: responseText }] });

  try {
    return JSON.parse(responseText);
  } catch {
    return { action: "CHAT", message: responseText };
  }
};
//este try-catch é para garantir que mesmo que o Gemini não responda com JSON válido,
// a aplicação continue funcionando e retorne a resposta como uma mensagem de chat normal.
// Por exemplo, se o usuário fizer uma pergunta geral que não envolva ações específicas,
// o Gemini pode responder com um texto informativo em vez de JSON. Se isso acontecer,
// o JSON.parse vai crashar com um erro e o servidor devolve 500.
// O try/catch trata esse caso — se o parse falhar, em vez de crashar assume que é uma conversa geral
// e devolve { action: "CHAT", message: responseText } com o texto que o Gemini devolveu.


