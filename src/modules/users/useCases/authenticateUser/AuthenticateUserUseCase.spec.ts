import { hash } from "bcryptjs";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: IUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("AuthenticateUserUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("should be able to authenticate", async () => {
    const user = {
      email: "test@gmail.com",
      name: "test",
      password: await hash("1234", 8),
    };

    await usersRepository.create(user);

    const response = await authenticateUserUseCase.execute({
      email: "test@gmail.com",
      password: "1234",
    });

    console.log(process.env.JWT_SECRET);

    expect(response).toHaveProperty("token");
    expect(response).toHaveProperty("user");
  });

  it("should not be able to authenticate with a non-existent user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "non@gmail.com",
        password: "non-existent",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with a wrong password", async () => {
    expect(async () => {
      await usersRepository.create({
        email: "test@gmail.com",
        name: "test",
        password: await hash("1234", 8),
      });

      await authenticateUserUseCase.execute({
        email: "test@gmail.com",
        password: "wrong-password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with a wrong email", async () => {
    expect(async () => {
      await usersRepository.create({
        email: "test@gmail.com",
        name: "test",
        password: await hash("1234", 8),
      });

      const response = await authenticateUserUseCase.execute({
        email: "non@gmail.com",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
