# LearnHub LMS

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full Learning Management System with two modes: Student and Admin
- **Admin Mode**:
  - Dashboard with stats (total courses, students, enrollments, revenue)
  - Course management: create, edit, delete courses with title, description, category, price, thumbnail
  - Section/lesson management: add sections and video lessons within courses
  - Student management: view all enrolled students
  - Enrollment overview
- **Student Mode**:
  - Course catalog/browse page with search and category filter
  - Course detail page with curriculum preview
  - Enrollment (free and paid courses)
  - My Learning dashboard: enrolled courses, progress tracking
  - Lesson viewer: video embed + mark complete
  - Progress tracking per course (percentage complete)
- **Authentication**: Login/signup with role (student vs admin)
- **Data models**: User, Course, Section, Lesson, Enrollment, Progress

### Modify
- None (new project)

### Remove
- None (new project)

## Implementation Plan
1. Define Motoko data models: User (with role), Course, Section, Lesson, Enrollment, LessonProgress
2. Backend APIs:
   - Auth: register, login, getProfile
   - Courses: createCourse, updateCourse, deleteCourse, getCourses, getCourseById
   - Sections & Lessons: addSection, addLesson, getSectionsWithLessons
   - Enrollment: enrollCourse, getMyEnrollments, getAllEnrollments (admin)
   - Progress: markLessonComplete, getCourseProgress
   - Admin: getStats, getAllStudents
3. Frontend:
   - App shell with navbar and role-based routing
   - Auth pages: Login, Register
   - Student pages: Home/Catalog, CourseDetail, MyLearning, LessonViewer
   - Admin pages: Dashboard, ManageCourses, CourseEditor, ManageStudents
   - Sample seed data for courses, sections, lessons
