import { Module } from '@nestjs/common';
import { StudentsController } from './controllers/students.controller';
import { TeachersController } from './controllers/teachers.controller';
import { CoursesController } from './controllers/courses.controller';
import { EnrollmentsController } from './controllers/enrollments.controller';
import { QuestionsController } from './controllers/questions.controller';
import { ResourcesController } from './controllers/resources.controller';
import { StudentsService } from './services/students.service';
import { TeachersService } from './services/teachers.service';
import { CoursesService } from './services/courses.service';
import { EnrollmentsService } from './services/enrollments.service';
import { QuestionsService } from './services/questions.service';
import { ResourcesService } from './services/resources.service';
import { MediaController } from './controllers/media.controller';

@Module({
  controllers: [
    StudentsController,
    TeachersController,
    CoursesController,
    EnrollmentsController,
    QuestionsController,
    ResourcesController,
    MediaController,
  ],
  providers: [
    StudentsService,
    TeachersService,
    CoursesService,
    EnrollmentsService,
    QuestionsService,
    ResourcesService,
  ],
  exports: [
    StudentsService,
    TeachersService,
    CoursesService,
  ],
})
export class CramschoolModule {}
