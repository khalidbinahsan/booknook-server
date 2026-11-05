import "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = client.db(process.env.DB_NAME || "booknook");

export const booksCollection = db.collection("books");
export const borrowsCollection = db.collection("borrows");

export async function connectDB() {
  await client.connect();
  await db.command({ ping: 1 });
  console.log("Connected to MongoDB");
}
