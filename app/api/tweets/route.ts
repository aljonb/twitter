import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { InsertOneResult } from 'mongodb';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("twitter_clone");
    const { content } = await request.json();

    // Add timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database operation timed out')), 25000)
    );

    const dbOperation = db.collection("tweets").insertOne({
      content,
      createdAt: new Date(),
    });

    // Race between timeout and DB operation
    const result = await Promise.race([dbOperation, timeoutPromise]) as InsertOneResult;

    return NextResponse.json({ 
      message: "Tweet saved successfully", 
      id: result.insertedId 
    });
  } catch (error) {
    console.error("Error saving tweet:", error);
    return NextResponse.json(
      { error: "Failed to save tweet: " + (error as Error).message },
      { status: error instanceof Error && error.message.includes('timed out') ? 504 : 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("twitter_clone");
    const tweets = await db.collection("tweets")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(tweets);
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tweets" },
      { status: 500 }
    );
  }
}
