import { Document } from "langchain/document";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { TextLoader } from "langchain/document_loaders/fs/text";
import FileSaver from "file-saver";

import * as dotenv from "dotenv";
dotenv.config();

const AWS_S3 = new S3Client({ region: "eu-north-1" }); // Adjust the region if necessary
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


//TODO : to connect with aws bucket
export const embedder = async (file_path) => {
    try {
        
        // const command = new GetObjectCommand({
        //     Bucket: bucketName,
        //     Key: key
        // });
        // const file = await AWS_S3.send(command);

        // Use Langchain functionnality for Embedding processing
        const loader = new TextLoader(file_path);
        const docs = await loader.load();


        // const docs = new Document({ 
        //     pageContent: file,
        // });

        // Chunking the text before embedding
        const splitter = new CharacterTextSplitter({
            chunkSize: 100,
            chunkOverlap: 20,
        });
    
        const documents = await splitter.splitDocuments([docs]);

        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: OPENAI_API_KEY,
        });
        console.log('test')
        const embedded_doc = await embeddings.embedDocuments(documents);

        const savePath = 'embeddings/test_embed.json';
        FileSaver.saveAs(embedded_doc, savePath);
        console.log('test')
        // TODO : Could use langchain functionnality of vectorstore
        // TODO : Upload file to the S3 bucket directory : embdeggings

        return {message : "Embedder has embedded"
            };
    } catch (error) {
        console.error("Error processing the file:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "An error occurred while processing the file.",
                error: error.message
            }),
        };
    }
};

const message = embedder("test_aws.txt");
console.log({ message });