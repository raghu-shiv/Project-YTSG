import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ScriptService } from "./script.service";
import { PrismaService } from "../prisma/prisma.service";
import { AiProviderService } from "../ai-provider/ai-provider.service";

describe("ScriptService", () => {
  let scriptService: ScriptService;
  let prisma: any;
  let aiProvider: any;

  const mockPrisma = {
    script: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    creditTransaction: {
      create: jest.fn(),
    },
    scriptVersion: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    aiUsageLog: {
      create: jest.fn(),
    },
    niche: {
      findUnique: jest.fn(),
    },
  };

  const mockAiProvider = {
    generateScript: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScriptService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiProviderService, useValue: mockAiProvider },
      ],
    }).compile();

    scriptService = module.get<ScriptService>(ScriptService);
    prisma = module.get(PrismaService);
    aiProvider = module.get(AiProviderService);

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a script and deduct credits", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        scriptCredits: 10,
      });
      mockPrisma.creditTransaction.create.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue({ scriptCredits: 9 });
      mockPrisma.script.create.mockResolvedValue({
        id: "script-1",
        userId: "user-1",
        topic: "Test Topic",
        status: "generating",
      });
      mockAiProvider.generateScript.mockResolvedValue({
        content: "Generated script content",
        model: "openai/gpt-4o-mini",
        promptTokens: 50,
        completionTokens: 100,
        costUsd: 0.0001,
      });
      mockPrisma.script.findUnique.mockResolvedValue({
        id: "script-1",
        userId: "user-1",
      });
      mockPrisma.aiUsageLog.create.mockResolvedValue({});

      const result = await scriptService.create("user-1", {
        topic: "Test Topic",
        videoType: "educational",
      });

      expect(result.id).toBe("script-1");
      expect(result.status).toBe("generating");
      expect(mockPrisma.creditTransaction.create).toHaveBeenCalled();
    });

    it("should throw BadRequestException when user has insufficient credits", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        scriptCredits: 0,
      });

      await expect(
        scriptService.create("user-1", {
          topic: "Test Topic",
          videoType: "educational",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("findAll", () => {
    it("should return paginated scripts for a user", async () => {
      const mockScripts = [
        { id: "script-1", topic: "Topic 1", status: "completed" },
        { id: "script-2", topic: "Topic 2", status: "completed" },
      ];
      mockPrisma.script.findMany.mockResolvedValue(mockScripts);
      mockPrisma.script.count.mockResolvedValue(2);

      const result = await scriptService.findAll("user-1");

      expect(result.scripts).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockPrisma.script.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1" },
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should return a script by id", async () => {
      const mockScript = {
        id: "script-1",
        userId: "user-1",
        topic: "Test Topic",
        status: "completed",
        content: "Script content",
        seoSuggestions: null,
        thumbnailConcepts: [],
        versions: [],
      };
      mockPrisma.script.findFirst.mockResolvedValue(mockScript);

      const result = await scriptService.findOne("script-1", "user-1");

      expect(result.id).toBe("script-1");
      expect(result.content).toBe("Script content");
    });

    it("should throw NotFoundException when script not found", async () => {
      mockPrisma.script.findFirst.mockResolvedValue(null);

      await expect(
        scriptService.findOne("nonexistent", "user-1"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("should delete a script", async () => {
      mockPrisma.script.findFirst.mockResolvedValue({
        id: "script-1",
        userId: "user-1",
      });
      mockPrisma.script.delete.mockResolvedValue({ id: "script-1" });

      await scriptService.delete("script-1", "user-1");

      expect(mockPrisma.script.delete).toHaveBeenCalledWith({
        where: { id: "script-1" },
      });
    });
  });
});