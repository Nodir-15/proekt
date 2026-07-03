import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import { app } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

connectDB().then(() => {
  app.listen(env.port, () => console.log(`🚀 http://localhost:${env.port}`));
});