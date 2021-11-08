import { app } from "../../../../app";
import request from "supertest";
import createConnection from "../../../../database";
import { Connection } from "typeorm";

let connection: Connection;
describe("Create statement controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a deposit", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@gmail.com",
      password: "1234",
    });

    const session = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "1234",
    });

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit test",
      })
      .set({ authorization: `Bearer ${session.body.token}` });

    expect(response.status).toEqual(201);
    expect(response.body.type).toEqual("deposit");
  });

  it("should be able to create a withdraw", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@gmail.com",
      password: "1234",
    });

    const session = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "1234",
    });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "deposit test",
      })
      .set({ authorization: `Bearer ${session.body.token}` });

    expect(response.status).toEqual(201);
    expect(response.body.type).toEqual("withdraw");
  });
});
