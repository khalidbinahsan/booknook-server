import "dotenv/config";
import dns from "node:dns";
import { MongoClient, ServerApiVersion } from "mongodb";

// On some Windows setups Node's DNS resolver cannot look up the SRV record
// behind "mongodb+srv://" URIs (querySrv ECONNREFUSED). Using public DNS
// servers fixes it locally; production hosts resolve SRV records fine.
if (process.env.NODE_ENV !== "production" || process.env.USE_PUBLIC_DNS === "true") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

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
  await ensureIndexes();
}

async function ensureIndexes() {
  await Promise.all([
    booksCollection.createIndex({ createdAt: -1 }),
    booksCollection.createIndex({ "addedBy.email": 1 }),
    borrowsCollection.createIndex({ userEmail: 1, borrowDate: -1 }),
    // One active borrow per user per book (backs up the "no double borrow" rule)
    borrowsCollection.createIndex({ bookId: 1, userEmail: 1 }, { unique: true }),
  ]);
}
