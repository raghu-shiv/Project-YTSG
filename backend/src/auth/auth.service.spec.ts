import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";

describe("AuthService", () => {
  let authService: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    creditTransaction: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mock-jwt-token"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        creditBalance: 5,
        passwordHash: "hashed-password",
      });
      mockPrisma.creditTransaction.create.mockResolvedValue({});

      const result = await authService.register("test@example.com", "password123", "Test User");

      expect(result.user.email).toBe("test@example.com");
      expect(result.user.creditBalance).toBe(5);
      expect(result.user.role).toBe("user");
      expect(result.token).toBe("mock-jwt-token");
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "test@example.com",
            creditBalance: 5,
          }),
        }),
      );
      expect(mockPrisma.creditTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "purchase",
            amount: 5,
            description: "Welcome credits",
          }),
        }),
      );
    });

    it("should throw ConflictException when email already exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "existing", email: "test@example.com" });

      await expect(
        authService.register("test@example.com", "password123"),
      ).rejects.toThrow(ConflictException);
    });

    it("should use email prefix as name when name is not provided", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-2",
        email: "user@example.com",
        name: "user",
        role: "user",
        creditBalance: 5,
        passwordHash: "hashed",
      });
      mockPrisma.creditTransaction.create.mockResolvedValue({});

      const result = await authService.register("user@example.com", "password123");

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: "user" }),
        }),
      );
    });
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const hashedPassword = await bcrypt.hash("password123", 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        creditBalance: 10,
        passwordHash: hashedPassword,
      });

      const result = await authService.login("test@example.com", "password123");

      expect(result.user.email).toBe("test@example.com");
      expect(result.token).toBe("mock-jwt-token");
    });

    it("should throw UnauthorizedException when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login("nonexistent@example.com", "password123"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException with invalid password", async () => {
      const hashedPassword = await bcrypt.hash("correct-password", 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        passwordHash: hashedPassword,
      });

      await expect(
        authService.login("test@example.com", "wrong-password"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("makeAdmin", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
      process.env.ADMIN_SECRET_KEY = "super-secret-admin-key";
    });

    afterEach(() => {
      process.env = OLD_ENV;
    });

    it("should promote user to admin with valid secret key", async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "admin",
        creditBalance: 10,
      });

      const result = await authService.makeAdmin("user-1", "super-secret-admin-key");

      expect(result.user.role).toBe("admin");
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-1" },
          data: { role: "admin" },
        }),
      );
    });

    it("should throw ForbiddenException with invalid secret key", async () => {
      await expect(
        authService.makeAdmin("user-1", "wrong-key"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw ForbiddenException when ADMIN_SECRET_KEY is not configured", async () => {
      delete process.env.ADMIN_SECRET_KEY;

      await expect(
        authService.makeAdmin("user-1", "any-key"),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});