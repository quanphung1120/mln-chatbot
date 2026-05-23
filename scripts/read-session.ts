import "dotenv/config";
import dbConnect from "../lib/mongoose";
import SessionModel from "../lib/models/Session";

async function main() {
  try {
    await dbConnect();
    const session = await SessionModel.findById("6a11504726e491ea3249d993");
    if (!session) {
      console.log("Session not found");
      process.exit(1);
    }
    console.log("Session:", JSON.stringify(session, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
