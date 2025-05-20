import { NextResponse } from "next/server";
import { MongoClient, ServerApiVersion } from "mongodb";

// Ensure environment variables are defined
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "waitlist_users";
const MONGODB_COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || "userlist";

if (!MONGODB_URI) {
  console.error("Missing MongoDB URI environment variable");
  // We'll throw an error during connection attempt if URI is missing,
  // but logging here helps in early diagnosis during development.
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error("MongoDB URI is not configured in environment variables.");
  }
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the MongoClient
    // instance is preserved across module reloads caused by HMR (Hot Module Replacement).
    // @ts-ignore
    if (!global._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
      // @ts-ignore
      global._mongoClientPromise = client.connect();
    }
    // @ts-ignore
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format (basic validation)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    console.log("Received for waitlist:", { email });

    const mongoClient = await getMongoClient();
    const db = mongoClient.db(MONGODB_DB_NAME);
    const collection = db.collection(MONGODB_COLLECTION_NAME);

    // Check if email already exists
    const existingEntry = await collection.findOne({ email });
    if (existingEntry) {
      return NextResponse.json(
        { message: "Email already on waitlist" },
        { status: 200 } // Or 409 Conflict, depending on desired behavior
      );
    }

    // Insert new email
    await collection.insertOne({
      email,
      signupDate: new Date(),
    });

    return NextResponse.json({ success: true, message: "Successfully joined waitlist" });

  } catch (error: any) {
    console.error("Waitlist error:", error);
    // Distinguish between configuration errors and runtime errors
    if (error.message.includes("MongoDB URI is not configured")) {
        return NextResponse.json(
            { error: "Server configuration error: MongoDB URI missing." },
            { status: 500 }
        );
    }
    return NextResponse.json(
      { error: error.message || "Failed to join waitlist" },
      { status: 500 }
    );
  }
}

