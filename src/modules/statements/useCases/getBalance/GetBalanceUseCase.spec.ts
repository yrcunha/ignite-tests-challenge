import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("GetBalanceUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  it("should be able to get a balance", async () => {
    const user = await usersRepository.create({
      email: "test@gmail.com",
      name: "test",
      password: "1234",
    });

    const statementDeposit = await statementsRepository.create({
      amount: 100,
      description: "deposit",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const statementWithdraw = await statementsRepository.create({
      amount: 50,
      description: "withdraw",
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    });

    const response = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(response).toStrictEqual({
      statement: [statementDeposit, statementWithdraw],
      balance: 50,
    });
  });

  it("should not be able to get a balance with a non-existent user", async () => {
    expect(async () => {
      await statementsRepository.create({
        amount: 100,
        description: "test",
        type: OperationType.DEPOSIT,
        user_id: "non-existent",
      });

      await getBalanceUseCase.execute({
        user_id: "non-existent",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
