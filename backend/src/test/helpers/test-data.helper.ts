/**
 * Test Data Helper
 * 提供測試資料工廠函數，用於快速建立 Mock 資料
 */

/**
 * 建立 Mock User
 */
export const createMockUser = (overrides: any = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  password: '$2b$10$hashedPasswordExample',
  firstName: 'Test',
  lastName: 'User',
  role: 'STUDENT',
  customRoleId: null,
  isStaff: false,
  isActive: true,
  isSuperuser: false,
  mustChangePassword: false,
  lastLogin: new Date('2024-01-01'),
  dateJoined: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  customRole: null,
  studentProfile: null,
  ...overrides,
});

/**
 * 建立 Mock User (完整關聯資料)
 */
export const createMockUserWithRelations = (overrides: any = {}) => ({
  ...createMockUser(overrides),
  customRole: overrides.customRole || {
    id: 1,
    code: 'STUDENT_ROLE',
    name: '學生角色',
    description: '一般學生',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    permissions: [],
  },
  studentProfile: overrides.studentProfile || null,
});

/**
 * 建立 Mock Student
 */
export const createMockStudent = (overrides: any = {}) => ({
  id: 1,
  studentId: 'S001',
  name: 'Test Student',
  email: 'student@example.com',
  phone: '0912345678',
  parentPhone: '0923456789',
  address: '台北市信義區',
  school: '台北市立某某國中',
  grade: '國三',
  notes: null,
  isDeleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  userId: 1,
  user: null,
  enrollments: [],
  fees: [],
  groups: [],
  ...overrides,
});

/**
 * 建立 Mock Student (完整關聯資料)
 */
export const createMockStudentWithRelations = (overrides: any = {}) => {
  const baseStudent = createMockStudent(overrides);
  return {
    ...baseStudent,
    student_id: overrides.student_id || baseStudent.studentId, // 添加 snake_case 別名
    user: overrides.user || createMockUser({ id: 1, role: 'STUDENT' }),
    enrollments: overrides.enrollments || [],
    fees: overrides.fees || [],
    groups: overrides.groups || [],
  };
};

/**
 * 建立 Mock Course
 */
export const createMockCourse = (overrides: any = {}) => ({
  id: 1,
  courseCode: 'MATH101',
  name: '數學基礎班',
  description: '國中數學基礎課程',
  subjectId: 1,
  teacherId: 1,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-06-30'),
  schedule: '週一、週三 18:00-20:00',
  capacity: 20,
  tuitionFee: 5000,
  isActive: true,
  isDeleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

/**
 * 建立 Mock Enrollment
 */
export const createMockEnrollment = (overrides: any = {}) => ({
  id: 1,
  enrollmentId: 1,
  studentId: 1,
  courseId: 1,
  enrollDate: new Date('2024-01-01'),
  enrollmentDate: new Date('2024-01-01'), // 向後兼容
  discountRate: 0,
  isActive: true,
  status: 'ACTIVE',
  notes: null,
  isDeleted: false,
  deletedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

/**
 * 建立 Mock Fee
 */
export const createMockFee = (overrides: any = {}) => ({
  id: 1,
  studentId: 1,
  feeType: 'TUITION',
  amount: 5000,
  feeDate: new Date('2024-01-01'),
  dueDate: new Date('2024-01-15'),
  paidDate: null,
  status: 'UNPAID',
  paymentMethod: null,
  notes: null,
  isDeleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  student: null,
  ...overrides,
});

/**
 * 建立 Mock Teacher
 */
export const createMockTeacher = (overrides: any = {}) => ({
  id: 1,
  teacherId: 'T001',
  name: 'Test Teacher',
  email: 'teacher@example.com',
  phone: '0912345678',
  subjects: ['數學', '英文'],
  isActive: true,
  isDeleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  userId: 2,
  ...overrides,
});

/**
 * 建立 Mock Subject
 */
export const createMockSubject = (overrides: any = {}) => ({
  id: 1,
  subjectCode: 'MATH',
  name: '數學',
  description: '數學科目',
  isActive: true,
  isDeleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

/**
 * 建立 Mock Role
 */
export const createMockRole = (overrides: any = {}) => ({
  id: 1,
  code: 'STUDENT_ROLE',
  name: '學生角色',
  description: '一般學生權限',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  permissions: [],
  ...overrides,
});

/**
 * 建立 Mock Permission
 */
export const createMockPermission = (overrides: any = {}) => ({
  id: 1,
  roleId: 1,
  permissionType: 'READ',
  resource: 'STUDENT',
  method: 'GET',
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

/**
 * 建立 Mock Audit Log
 */
export const createMockAuditLog = (overrides: any = {}) => ({
  id: 1,
  userId: 1,
  roleId: 1,
  impersonatedById: null,
  actionType: 'LOGIN',
  resourceType: 'USER',
  resourceId: '1',
  resourceName: 'testuser',
  description: '用戶登入',
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0',
  requestData: {},
  responseStatus: 200,
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

/**
 * 建立 Mock JWT Payload
 */
export const createMockJwtPayload = (overrides: any = {}) => ({
  sub: 1,
  username: 'testuser',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  ...overrides,
});

/**
 * 建立 Mock Request (AuthRequest)
 */
export const createMockAuthRequest = (overrides: any = {}) => ({
  user: {
    id: 1,
    username: 'testuser',
    ...overrides.user,
  },
  body: overrides.body || {},
  params: overrides.params || {},
  query: overrides.query || {},
  headers: overrides.headers || {},
  ...overrides,
});

/**
 * 建立分頁回應資料
 */
export const createMockPaginatedResponse = <T>(
  results: T[],
  count: number,
  page: number = 1,
  pageSize: number = 10,
) => ({
  count,
  next: (page * pageSize < count) ? page + 1 : null,
  previous: page > 1 ? page - 1 : null,
  results,
});
