import { NextResponse } from "next/server";
import { MongoClient, ServerApiVersion } from "mongodb";

// Ensure environment variables are defined
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "waitlist_users";
const MONGODB_COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || "userlist";

// It's good practice to type the global object for HMR in development
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient; // No need for client to be | null if we manage clientPromise carefully
// clientPromise will be initialized by getMongoClient and cached
let clientPromiseInternal: Promise<MongoClient> | undefined = undefined;


async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    console.error("CRITICAL: MongoDB URI is not configured in environment variables.");
    throw new Error("MongoDB URI is not configured in environment variables.");
  }

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the MongoClient
    // instance is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
      global._mongoClientPromise = client.connect();
      console.log("Dev: New MongoDB connection promise created and cached globally.");
    }
    // This assignment ensures we are returning the promise stored on global
    // which is expected to be Promise<MongoClient>
    return global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    // Cache the promise at the module level for reuse across invocations
    // in the same serverless instance.
    if (!clientPromiseInternal) {
      client = new MongoClient(MONGODB_URI, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
      clientPromiseInternal = client.connect();
      console.log("Prod: New MongoDB connection promise created and cached at module level.");
    }
    return clientPromiseInternal;
  }
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

    const mongoClientInstance = await getMongoClient(); // This will now correctly be Promise<MongoClient>
    const db = mongoClientInstance.db(MONGODB_DB_NAME);
    const collection = db.collection(MONGODB_COLLECTION_NAME);

    // Check if email already exists
    const existingEntry = await collection.findOne({ email });
    if (existingEntry) {
      return NextResponse.json(
        { message: "Email already on waitlist", success: false }, // Added success: false for clarity
        { status: 200 } // Changed from 409 as per original code; 200 with a message is fine
      );
    }

    // Insert new email
    await collection.insertOne({
      email,
      signupDate: new Date(),
    });

    return NextResponse.json({ success: true, message: "Successfully joined waitlist" });

  } catch (error: any) {
    console.error("Waitlist API error:", error.message, error.stack); // Log more error details
    
    // Check for specific error messages or types if possible
    if (error.message.includes("MongoDB URI is not configured")) {
        return NextResponse.json(
            { error: "Server configuration error: MongoDB URI missing." },
            { status: 503 } // Service Unavailable might be more appropriate
        );
    }
    // General error
    return NextResponse.json(
      { error: "An internal server error occurred while trying to join the waitlist.", details: error.message },
      { status: 500 }
    );
  }
}
