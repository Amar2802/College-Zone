import { jest } from "@jest/globals";
import request from "supertest";
import { app, server } from "../server.js";
import mongoose from "mongoose";
import User from "../models/User.js";

describe("Auth Controller & Routes", () => {
  let findOneSpy;
  let createSpy;

  beforeAll(() => {
    // Spy on User model static methods
    findOneSpy = jest.spyOn(User, "findOne");
    createSpy = jest.spyOn(User, "create");
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (server.listening) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(() => {
    findOneSpy.mockReset();
    createSpy.mockReset();
  });

  describe("POST /api/auth/signup", () => {
    it("should fail validation if email is missing", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Test User",
          password: "password123",
        })
        .expect(400);

      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors.some(e => e.field === "email")).toBe(true);
    });

    it("should fail validation if password is too short", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Test User",
          email: "test@student.edu",
          password: "123",
        })
        .expect(400);

      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors.some(e => e.field === "password")).toBe(true);
    });

    it("should succeed when valid data is sent", async () => {
      // Mock User.findOne to return null (user doesn't exist)
      findOneSpy.mockResolvedValue(null);
      // Mock User.create to return a mock user object
      createSpy.mockResolvedValue({
        _id: "mockuserid123",
        name: "Test User",
        email: "test@student.edu",
        phone: "1234567890",
      });

      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Test User",
          email: "test@student.edu",
          password: "password123",
          phone: "1234567890",
        })
        .expect(201);

      expect(res.body).toHaveProperty("token");
      expect(res.body.email).toBe("test@student.edu");
    });
  });
});
