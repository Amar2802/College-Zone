import mongoose from "mongoose";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

async function resolveSrvWithNslookup(srvUrl) {
  if (!srvUrl.startsWith("mongodb+srv://")) {
    return srvUrl;
  }

  try {
    console.log("Resolving SRV URL using OS resolver fallback...");
    
    // Parse URL components
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
    console.log("Executing nslookup for SRV...");
    const { stdout: srvStdout } = await execPromise(`nslookup -type=SRV _mongodb._tcp.${host}`);
    
    // Parse hostnames
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
    console.log("Resolved hostnames:", hostports);

    // Run nslookup for TXT records
    console.log("Executing nslookup for TXT...");
    let options = "ssl=true&authSource=admin";
    try {
      const { stdout: txtStdout } = await execPromise(`nslookup -type=TXT ${host}`);
      const txtRegex = /text\s*=\s*"([^"]+)"/i;
      const txtMatch = txtRegex.exec(txtStdout);
      if (txtMatch) {
        options = txtMatch[1];
      }
    } catch (txtErr) {
      console.warn("TXT lookup failed, using default options:", txtErr.message);
    }

    const finalQuery = originalQuery ? `${options}&${originalQuery}` : options;
    const directUrl = `mongodb://${credentials}@${hostports}/${dbName}?${finalQuery}`;
    console.log("Successfully resolved direct URL!");
    return directUrl;
  } catch (error) {
    console.error("OS resolver fallback failed:", error.message);
    return srvUrl;
  }
}

async function test() {
  const srvUrl = "mongodb+srv://devilamar44_db_user:9569514817@cluster0.vtht7mc.mongodb.net/?appName=Cluster0";
  const directUrl = await resolveSrvWithNslookup(srvUrl);
  
  try {
    console.log("Connecting to:", directUrl.replace(/:[^:@/]+@/, ":****@")); // hide password in logs
    await mongoose.connect(directUrl);
    console.log("Successfully connected to MongoDB Atlas!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Connection failed:", err.message);
  }
}

test();
