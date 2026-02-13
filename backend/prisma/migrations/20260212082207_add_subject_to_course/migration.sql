/*
  Warnings:

  - Added the required column `subject_id` to the `cramschool_course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cramschool_course" ADD COLUMN     "subject_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "cramschool_course" ADD CONSTRAINT "cramschool_course_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "cramschool_subject"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;
