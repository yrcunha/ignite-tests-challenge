import { app } from "../../../../app";
import request from "supertest";
import createConnection from "../../../../database";
import { Connection } from "typeorm";
import { send } from "process";

let connection: Connection;
describe("Get balance controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get all balances", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@gmail.com",
      password: "1234",
    });

    const session = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "1234",
    });

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit test",
      })
      .set({ authorization: `Bearer ${session.body.token}` });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({ authorization: `Bearer ${session.body.token}` });

    expect(response.body.balance).toEqual(100);
    expect(response.body.statement.length).toEqual(1);
  });
});
