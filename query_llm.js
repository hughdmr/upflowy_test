import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { PromptTemplate } from "langchain/prompts";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { LLMChain } from "langchain/chains";

import * as dotenv from "dotenv";
dotenv.config();

const AWS_S3 = new S3Client({ region: "eu-north-1" }); // Adjust the region if necessary
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


// Function take input, return answer
// TODO : take a json in input with aws bucket for connection
export const query = async (input) => {
    try{

    const chatHistory = "";

    const model = new ChatOpenAI({
        openAIApiKey: OPENAI_API_KEY,
        modelName: "gpt-3.5-turbo", //could be gpt-4 implemented but gpt-3.5 is less extensive
        temperature: 0.8,
        maxTokens: 100,
        });

    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: OPENAI_API_KEY,
        });

    const template = `It is a conversation between the human user and an AI. The AI should answer to the user's questions taking in context the chat history.
    Current conversation:
    {chat_history}
    Human: {input}
    AI:`;

    const prompt = PromptTemplate.fromTemplate(template);

    const memory = await initMemory(chatHistory);

    const chain = new LLMChain({ llm: model, prompt, memory });

    const response = await chain.call({input});
    console.log({ response });

    // const response2 = await chain.call({ input: "Nothing. Do you remember my name?" });
    // console.log({ response2 });
  
    // return the response (will only accept origin http://localhost:3000 if not changed)
    return {
        body: JSON.stringify(response),
        };
    }
    catch (error) {
    console.error("Error processing the request:", error);
    return {
        statusCode: 500,
        body: JSON.stringify({
        message: "An error occurred while processing the request.",
        error: error.message,
        }),
    };
    }
};


const initMemory = async (history) => {
    let messages;
    if (history === "") {
      messages = [];
    } else {
      messages = history.split("\n").map((msg) => {
        const [role, text] = msg.split(": ");
        if (role === "human") return new HumanMessage(text);
        return new AIMessage(text);
      });
    }
  
    return new BufferMemory({
      chatHistory: new ChatMessageHistory(messages),
      memoryKey: "chat_history",
    });
  };

const response = query("Hello! I'm Hugues, How are you?");
console.log({ response });

const response2 = query("Do you remember my name?");
console.log({ response2 });