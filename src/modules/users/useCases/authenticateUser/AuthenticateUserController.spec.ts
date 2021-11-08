import { app } from "../../../../app";
import request from "supertest";
import createConnection from "../../../../database";
import { Connection } from "typeorm";

let connection: Connection;
describe("Authenticate user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@gmail.com",
      password: "1234",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "1234",
    });

    expect(response.body.user.name).toEqual("test");
    expect(response.body).toHaveProperty("token");
  });
});
