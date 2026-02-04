/**
 * Mock Prisma Service Helper
 * 提供標準化的 Prisma Mock 工廠函數，用於 Unit Test
 */

export const createMockPrismaService = () => ({
  // Account 模組
  accountCustomUser: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  accountRole: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  accountPermission: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  accountAuditLog: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },

  // Cramschool 模組 - Students
  cramschoolStudent: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  
  // Cramschool 模組 - Courses
  cramschoolCourse: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  
  // Cramschool 模組 - Enrollments
  cramschoolEnrollment: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  cramschoolStudentEnrollment: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  
  // Cramschool 模組 - Fees
  cramschoolExtraFee: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
  },
  
  // Cramschool 模組 - Teachers
  cramschoolTeacher: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  
  // Cramschool 模組 - Sessions
  cramschoolSession: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  
  // Cramschool 模組 - Subjects
  cramschoolSubject: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  
  // Cramschool 模組 - Student Groups
  cramschoolStudentGroup: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  
  // Cramschool 模組 - Questions
  cramschoolQuestion: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  
  // Cramschool 模組 - Resources
  cramschoolResource: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  
  // Cramschool 模組 - Attendance
  cramschoolAttendance: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  
  // Cramschool 模組 - Leave
  cramschoolLeave: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  
  // Prisma Transaction 支援
  $transaction: jest.fn((callback) => callback({
    // 提供 transaction 內的 prisma instance
    accountCustomUser: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cramschoolStudent: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
});

/**
 * 重置所有 Mock 函數
 * 在每個測試的 beforeEach 中調用
 */
export const resetAllMocks = (mockPrisma: any) => {
  Object.keys(mockPrisma).forEach((key) => {
    if (typeof mockPrisma[key] === 'object' && mockPrisma[key] !== null) {
      Object.keys(mockPrisma[key]).forEach((method) => {
        if (typeof mockPrisma[key][method]?.mockReset === 'function') {
          mockPrisma[key][method].mockReset();
        }
      });
    }
  });
};
