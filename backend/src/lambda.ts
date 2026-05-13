import serverless from "serverless-http";
import app from "./app";

// Esta função serve como entry point para a AWS Lambda invocando nossa aplicação Express
export const handler = serverless(app);
