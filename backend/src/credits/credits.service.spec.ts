import { Test, TestingModule } from "@nestjs/testing";
import { CreditsService } from "./credits.service";
import { PrismaService } from "../prisma/prisma.service";

describe("CreditsService", () => {
  let creditsService: CreditsService;
  let prisma: any;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    creditTransaction: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    creditsService = module.get<CreditsService>(CreditsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe("getBalance", () => {
    it("should return the user's credit balances", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        scriptCredits: 15,
        thumbnailCredits: 5,
      });

      const result = await creditsService.getBalance("user-1");

      expect(result.scriptCredits).toBe(15);
      expect(result.thumbnailCredits).toBe(5);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
        select: { scriptCredits: true, thumbnailCredits: true },
      });
    });

    it("should return 0 when user has no balance", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await creditsService.getBalance("nonexistent");

      expect(result.scriptCredits).toBe(0);
      expect(result.thumbnailCredits).toBe(0);
    });
  });

  describe("getTransactions", () => {
    it("should return paginated transactions with defaults", async () => {
      const mockTransactions = [
        { id: "tx-1", amount: 5, type: "purchase" },
        { id: "tx-2", amount: -1, type: "usage" },
      ];
      mockPrisma.creditTransaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.creditTransaction.count.mockResolvedValue(2);

      const result = await creditsService.getTransactions("user-1");

      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it("should accept page and limit parameters", async () => {
      mockPrisma.creditTransaction.findMany.mockResolvedValue([]);
      mockPrisma.creditTransaction.count.mockResolvedValue(0);

      await creditsService.getTransactions("user-1", 2, 10);

      expect(mockPrisma.creditTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });
});