import request from "supertest";
import { app, server } from "../server.js";
import mongoose from "mongoose";

describe("GET /api/health", () => {
  afterAll(async () => {
    // Close mongoose connection and express server after tests
    await mongoose.connection.close();
    if (server.listening) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should return 200 OK and status ok", async () => {
    const res = await request(app)
      .get("/api/health")
      .expect(200);

    expect(res.body).toHaveProperty("status");
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("uptime");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("should return 200 OK for root endpoint", async () => {
    const res = await request(app)
      .get("/")
      .expect(200);

    expect(res.text).toContain("College Zone API is running");
  });
});
