import UsersController from "../controllers/UsersController";
import dbClient from "../utils/db";
import redisClient from "../utils/redis";

jest.mock("../utils/db");
jest.mock("../utils/redis");

describe("usersController", () => {
  describe("postNew", () => {
    it("should return 400 if email is missing", async () => {
      const req = { body: { password: "password" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UsersController.postNew(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing email" });
    });

    it("should return 400 if password is missing", async () => {
      const req = { body: { email: "test@example.com" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UsersController.postNew(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing password" });
    });

    it("should return 400 if email already exists", async () => {
      const req = { body: { email: "test@example.com", password: "password" } };
      dbClient.db.collection.mockResolvedValue({
        findOne: jest.fn().mockResolvedValue({ email: "test@example.com" }),
      });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UsersController.postNew(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email already exists" });
    });

    it("should create a new user if email and password are valid", async () => {
      const req = { body: { email: "test@example.com", password: "password" } };
      dbClient.db.collection.mockResolvedValue({
        findOne: jest.fn().mockResolvedValue(null),
        insertOne: jest.fn().mockResolvedValue({ insertedId: "mockUserId" }),
      });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UsersController.postNew(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        email: "test@example.com",
        id: "mockUserId",
      });
    });
  });

  describe("getMe", () => {
    it("should return 401 if user is not authenticated", async () => {
      redisClient.get.mockResolvedValue(null);

      const req = { headers: { "x-token": "mockToken" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UsersController.getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 401 if user is not found", async () => {
      redisClient.get.mockResolvedValue("mockUserId");
      dbClient.db.collection.mockResolvedValue({
        findOne: jest.fn().mockResolvedValue(null),
      });

      const req = { headers: { "x-token": "mockToken" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UsersController.getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return user information if user is authenticated", async () => {
      redisClient.get.mockResolvedValue("mockUserId");
      dbClient.db.collection.mockResolvedValue({
        findOne: jest
          .fn()
          .mockResolvedValue({ _id: "mockUserId", email: "test@example.com" }),
      });

      const req = { headers: { "x-token": "mockToken" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UsersController.getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: "mockUserId",
        email: "test@example.com",
      });
    });
  });
});
