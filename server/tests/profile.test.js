import { jest } from "@jest/globals";
import request from "supertest";
import { app, server } from "../server.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

describe("Profile Controller & Routes", () => {
  let findByIdSpy;
  let findByIdAndDeleteSpy;
  let jwtVerifySpy;

  const mockUser = {
    _id: "mockuserid123",
    name: "Test Student",
    email: "test@student.edu",
    phone: "1234567890",
    age: 21,
    gender: "Male",
    city: "Boston",
    state: "MA",
    bio: "Computer Science student looking for a neat roommate.",
    interests: ["Coding", "Reading"],
    hobbies: ["Hiking"],
    languages: ["English"],
    verificationStatus: "unverified",
    profileCompleted: false,
    profile: {
      college: "Boston University",
      course: "CS",
      year: "Junior",
      sleep_schedule: "",
      cleanliness: "",
      study_habits: "",
      smoking_drinking: "",
    },
    preferences: {
      budgetRange: "$800 - $1200",
      preferredLocation: "Campus",
      moveInDate: "September",
      smokingPreference: "No",
      drinkingPreference: "Socially",
      cleanlinessLevel: "Clean",
      sleepSchedule: "Night Owl",
      studyHabits: "Quiet",
      guestPolicy: "Weekends Only",
      petsPreference: "No",
    },
    socialLinks: {
      linkedin: "https://linkedin.com/in/teststudent",
      instagram: "teststudent",
      portfolio: "https://portfolio.com",
    },
    privacySettings: {
      showPhone: false,
      showEmail: false,
      showSocials: false,
      publicProfileVisibility: true,
    },
    save: jest.fn().mockImplementation(function() {
      return Promise.resolve(this);
    }),
  };

  beforeAll(() => {
    findByIdSpy = jest.spyOn(User, "findById");
    findByIdAndDeleteSpy = jest.spyOn(User, "findByIdAndDelete");
    jwtVerifySpy = jest.spyOn(jwt, "verify");
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (server.listening) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(() => {
    findByIdSpy.mockReset();
    findByIdAndDeleteSpy.mockReset();
    jwtVerifySpy.mockReset();

    // Setup auth middleware mocks
    jwtVerifySpy.mockReturnValue({ id: "mockuserid123" });
    
    // Default mock query to handle both plain calls and select() chain returning mockUser
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      then: (onResolve, onReject) => Promise.resolve(mockUser).then(onResolve, onReject),
      catch: (onReject) => Promise.resolve(mockUser).catch(onReject),
    };
    findByIdSpy.mockReturnValue(mockQuery);
  });

  describe("GET /api/profile", () => {
    it("should fetch user profile and return completion percentage", async () => {
      const res = await request(app)
        .get("/api/profile")
        .set("Authorization", "Bearer mocktoken")
        .expect(200);

      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("completionPercentage");
      expect(res.body.user.email).toBe("test@student.edu");
    });
  });

  describe("PUT /api/profile", () => {
    it("should update basic profile details successfully", async () => {
      const res = await request(app)
        .put("/api/profile")
        .set("Authorization", "Bearer mocktoken")
        .send({
          name: "Updated Name",
          age: 22,
          bio: "An updated bio statement.",
        })
        .expect(200);

      expect(res.body.user.name).toBe("Updated Name");
      expect(res.body.user.age).toBe(22);
      expect(res.body.user.bio).toBe("An updated bio statement.");
    });
  });

  describe("PUT /api/profile/preferences", () => {
    it("should update roommate preferences successfully", async () => {
      const res = await request(app)
        .put("/api/profile/preferences")
        .set("Authorization", "Bearer mocktoken")
        .send({
          cleanlinessLevel: "Very Clean",
          sleepSchedule: "Early Bird",
        })
        .expect(200);

      expect(res.body.user.preferences.cleanlinessLevel).toBe("Very Clean");
      expect(res.body.user.preferences.sleepSchedule).toBe("Early Bird");
    });
  });

  describe("PUT /api/profile/privacy", () => {
    it("should update privacy settings successfully", async () => {
      const res = await request(app)
        .put("/api/profile/privacy")
        .set("Authorization", "Bearer mocktoken")
        .send({
          showPhone: true,
          publicProfileVisibility: false,
        })
        .expect(200);

      expect(res.body.user.privacySettings.showPhone).toBe(true);
      expect(res.body.user.privacySettings.publicProfileVisibility).toBe(false);
    });
  });

  describe("POST /api/profile/image", () => {
    it("should set profile picture successfully", async () => {
      const res = await request(app)
        .post("/api/profile/image")
        .set("Authorization", "Bearer mocktoken")
        .send({
          type: "profile",
          imageUrl: "https://images.unsplash.com/photo-1534528741775",
        })
        .expect(200);

      expect(res.body.user.profileImage).toBe("https://images.unsplash.com/photo-1534528741775");
    });
  });

  describe("DELETE /api/profile", () => {
    it("should delete user profile successfully", async () => {
      findByIdAndDeleteSpy.mockResolvedValue(mockUser);

      const res = await request(app)
        .delete("/api/profile")
        .set("Authorization", "Bearer mocktoken")
        .expect(200);

      expect(res.body.message).toBe("Account deleted successfully");
    });
  });
});
