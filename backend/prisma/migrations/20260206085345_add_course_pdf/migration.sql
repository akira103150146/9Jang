-- CreateTable
CREATE TABLE "account_customuser" (
    "id" SERIAL NOT NULL,
    "password" TEXT NOT NULL,
    "last_login" TIMESTAMP(3),
    "is_superuser" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "is_staff" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "date_joined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "custom_role_id" INTEGER,
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "account_customuser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_role" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_rolepermission" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_type" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "method" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_rolepermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_auditlog" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "role_id" INTEGER,
    "impersonated_by_id" INTEGER,
    "action_type" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "resource_name" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "request_data" JSONB NOT NULL DEFAULT '{}',
    "response_status" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_auditlog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cramschool_student" (
    "student_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "phone" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "notes" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "user_id" INTEGER,
    "initial_password" TEXT,

    CONSTRAINT "cramschool_student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "cramschool_teacher" (
    "teacher_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "permission_level" TEXT NOT NULL DEFAULT 'Teacher',
    "phone" TEXT,
    "hire_date" TIMESTAMP(3),
    "user_id" INTEGER,

    CONSTRAINT "cramschool_teacher_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateTable
CREATE TABLE "cramschool_course" (
    "course_id" SERIAL NOT NULL,
    "course_name" TEXT NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "fee_per_session" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',

    CONSTRAINT "cramschool_course_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "cramschool_studentenrollment" (
    "enrollment_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enroll_date" TIMESTAMP(3) NOT NULL,
    "discount_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cramschool_studentenrollment_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateTable
CREATE TABLE "cramschool_enrollmentperiod" (
    "period_id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "cramschool_enrollmentperiod_pkey" PRIMARY KEY ("period_id")
);

-- CreateTable
CREATE TABLE "cramschool_extrafee" (
    "fee_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "item" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "fee_date" TIMESTAMP(3) NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'Unpaid',
    "notes" TEXT,
    "paid_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cramschool_extrafee_pkey" PRIMARY KEY ("fee_id")
);

-- CreateTable
CREATE TABLE "cramschool_sessionrecord" (
    "session_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "session_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cramschool_sessionrecord_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "cramschool_attendance" (
    "attendance_id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Absent',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cramschool_attendance_pkey" PRIMARY KEY ("attendance_id")
);

-- CreateTable
CREATE TABLE "cramschool_leave" (
    "leave_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "leave_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "approval_status" TEXT NOT NULL DEFAULT 'Pending',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cramschool_leave_pkey" PRIMARY KEY ("leave_id")
);

-- CreateTable
CREATE TABLE "cramschool_subject" (
    "subject_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cramschool_subject_pkey" PRIMARY KEY ("subject_id")
);

-- CreateTable
CREATE TABLE "cramschool_questionbank" (
    "question_id" SERIAL NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "image_path" TEXT,
    "correct_answer" JSONB NOT NULL DEFAULT '{}',
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "question_type" TEXT NOT NULL DEFAULT 'SINGLE_CHOICE',
    "options" JSONB,
    "metadata" JSONB,
    "question_number" TEXT,
    "origin" TEXT,
    "origin_detail" TEXT,
    "source" TEXT DEFAULT '九章自命題',
    "created_by_id" INTEGER,
    "imported_from_error_log_id" INTEGER,
    "imported_student_id" INTEGER,
    "solution_content" JSONB,
    "search_text_content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cramschool_questionbank_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "cramschool_hashtag" (
    "tag_id" SERIAL NOT NULL,
    "tag_name" TEXT NOT NULL,
    "creator_id" INTEGER,

    CONSTRAINT "cramschool_hashtag_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "cramschool_questiontag" (
    "question_tag_id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "cramschool_questiontag_pkey" PRIMARY KEY ("question_tag_id")
);

-- CreateTable
CREATE TABLE "cramschool_studentanswer" (
    "answer_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "test_name" TEXT NOT NULL,
    "submission_id" INTEGER,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "scanned_file_path" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cramschool_studentanswer_pkey" PRIMARY KEY ("answer_id")
);

-- CreateTable
CREATE TABLE "cramschool_errorlog" (
    "error_log_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "error_count" INTEGER NOT NULL DEFAULT 1,
    "review_status" TEXT NOT NULL DEFAULT 'New',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cramschool_errorlog_pkey" PRIMARY KEY ("error_log_id")
);

-- CreateTable
CREATE TABLE "cramschool_errorlogimage" (
    "image_id" SERIAL NOT NULL,
    "error_log_id" INTEGER NOT NULL,
    "image_path" TEXT NOT NULL,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cramschool_errorlogimage_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "cramschool_studentmistakenote" (
    "note_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cramschool_studentmistakenote_pkey" PRIMARY KEY ("note_id")
);

-- CreateTable
CREATE TABLE "cramschool_studentmistakenoteimage" (
    "image_id" SERIAL NOT NULL,
    "note_id" INTEGER NOT NULL,
    "image_path" TEXT NOT NULL,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cramschool_studentmistakenoteimage_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "cramschool_restaurant" (
    "restaurant_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "menu_image_path" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cramschool_restaurant_pkey" PRIMARY KEY ("restaurant_id")
);

-- CreateTable
CREATE TABLE "cramschool_grouporder" (
    "group_order_id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "order_link" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "deadline" TIMESTAMP(3) NOT NULL,
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "cramschool_grouporder_pkey" PRIMARY KEY ("group_order_id")
);

-- CreateTable
CREATE TABLE "cramschool_order" (
    "order_id" SERIAL NOT NULL,
    "group_order_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cramschool_order_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "cramschool_orderitem" (
    "order_item_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "cramschool_orderitem_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "cramschool_studentgroup" (
    "group_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "group_type" TEXT NOT NULL DEFAULT 'teaching',
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cramschool_studentgroup_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "cramschool_studentgroup_students" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,

    CONSTRAINT "cramschool_studentgroup_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cramschool_contenttemplate" (
    "template_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "structure" JSONB NOT NULL DEFAULT '[]',
    "tiptap_structure" JSONB,
    "created_by_id" INTEGER,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cramschool_contenttemplate_pkey" PRIMARY KEY ("template_id")
);

-- CreateTable
CREATE TABLE "cramschool_contenttemplate_tags" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "cramschool_contenttemplate_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cramschool_learningresource" (
    "resource_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'HANDOUT',
    "structure" JSONB NOT NULL DEFAULT '[]',
    "tiptap_structure" JSONB,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_by_id" INTEGER,
    "is_individualized" BOOLEAN NOT NULL DEFAULT false,
    "available_from" TIMESTAMP(3),
    "available_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cramschool_learningresource_pkey" PRIMARY KEY ("resource_id")
);

-- CreateTable
CREATE TABLE "cramschool_learningresource_courses" (
    "id" SERIAL NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,

    CONSTRAINT "cramschool_learningresource_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cramschool_learningresource_student_groups" (
    "id" SERIAL NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "student_group_id" INTEGER NOT NULL,

    CONSTRAINT "cramschool_learningresource_student_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cramschool_learningresource_tags" (
    "id" SERIAL NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "cramschool_learningresource_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cramschool_course_pdf" (
    "pdf_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "uploaded_by_id" INTEGER NOT NULL,
    "allow_download" BOOLEAN NOT NULL DEFAULT false,
    "is_visible_to_all" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cramschool_course_pdf_pkey" PRIMARY KEY ("pdf_id")
);

-- CreateTable
CREATE TABLE "cramschool_course_pdf_student_groups" (
    "id" SERIAL NOT NULL,
    "pdf_id" INTEGER NOT NULL,
    "student_group_id" INTEGER NOT NULL,

    CONSTRAINT "cramschool_course_pdf_student_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_customuser_username_key" ON "account_customuser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "account_role_code_key" ON "account_role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "account_role_name_key" ON "account_role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "account_rolepermission_role_id_permission_type_resource_met_key" ON "account_rolepermission"("role_id", "permission_type", "resource", "method");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_student_user_id_key" ON "cramschool_student"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_teacher_user_id_key" ON "cramschool_teacher"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_studentenrollment_student_id_course_id_key" ON "cramschool_studentenrollment"("student_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_sessionrecord_course_id_session_date_key" ON "cramschool_sessionrecord"("course_id", "session_date");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_attendance_session_id_student_id_key" ON "cramschool_attendance"("session_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_subject_name_key" ON "cramschool_subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_subject_code_key" ON "cramschool_subject"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_hashtag_tag_name_key" ON "cramschool_hashtag"("tag_name");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_questiontag_question_id_tag_id_key" ON "cramschool_questiontag"("question_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_errorlog_student_id_question_id_key" ON "cramschool_errorlog"("student_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_grouporder_order_link_key" ON "cramschool_grouporder"("order_link");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_studentgroup_students_group_id_student_id_key" ON "cramschool_studentgroup_students"("group_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_contenttemplate_tags_template_id_tag_id_key" ON "cramschool_contenttemplate_tags"("template_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_learningresource_courses_resource_id_course_id_key" ON "cramschool_learningresource_courses"("resource_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_learningresource_student_groups_resource_id_stud_key" ON "cramschool_learningresource_student_groups"("resource_id", "student_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_learningresource_tags_resource_id_tag_id_key" ON "cramschool_learningresource_tags"("resource_id", "tag_id");

-- CreateIndex
CREATE INDEX "cramschool_course_pdf_course_id_idx" ON "cramschool_course_pdf"("course_id");

-- CreateIndex
CREATE INDEX "cramschool_course_pdf_uploaded_by_id_idx" ON "cramschool_course_pdf"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "cramschool_course_pdf_is_active_idx" ON "cramschool_course_pdf"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "cramschool_course_pdf_student_groups_pdf_id_student_group_i_key" ON "cramschool_course_pdf_student_groups"("pdf_id", "student_group_id");

-- AddForeignKey
ALTER TABLE "account_customuser" ADD CONSTRAINT "account_customuser_custom_role_id_fkey" FOREIGN KEY ("custom_role_id") REFERENCES "account_role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_rolepermission" ADD CONSTRAINT "account_rolepermission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "account_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_student" ADD CONSTRAINT "cramschool_student_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "account_customuser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_teacher" ADD CONSTRAINT "cramschool_teacher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "account_customuser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_course" ADD CONSTRAINT "cramschool_course_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "cramschool_teacher"("teacher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_studentenrollment" ADD CONSTRAINT "cramschool_studentenrollment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "cramschool_student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_studentenrollment" ADD CONSTRAINT "cramschool_studentenrollment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "cramschool_course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_enrollmentperiod" ADD CONSTRAINT "cramschool_enrollmentperiod_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "cramschool_studentenrollment"("enrollment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_extrafee" ADD CONSTRAINT "cramschool_extrafee_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "cramschool_student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_sessionrecord" ADD CONSTRAINT "cramschool_sessionrecord_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "cramschool_course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_attendance" ADD CONSTRAINT "cramschool_attendance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "cramschool_sessionrecord"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_attendance" ADD CONSTRAINT "cramschool_attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "cramschool_student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_leave" ADD CONSTRAINT "cramschool_leave_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "cramschool_student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_leave" ADD CONSTRAINT "cramschool_leave_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "cramschool_course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_questionbank" ADD CONSTRAINT "cramschool_questionbank_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "cramschool_subject"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_questionbank" ADD CONSTRAINT "cramschool_questionbank_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "account_customuser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_questionbank" ADD CONSTRAINT "cramschool_questionbank_imported_from_error_log_id_fkey" FOREIGN KEY ("imported_from_error_log_id") REFERENCES "cramschool_errorlog"("error_log_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_questionbank" ADD CONSTRAINT "cramschool_questionbank_imported_student_id_fkey" FOREIGN KEY ("imported_student_id") REFERENCES "cramschool_student"("student_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_hashtag" ADD CONSTRAINT "cramschool_hashtag_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "cramschool_teacher"("teacher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_questiontag" ADD CONSTRAINT "cramschool_questiontag_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "cramschool_questionbank"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_questiontag" ADD CONSTRAINT "cramschool_questiontag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "cramschool_hashtag"("tag_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_studentanswer" ADD CONSTRAINT "cramschool_studentanswer_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "cramschool_student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_studentanswer" ADD CONSTRAINT "cramschool_studentanswer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "cramschool_questionbank"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_errorlog" ADD CONSTRAINT "cramschool_errorlog_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "cramschool_student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_errorlog" ADD CONSTRAINT "cramschool_errorlog_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "cramschool_questionbank"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_studentmistakenote" ADD CONSTRAINT "cramschool_studentmistakenote_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "cramschool_student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_studentmistakenoteimage" ADD CONSTRAINT "cramschool_studentmistakenoteimage_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "cramschool_studentmistakenote"("note_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_grouporder" ADD CONSTRAINT "cramschool_grouporder_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "cramschool_restaurant"("restaurant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_order" ADD CONSTRAINT "cramschool_order_group_order_id_fkey" FOREIGN KEY ("group_order_id") REFERENCES "cramschool_grouporder"("group_order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_order" ADD CONSTRAINT "cramschool_order_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "cramschool_student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_orderitem" ADD CONSTRAINT "cramschool_orderitem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "cramschool_order"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_studentgroup_students" ADD CONSTRAINT "cramschool_studentgroup_students_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "cramschool_studentgroup"("group_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_studentgroup_students" ADD CONSTRAINT "cramschool_studentgroup_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "cramschool_student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_contenttemplate_tags" ADD CONSTRAINT "cramschool_contenttemplate_tags_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "cramschool_contenttemplate"("template_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_contenttemplate_tags" ADD CONSTRAINT "cramschool_contenttemplate_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "cramschool_hashtag"("tag_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_learningresource_courses" ADD CONSTRAINT "cramschool_learningresource_courses_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "cramschool_learningresource"("resource_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_learningresource_courses" ADD CONSTRAINT "cramschool_learningresource_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "cramschool_course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_learningresource_student_groups" ADD CONSTRAINT "cramschool_learningresource_student_groups_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "cramschool_learningresource"("resource_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_learningresource_student_groups" ADD CONSTRAINT "cramschool_learningresource_student_groups_student_group_i_fkey" FOREIGN KEY ("student_group_id") REFERENCES "cramschool_studentgroup"("group_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_learningresource_tags" ADD CONSTRAINT "cramschool_learningresource_tags_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "cramschool_learningresource"("resource_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_learningresource_tags" ADD CONSTRAINT "cramschool_learningresource_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "cramschool_hashtag"("tag_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_course_pdf" ADD CONSTRAINT "cramschool_course_pdf_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "cramschool_course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_course_pdf_student_groups" ADD CONSTRAINT "cramschool_course_pdf_student_groups_pdf_id_fkey" FOREIGN KEY ("pdf_id") REFERENCES "cramschool_course_pdf"("pdf_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cramschool_course_pdf_student_groups" ADD CONSTRAINT "cramschool_course_pdf_student_groups_student_group_id_fkey" FOREIGN KEY ("student_group_id") REFERENCES "cramschool_studentgroup"("group_id") ON DELETE CASCADE ON UPDATE CASCADE;
