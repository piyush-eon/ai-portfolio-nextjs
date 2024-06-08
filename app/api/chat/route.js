import OpenAI from "openai";
import {OpenAIStream, StreamingTextResponse} from "ai";
import {DataAPIClient} from "@datastax/astra-db-ts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT, {
  namespace: process.env.ASTRA_DB_NAMESPACE,
});

export async function POST(req) {
  try {
    const {messages} = await req.json();

    const latestMessage = messages[messages?.length - 1]?.content;
    let docContext = "";

    const {data} = await openai.embeddings.create({
      input: latestMessage,
      model: "text-embedding-3-small",
    });

    const collection = await db.collection("portfolio");

    const cursor = collection.find(null, {
      sort: {
        $vector: data[0]?.embedding,
      },
      limit: 5,
    });

    const documents = await cursor.toArray();

    docContext = `
          START CONTEXT
          ${documents?.map((doc) => doc.description).join("\n")}
          END CONTEXT
          `;

    const ragPrompt = [
      {
        role: "system",
        content: `
              You are an AI assistant answering questions as Piyush Agarwal in his Portfolio App. 
              Format responses using markdown where applicable.
              ${docContext}
              If the answer is not provided in the context, the AI assistant will say, 
              "I'am sorry, I do not know the answer".
              `,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [...ragPrompt, ...messages],
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (e) {
    throw e;
  }
}
