export const mockStudents = [
  {
    id: 1,
    name: '林怡君',
    school: '建國高中',
    grade: '高三',
    phone: '0912-345-678',
    emergency_contact_name: '林媽媽',
    emergency_contact_phone: '0922-111-333',
    notes: '衝刺總複習班，數學每週 2 次',
  },
  {
    id: 2,
    name: '陳柏安',
    school: '北一女中',
    grade: '高二',
    phone: '0955-888-120',
    emergency_contact_name: '陳先生',
    emergency_contact_phone: '0910-222-567',
    notes: '目標醫學系，英文口說需加強',
  },
  {
    id: 3,
    name: '張雅雯',
    school: '中山女高',
    grade: '國三',
    phone: '0988-333-909',
    emergency_contact_name: '張女士',
    emergency_contact_phone: '0933-555-789',
    notes: '自然領域補強班',
  },
]

export const mockTeachers = [
  {
    teacher_id: 1,
    name: '王哲民',
    username: 't_wang',
    permission_level: 'Admin',
    phone: '0911-222-333',
    hire_date: '2018-08-01',
    subject: '數學',
  },
  {
    teacher_id: 2,
    name: '林品妤',
    username: 'pylin',
    permission_level: 'Teacher',
    phone: '0938-444-555',
    hire_date: '2020-02-20',
    subject: '英文',
  },
  {
    teacher_id: 3,
    name: '吳建成',
    username: 'jwuteach',
    permission_level: 'Teacher',
    phone: '0970-120-888',
    hire_date: '2019-11-05',
    subject: '物理',
  },
]

export const mockCourses = [
  {
    course_id: 101,
    course_name: '高三數學總複習班',
    teacher_id: 1,
    teacher_name: '王哲民',
    day_of_week: 'Mon / Thu',
    start_time: '19:00',
    end_time: '21:30',
    fee_per_session: 1800,
    status: 'Active',
  },
  {
    course_id: 102,
    course_name: '英文閱讀技巧班',
    teacher_id: 2,
    teacher_name: '林品妤',
    day_of_week: 'Wed',
    start_time: '18:30',
    end_time: '20:30',
    fee_per_session: 1500,
    status: 'Active',
  },
  {
    course_id: 103,
    course_name: '國三自然衝刺班',
    teacher_id: 3,
    teacher_name: '吳建成',
    day_of_week: 'Sat',
    start_time: '14:00',
    end_time: '17:00',
    fee_per_session: 1600,
    status: 'Pending',
  },
]

export const mockEnrollments = [
  {
    enrollment_id: 1001,
    student_id: 1,
    student_name: '林怡君',
    course_id: 101,
    course_name: '高三數學總複習班',
    enroll_date: '2025-02-10',
    discount_rate: 10,
  },
  {
    enrollment_id: 1002,
    student_id: 2,
    student_name: '陳柏安',
    course_id: 102,
    course_name: '英文閱讀技巧班',
    enroll_date: '2025-01-28',
    discount_rate: 0,
  },
  {
    enrollment_id: 1003,
    student_id: 3,
    student_name: '張雅雯',
    course_id: 103,
    course_name: '國三自然衝刺班',
    enroll_date: '2025-02-18',
    discount_rate: 5,
  },
]

export const mockExtraFees = [
  {
    fee_id: 1,
    student_name: '林怡君',
    item: 'Book',
    amount: 850,
    fee_date: '2025-02-20',
    payment_status: 'Paid',
  },
  {
    fee_id: 2,
    student_name: '陳柏安',
    item: 'Transport',
    amount: 420,
    fee_date: '2025-02-15',
    payment_status: 'Unpaid',
  },
  {
    fee_id: 3,
    student_name: '張雅雯',
    item: 'Other',
    amount: 600,
    fee_date: '2025-02-18',
    payment_status: 'Unpaid',
  },
]

export const mockSessionRecords = [
  {
    session_id: 501,
    course_name: '高三數學總複習班',
    session_date: '2025-02-24',
    status: 'Scheduled',
  },
  {
    session_id: 502,
    course_name: '英文閱讀技巧班',
    session_date: '2025-02-26',
    status: 'Scheduled',
  },
  {
    session_id: 503,
    course_name: '國三自然衝刺班',
    session_date: '2025-02-22',
    status: 'Completed',
  },
]

export const mockAttendanceRecords = [
  {
    attendance_id: 9001,
    session_id: 503,
    student_name: '張雅雯',
    status: 'Present',
  },
  {
    attendance_id: 9002,
    session_id: 503,
    student_name: '林怡君',
    status: 'Absent',
  },
  {
    attendance_id: 9003,
    session_id: 503,
    student_name: '陳柏安',
    status: 'Late',
  },
]

export const mockLeaveRequests = [
  {
    leave_id: 301,
    student_name: '陳柏安',
    course_name: '英文閱讀技巧班',
    leave_date: '2025-02-19',
    reason: '學校英檢模考',
    approval_status: 'Approved',
  },
  {
    leave_id: 302,
    student_name: '張雅雯',
    course_name: '國三自然衝刺班',
    leave_date: '2025-02-21',
    reason: '家庭旅遊',
    approval_status: 'Pending',
  },
]

export const mockQuestionBank = [
  {
    question_id: 7001,
    subject: 'Math',
    level: 'SHS',
    chapter: '向量與空間',
    content: '已知向量 **a** = (2, -1, 3)... 試求 |a × b|。',
    difficulty: 4,
    tags: ['#必考三角', '#向量', '#陷阱題'],
  },
  {
    question_id: 7002,
    subject: 'Eng',
    level: 'SHS',
    chapter: '被動語態',
    content: 'Rewrite the sentence into passive form: *The teacher gave the students homework.*',
    difficulty: 2,
    tags: ['#被動語態時態', '#語法', '#必背'],
  },
]

export const mockErrorLogs = [
  {
    error_log_id: 801,
    student_name: '林怡君',
    question_id: 7001,
    question_title: '向量外積與幾何應用',
    error_count: 2,
    review_status: 'Reviewing',
  },
  {
    error_log_id: 802,
    student_name: '陳柏安',
    question_id: 7002,
    question_title: '被動語態轉換練習',
    error_count: 1,
    review_status: 'New',
  },
]

export const mockStores = [
  {
    store_id: 1,
    name: '九章補教 - 民生校區',
    business_hours: '週一至週六 14:00 - 22:00',
    menu_image_path: '/static/img/menu-minsheng.png',
    address: '台北市松山區民生東路四段 123 號 3F',
  },
  {
    store_id: 2,
    name: '九章補教 - 南京校區',
    business_hours: '週一至週五 15:00 - 21:30',
    menu_image_path: '/static/img/menu-nanjing.png',
    address: '台北市中山區南京東路二段 56 號 5F',
  },
]

