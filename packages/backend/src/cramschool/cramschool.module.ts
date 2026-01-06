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
import { AttendancesController } from './controllers/attendances.controller';
import { SessionsController } from './controllers/sessions.controller';
import { AttendancesService } from './services/attendances.service';
import { SessionsService } from './services/sessions.service';
import { SubjectsController } from './controllers/subjects.controller';
import { SubjectsService } from './services/subjects.service';
import { HashtagsController } from './controllers/hashtags.controller';
import { HashtagsService } from './services/hashtags.service';
import { QuestionTagsController } from './controllers/question-tags.controller';
import { QuestionTagsService } from './services/question-tags.service';
import { StudentAnswersController } from './controllers/student-answers.controller';
import { StudentAnswersService } from './services/student-answers.service';
import { RestaurantsController } from './controllers/restaurants.controller';
import { RestaurantsService } from './services/restaurants.service';
import { GroupOrdersController } from './controllers/group-orders.controller';
import { GroupOrdersService } from './services/group-orders.service';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { OrderItemsController } from './controllers/order-items.controller';
import { OrderItemsService } from './services/order-items.service';
import { ContentTemplatesController } from './controllers/content-templates.controller';
import { ContentTemplatesService } from './services/content-templates.service';
import { ErrorLogsController } from './controllers/error-logs.controller';
import { ErrorLogsService } from './services/error-logs.service';
import { StudentMistakeNotesController } from './controllers/student-mistake-notes.controller';
import { StudentMistakeNotesService } from './services/student-mistake-notes.service';
import { ErrorLogImagesController } from './controllers/error-log-images.controller';
import { ErrorLogImagesService } from './services/error-log-images.service';
import { StudentMistakeNoteImagesController } from './controllers/student-mistake-note-images.controller';
import { StudentMistakeNoteImagesService } from './services/student-mistake-note-images.service';
import { WordImporterService } from './services/word-importer.service';
import { MarkdownImporterService } from './services/markdown-importer.service';

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
    AttendancesController,
    SessionsController,
    SubjectsController,
    HashtagsController,
    QuestionTagsController,
    StudentAnswersController,
    RestaurantsController,
    GroupOrdersController,
    OrdersController,
    OrderItemsController,
    ContentTemplatesController,
    ErrorLogsController,
    StudentMistakeNotesController,
    ErrorLogImagesController,
    StudentMistakeNoteImagesController,
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
    AttendancesService,
    SessionsService,
    SubjectsService,
    HashtagsService,
    QuestionTagsService,
    StudentAnswersService,
    RestaurantsService,
    GroupOrdersService,
    OrdersService,
    OrderItemsService,
    ContentTemplatesService,
    ErrorLogsService,
    StudentMistakeNotesService,
    ErrorLogImagesService,
    StudentMistakeNoteImagesService,
    WordImporterService,
    MarkdownImporterService,
  ],
  exports: [
    StudentsService,
    TeachersService,
    CoursesService,
  ],
})
export class CramschoolModule {}
