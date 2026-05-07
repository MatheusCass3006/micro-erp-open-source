import { describe, beforeAll, afterAll, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/app";
import { AppDataSource } from "../src/database";

describe("Health Check", () => {
  it("should return ok for /health", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
