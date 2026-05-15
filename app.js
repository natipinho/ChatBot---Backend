import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import taskRoutes from "./src/routes/taskRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import tagRoutes from "./src/routes/tagRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import logger from "./src/middlewares/loggerMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/tags", tagRoutes);
app.use("/chat", aiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
