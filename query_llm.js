import { ChatOpenAI } from "@langchain/openai";

import * as dotenv from "dotenv";
dotenv.config();

const model = new ChatOpenAI({
    openAIApiKey: process.env.GPT_API_KEY,
    modelName: "gpt-3.5-turbo",
    temperature: 0.9,
    maxTokens: 100,
    });

const response = await model.invoke("Write a poem about AI");
console.log("AI :", response.content);