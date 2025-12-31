import { Module } from '@nestjs/common';
import { StudentsController } from './controllers/students.controller';
import { TeachersController } from './controllers/teachers.controller';
import { CoursesController } from './controllers/courses.controller';
import { EnrollmentsController } from './controllers/enrollments.controller';
import { EnrollmentPeriodsController } from './controllers/enrollment-periods.controller';
import { LeavesController } from './controllers/leaves.controller';
import { QuestionsController } from './controllers/questions.controller';
import { ResourcesController } from './controllers/resources.controller';
import { StudentGroupsController } from './controllers/student-groups.controller';
import { FeesController } from './controllers/fees.controller';
import { StudentsService } from './services/students.service';
import { TeachersService } from './services/teachers.service';
import { CoursesService } from './services/courses.service';
import { EnrollmentsService } from './services/enrollments.service';
import { EnrollmentPeriodsService } from './services/enrollment-periods.service';
import { LeavesService } from './services/leaves.service';
import { QuestionsService } from './services/questions.service';
import { ResourcesService } from './services/resources.service';
import { StudentGroupsService } from './services/student-groups.service';
import { FeesService } from './services/fees.service';
import { MediaController } from './controllers/media.controller';

@Module({
  controllers: [
    StudentsController,
    TeachersController,
    CoursesController,
    EnrollmentsController,
    EnrollmentPeriodsController,
    LeavesController,
    QuestionsController,
    ResourcesController,
    StudentGroupsController,
    FeesController,
    MediaController,
  ],
  providers: [
    StudentsService,
    TeachersService,
    CoursesService,
    EnrollmentsService,
    EnrollmentPeriodsService,
    LeavesService,
    QuestionsService,
    ResourcesService,
    StudentGroupsService,
    FeesService,
  ],
  exports: [
    StudentsService,
    TeachersService,
    CoursesService,
  ],
})
export class CramschoolModule {}
