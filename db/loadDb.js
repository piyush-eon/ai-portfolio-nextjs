import {DataAPIClient} from "@datastax/astra-db-ts";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import "dotenv/config";
import OpenAI from "openai";
import sampleData from "./sample-data.json" with {type: "json"};

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
})

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT, {
    namespace:process.env.ASTRA_DB_NAMESPACE
})

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const createCollection =async () => {
    try {
        await db.createCollection("portfolio", {
            vector: {
                dimension: 1536,
            }
        })
    } catch (error) {
        console.log("Collection Already Exists",error);
    }
}

const loadData = async () => {
    const collection = await db.collection("portfolio")
    for await (const { id, info, description } of sampleData) {
        const chunks = await splitter.splitText(description);
        let i = 0;
        for await (const chunk of chunks) {
            const { data } = await openai.embeddings.create({
                input: chunk,
                model: "text-embedding-3-small"
            })

            const res = await collection.insertOne({
                document_id: id,
                $vector: data[0]?.embedding,
                info,
                description:chunk
            })

            i++
        }
    }

    console.log("data added");
}

createCollection().then(()=>loadData())