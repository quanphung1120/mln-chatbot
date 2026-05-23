import "dotenv/config";
import dbConnect from "../lib/mongoose";
import SessionModel from "../lib/models/Session";

async function main() {
  try {
    console.log("Connecting to MongoDB database...");
    await dbConnect();
    console.log("Database connected successfully.");

    const sessions = await SessionModel.find({}).sort({ updatedAt: -1 }).limit(10);
    console.log(`Total sessions found in last 10: ${sessions.length}`);
    for (const session of sessions) {
      console.log(`- ID: ${session._id}`);
      console.log(`  Title: ${session.title}`);
      console.log(`  User ID: ${session.userId}`);
      console.log(`  Messages count: ${session.messages?.length || 0}`);
      console.log(`  Updated At: ${session.updatedAt}`);
      if (session.messages?.length) {
        const lastMsg = session.messages[session.messages.length - 1];
        let contentStr = "";
        if (typeof lastMsg.content === "string") {
          contentStr = lastMsg.content;
        } else if (Array.isArray(lastMsg.content)) {
          contentStr = JSON.stringify(lastMsg.content);
        } else if (lastMsg.content) {
          contentStr = String(lastMsg.content);
        }
        console.log(`  Last message: [${lastMsg.role}] ${contentStr.substring(0, 60)}...`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

main();
