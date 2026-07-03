"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_dns_1 = __importDefault(require("node:dns"));
node_dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
(0, db_1.connectDB)().then(() => {
    app_1.app.listen(env_1.env.port, () => console.log(`🚀 http://localhost:${env_1.env.port}`));
});
