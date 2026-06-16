import mongoose from "mongoose";
import logger from "./logger.js";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

// Resolves a mongodb+srv:// URL to a direct mongodb:// connection string to prevent Node querySrv ECONNREFUSED DNS resolution bugs on Windows
async function resolveSrvConnectionString(srvUrl) {
  if (!srvUrl.startsWith("mongodb+srv://")) {
    return srvUrl;
  }

  try {
    logger.info("Resolving database connection string via OS resolver...");
    
    const urlParts = srvUrl.replace("mongodb+srv://", "").split("@");
    if (urlParts.length !== 2) return srvUrl;

    const credentials = urlParts[0];
    const rest = urlParts[1];
    
    const hostAndQuery = rest.split("/");
    const host = hostAndQuery[0];
    const queryParts = hostAndQuery[1] ? hostAndQuery[1].split("?") : ["", ""];
    const dbName = queryParts[0] || "college_zone";
    const originalQuery = queryParts[1] || "";

    // Run nslookup for SRV records
    const { stdout: srvStdout } = await execPromise(`nslookup -type=SRV _mongodb._tcp.${host}`);
    const hostnameRegex = /svr hostname\s*=\s*([^\s\r\n]+)/gi;
    const hosts = [];
    let match;
    while ((match = hostnameRegex.exec(srvStdout)) !== null) {
      hosts.push(`${match[1].trim()}:27017`);
    }

    if (hosts.length === 0) {
      throw new Error("No hosts resolved from nslookup");
    }
    const hostports = hosts.join(",");

    // Run nslookup for TXT records
    let options = "ssl=true&authSource=admin";
    try {
      const { stdout: txtStdout } = await execPromise(`nslookup -type=TXT ${host}`);
      const txtRegex = /text\s*=\s*"([^"]+)"/i;
      const txtMatch = txtRegex.exec(txtStdout);
      if (txtMatch) {
        options = txtMatch[1];
      }
    } catch (txtErr) {
      logger.warn(`TXT lookup failed, using default options: ${txtErr.message}`);
    }

    const finalQuery = originalQuery ? `${options}&${originalQuery}` : options;
    const directUrl = `mongodb://${credentials}@${hostports}/${dbName}?${finalQuery}`;
    logger.info("Successfully resolved database connection URL!");
    return directUrl;
  } catch (error) {
    logger.error(`Dynamic DNS resolution failed, attempting fallback: ${error.message}`);
    return srvUrl;
  }
}

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/college_zone";
    const mongoUri = await resolveSrvConnectionString(rawUri);
    
    const conn = await mongoose.connect(mongoUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
