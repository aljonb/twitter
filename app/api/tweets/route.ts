import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("twitter_clone");
    const { content } = await request.json();

    const result = await db.collection("tweets").insertOne({
      content,
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      message: "Tweet saved successfully", 
      id: result.insertedId 
    });
  } catch (error) {
    console.error("Error saving tweet:", error);
    return NextResponse.json(
      { error: "Failed to save tweet" },
      { status: 500 }
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
