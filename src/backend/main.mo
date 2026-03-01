import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text; // "admin" or "student"
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type Course = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    price : Nat;
    thumbnailUrl : Text;
    instructorId : Principal;
    createdAt : Time.Time;
    isPublished : Bool;
  };

  module Course {
    public func compare(course1 : Course, course2 : Course) : Order.Order {
      Nat.compare(course1.id, course2.id);
    };
  };

  type Section = {
    id : Nat;
    courseId : Nat;
    title : Text;
    order : Nat;
  };

  module Section {
    public func compare(section1 : Section, section2 : Section) : Order.Order {
      Nat.compare(section1.order, section2.order);
    };
  };

  type Lesson = {
    id : Nat;
    sectionId : Nat;
    courseId : Nat;
    title : Text;
    videoUrl : Text;
    duration : Nat;
    order : Nat;
  };

  module Lesson {
    public func compare(lesson1 : Lesson, lesson2 : Lesson) : Order.Order {
      Nat.compare(lesson1.order, lesson2.order);
    };
  };

  type Enrollment = {
    id : Nat;
    studentId : Principal;
    courseId : Nat;
    enrolledAt : Time.Time;
  };

  type LessonProgress = {
    studentId : Principal;
    lessonId : Nat;
    courseId : Nat;
    completedAt : Time.Time;
  };

  // Persistent storage
  let courses = Map.empty<Nat, Course>();
  let sections = Map.empty<Nat, Section>();
  let lessons = Map.empty<Nat, Lesson>();
  let enrollments = Map.empty<Nat, Enrollment>();
  let progress = Map.empty<Principal, Map.Map<Nat, LessonProgress>>();

  var nextCourseId : Nat = 1;
  var nextSectionId : Nat = 1;
  var nextLessonId : Nat = 1;
  var nextEnrollmentId : Nat = 1;

  // Seed data initialization
  private func initSeedData() {
    // Course 1: Web Development
    let course1 : Course = {
      id = nextCourseId;
      title = "Complete Web Development Bootcamp";
      description = "Learn HTML, CSS, JavaScript, and modern web frameworks";
      category = "Web Development";
      price = 4999;
      thumbnailUrl = "https://images.unsplash.com/photo-1498050108023-c5249f4df085";
      instructorId = Principal.fromText("aaaaa-aa");
      createdAt = Time.now();
      isPublished = true;
    };
    courses.add(nextCourseId, course1);
    nextCourseId += 1;

    // Course 2: Data Science
    let course2 : Course = {
      id = nextCourseId;
      title = "Data Science with Python";
      description = "Master data analysis, visualization, and machine learning";
      category = "Data Science";
      price = 5999;
      thumbnailUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71";
      instructorId = Principal.fromText("aaaaa-aa");
      createdAt = Time.now();
      isPublished = true;
    };
    courses.add(nextCourseId, course2);
    nextCourseId += 1;

    // Course 3: UI/UX Design
    let course3 : Course = {
      id = nextCourseId;
      title = "UI/UX Design Masterclass";
      description = "Learn user interface and user experience design principles";
      category = "Design";
      price = 3999;
      thumbnailUrl = "https://images.unsplash.com/photo-1561070791-2526d30994b5";
      instructorId = Principal.fromText("aaaaa-aa");
      createdAt = Time.now();
      isPublished = true;
    };
    courses.add(nextCourseId, course3);
    nextCourseId += 1;

    // Course 4: Business Strategy
    let course4 : Course = {
      id = nextCourseId;
      title = "Business Strategy Fundamentals";
      description = "Learn strategic planning and business development";
      category = "Business";
      price = 4499;
      thumbnailUrl = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40";
      instructorId = Principal.fromText("aaaaa-aa");
      createdAt = Time.now();
      isPublished = true;
    };
    courses.add(nextCourseId, course4);
    nextCourseId += 1;

    // Course 5: Mobile App Development
    let course5 : Course = {
      id = nextCourseId;
      title = "Mobile App Development with React Native";
      description = "Build cross-platform mobile applications";
      category = "Web Development";
      price = 5499;
      thumbnailUrl = "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c";
      instructorId = Principal.fromText("aaaaa-aa");
      createdAt = Time.now();
      isPublished = true;
    };
    courses.add(nextCourseId, course5);
    nextCourseId += 1;

    // Course 6: Digital Marketing
    let course6 : Course = {
      id = nextCourseId;
      title = "Digital Marketing Mastery";
      description = "Master SEO, social media, and content marketing";
      category = "Business";
      price = 3499;
      thumbnailUrl = "https://images.unsplash.com/photo-1460925895917-afdab827c52f";
      instructorId = Principal.fromText("aaaaa-aa");
      createdAt = Time.now();
      isPublished = true;
    };
    courses.add(nextCourseId, course6);
    nextCourseId += 1;

    // Sections and Lessons for Course 1
    let section1_1 : Section = {
      id = nextSectionId;
      courseId = 1;
      title = "HTML Fundamentals";
      order = 1;
    };
    sections.add(nextSectionId, section1_1);
    let section1_1_id = nextSectionId;
    nextSectionId += 1;

    let section1_2 : Section = {
      id = nextSectionId;
      courseId = 1;
      title = "CSS Styling";
      order = 2;
    };
    sections.add(nextSectionId, section1_2);
    let section1_2_id = nextSectionId;
    nextSectionId += 1;

    let section1_3 : Section = {
      id = nextSectionId;
      courseId = 1;
      title = "JavaScript Basics";
      order = 3;
    };
    sections.add(nextSectionId, section1_3);
    let section1_3_id = nextSectionId;
    nextSectionId += 1;

    // Lessons for Section 1.1
    lessons.add(nextLessonId, {
      id = nextLessonId;
      sectionId = section1_1_id;
      courseId = 1;
      title = "Introduction to HTML";
      videoUrl = "https://www.youtube.com/embed/UB1O30fR-EE";
      duration = 15;
      order = 1;
    });
    nextLessonId += 1;

    lessons.add(nextLessonId, {
      id = nextLessonId;
      sectionId = section1_1_id;
      courseId = 1;
      title = "HTML Tags and Elements";
      videoUrl = "https://www.youtube.com/embed/qz0aGYrrlhU";
      duration = 20;
      order = 2;
    });
    nextLessonId += 1;

    lessons.add(nextLessonId, {
      id = nextLessonId;
      sectionId = section1_1_id;
      courseId = 1;
      title = "HTML Forms";
      videoUrl = "https://www.youtube.com/embed/fNcJuPIZ2WE";
      duration = 25;
      order = 3;
    });
    nextLessonId += 1;

    // Lessons for Section 1.2
    lessons.add(nextLessonId, {
      id = nextLessonId;
      sectionId = section1_2_id;
      courseId = 1;
      title = "CSS Basics";
      videoUrl = "https://www.youtube.com/embed/yfoY53QXEnI";
      duration = 18;
      order = 1;
    });
    nextLessonId += 1;

    lessons.add(nextLessonId, {
      id = nextLessonId;
      sectionId = section1_2_id;
      courseId = 1;
      title = "CSS Flexbox";
      videoUrl = "https://www.youtube.com/embed/JJSoEo8JSnc";
      duration = 22;
      order = 2;
    });
    nextLessonId += 1;

    // Sections and Lessons for Course 2
    let section2_1 : Section = {
      id = nextSectionId;
      courseId = 2;
      title = "Python Fundamentals";
      order = 1;
    };
    sections.add(nextSectionId, section2_1);
    let section2_1_id = nextSectionId;
    nextSectionId += 1;

    let section2_2 : Section = {
      id = nextSectionId;
      courseId = 2;
      title = "Data Analysis with Pandas";
      order = 2;
    };
    sections.add(nextSectionId, section2_2);
    let section2_2_id = nextSectionId;
    nextSectionId += 1;

    lessons.add(nextLessonId, {
      id = nextLessonId;
      sectionId = section2_1_id;
      courseId = 2;
      title = "Python Basics";
      videoUrl = "https://www.youtube.com/embed/_uQrJ0TkZlc";
      duration = 30;
      order = 1;
    });
    nextLessonId += 1;

    lessons.add(nextLessonId, {
      id = nextLessonId;
      sectionId = section2_1_id;
      courseId = 2;
      title = "Python Data Structures";
      videoUrl = "https://www.youtube.com/embed/R-HLU9Fl5ug";
      duration = 35;
      order = 2;
    });
    nextLessonId += 1;

    lessons.add(nextLessonId, {
      id = nextLessonId;
      sectionId = section2_2_id;
      courseId = 2;
      title = "Introduction to Pandas";
      videoUrl = "https://www.youtube.com/embed/vmEHCJofslg";
      duration = 28;
      order = 1;
    });
    nextLessonId += 1;

    // Continue with other courses (abbreviated for brevity)
    // Course 3 sections
    let section3_1 : Section = {
      id = nextSectionId;
      courseId = 3;
      title = "Design Principles";
      order = 1;
    };
    sections.add(nextSectionId, section3_1);
    let section3_1_id = nextSectionId;
    nextSectionId += 1;

    lessons.add(nextLessonId, {
      id = nextLessonId;
      sectionId = section3_1_id;
      courseId = 3;
      title = "UI Design Fundamentals";
      videoUrl = "https://www.youtube.com/embed/c9Wg6Cb_YlU";
      duration = 25;
      order = 1;
    });
    nextLessonId += 1;

    lessons.add(nextLessonId, {
      id = nextLessonId;
      sectionId = section3_1_id;
      courseId = 3;
      title = "Color Theory";
      videoUrl = "https://www.youtube.com/embed/GyVMoejbGFg";
      duration = 20;
      order = 2;
    });
    nextLessonId += 1;

    // Course 4 sections
    let section4_1 : Section = {
      id = nextSectionId;
      courseId = 4;
      title = "Strategic Planning";
      order = 1;
    };
    sections.add(nextSectionId, section4_1);
    let section4_1_id = nextSectionId;
    nextSectionId += 1;

    lessons.add(nextLessonId, {
      id = nextLessonId;
      sectionId = section4_1_id;
      courseId = 4;
      title = "Business Strategy Basics";
      videoUrl = "https://www.youtube.com/embed/df4J2AjZDCk";
      duration = 30;
      order = 1;
    });
    nextLessonId += 1;

    // Course 5 sections
    let section5_1 : Section = {
      id = nextSectionId;
      courseId = 5;
      title = "React Native Basics";
      order = 1;
    };
    sections.add(nextSectionId, section5_1);
    let section5_1_id = nextSectionId;
    nextSectionId += 1;

    lessons.add(nextLessonId, {
      id = nextLessonId;
      sectionId = section5_1_id;
      courseId = 5;
      title = "Getting Started with React Native";
      videoUrl = "https://www.youtube.com/embed/0-S5a0eXPoc";
      duration = 40;
      order = 1;
    });
    nextLessonId += 1;

    // Course 6 sections
    let section6_1 : Section = {
      id = nextSectionId;
      courseId = 6;
      title = "SEO Fundamentals";
      order = 1;
    };
    sections.add(nextSectionId, section6_1);
    let section6_1_id = nextSectionId;
    nextSectionId += 1;

    lessons.add(nextLessonId, {
      id = nextLessonId;
      sectionId = section6_1_id;
      courseId = 6;
      title = "Introduction to SEO";
      videoUrl = "https://www.youtube.com/embed/hF515-0Tduk";
      duration = 22;
      order = 1;
    });
    nextLessonId += 1;
  };

  // Initialize seed data on first deployment
  initSeedData();

  // Course Management (admin)
  public shared ({ caller }) func createCourse(title : Text, description : Text, category : Text, price : Nat, thumbnailUrl : Text) : async Course {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can create courses.");
    };

    let courseId = nextCourseId;
    nextCourseId += 1;
    let course : Course = {
      id = courseId;
      title;
      description;
      category;
      price;
      thumbnailUrl;
      instructorId = caller;
      createdAt = Time.now();
      isPublished = false;
    };

    courses.add(courseId, course);
    course;
  };

  public shared ({ caller }) func updateCourse(id : Nat, title : Text, description : Text, category : Text, price : Nat, thumbnailUrl : Text, isPublished : Bool) : async Course {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can update courses.");
    };

    switch (courses.get(id)) {
      case (null) { Runtime.trap("Course does not exist") };
      case (?existingCourse) {
        let updatedCourse : Course = {
          id;
          title;
          description;
          category;
          price;
          thumbnailUrl;
          instructorId = existingCourse.instructorId;
          createdAt = existingCourse.createdAt;
          isPublished;
        };
        courses.add(id, updatedCourse);
        updatedCourse;
      };
    };
  };

  public shared ({ caller }) func deleteCourse(id : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can delete courses.");
    };

    switch (courses.get(id)) {
      case (null) { false };
      case (_) {
        courses.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getCourses() : async [Course] {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      courses.values().toArray().sort();
    } else {
      courses.values().toArray().filter(
        func(course) {
          course.isPublished;
        }
      ).sort();
    };
  };

  public query ({ caller }) func getCourseById(id : Nat) : async ?Course {
    switch (courses.get(id)) {
      case (null) { null };
      case (?course) {
        if (course.isPublished or AccessControl.isAdmin(accessControlState, caller)) {
          ?course;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func getAdminCourses() : async [Course] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can access this resource.");
    };
    courses.values().toArray().filter(
      func(course) { course.instructorId == caller }
    ).sort();
  };

  // Section & Lesson Management (admin)
  public shared ({ caller }) func addSection(courseId : Nat, title : Text, order : Nat) : async Section {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can add sections.");
    };

    let sectionId = nextSectionId;
    nextSectionId += 1;
    let section : Section = {
      id = sectionId;
      courseId;
      title;
      order;
    };

    sections.add(sectionId, section);
    section;
  };

  public shared ({ caller }) func updateSection(id : Nat, title : Text, order : Nat) : async Section {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can update sections.");
    };

    switch (sections.get(id)) {
      case (null) { Runtime.trap("Section does not exist") };
      case (?existingSection) {
        let updatedSection : Section = {
          id;
          courseId = existingSection.courseId;
          title;
          order;
        };
        sections.add(id, updatedSection);
        updatedSection;
      };
    };
  };

  public shared ({ caller }) func deleteSection(id : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can delete sections.");
    };

    switch (sections.get(id)) {
      case (null) { false };
      case (_) {
        sections.remove(id);
        true;
      };
    };
  };

  public shared ({ caller }) func addLesson(sectionId : Nat, courseId : Nat, title : Text, videoUrl : Text, duration : Nat, order : Nat) : async Lesson {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can add lessons.");
    };

    let lessonId = nextLessonId;
    nextLessonId += 1;
    let lesson : Lesson = {
      id = lessonId;
      sectionId;
      courseId;
      title;
      videoUrl;
      duration;
      order;
    };

    lessons.add(lessonId, lesson);
    lesson;
  };

  public shared ({ caller }) func updateLesson(id : Nat, title : Text, videoUrl : Text, duration : Nat, order : Nat) : async Lesson {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can update lessons.");
    };

    switch (lessons.get(id)) {
      case (null) { Runtime.trap("Lesson does not exist") };
      case (?existingLesson) {
        let updatedLesson : Lesson = {
          id;
          sectionId = existingLesson.sectionId;
          courseId = existingLesson.courseId;
          title;
          videoUrl;
          duration;
          order;
        };
        lessons.add(id, updatedLesson);
        updatedLesson;
      };
    };
  };

  public shared ({ caller }) func deleteLesson(id : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can delete lessons.");
    };

    switch (lessons.get(id)) {
      case (null) { false };
      case (_) {
        lessons.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getCourseCurriculum(courseId : Nat) : async [(Section, [Lesson])] {
    // Check if user is enrolled or is admin
    let isEnrolledUser = enrollments.values().toArray().find(
      func(enr) { enr.studentId == caller and enr.courseId == courseId }
    ) != null;

    let isAdminUser = AccessControl.isAdmin(accessControlState, caller);

    if (not isEnrolledUser and not isAdminUser) {
      Runtime.trap("Unauthorized: Must be enrolled in course or be an admin to view curriculum.");
    };

    let courseSections = sections.values().toArray().filter(
      func(section) { section.courseId == courseId }
    ).sort();

    courseSections.map(
      func(section) {
        let sectionLessons = lessons.values().toArray().filter(
          func(lesson) { lesson.sectionId == section.id }
        ).sort();
        (section, sectionLessons);
      }
    );
  };

  // Enrollment (student)
  public shared ({ caller }) func enrollCourse(courseId : Nat) : async Enrollment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can enroll in courses.");
    };

    // Check if already enrolled
    let alreadyEnrolled = enrollments.values().toArray().find(
      func(enr) { enr.studentId == caller and enr.courseId == courseId }
    );

    switch (alreadyEnrolled) {
      case (?existing) { Runtime.trap("Already enrolled in this course") };
      case (null) {
        let enrollmentId = nextEnrollmentId;
        nextEnrollmentId += 1;
        let enrollment : Enrollment = {
          id = enrollmentId;
          studentId = caller;
          courseId;
          enrolledAt = Time.now();
        };

        enrollments.add(enrollmentId, enrollment);
        enrollment;
      };
    };
  };

  public query ({ caller }) func getMyEnrollments() : async [Enrollment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view enrollments.");
    };

    enrollments.values().toArray().filter(
      func(enr) { enr.studentId == caller }
    );
  };

  public query ({ caller }) func isEnrolled(courseId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check enrollment status.");
    };

    enrollments.values().toArray().find(
      func(enr) { enr.studentId == caller and enr.courseId == courseId }
    ) != null;
  };

  public query ({ caller }) func getAllEnrollments() : async [Enrollment] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can view all enrollments.");
    };

    enrollments.values().toArray();
  };

  // Progress (student)
  public shared ({ caller }) func markLessonComplete(lessonId : Nat, courseId : Nat) : async LessonProgress {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark lesson completion.");
    };

    // Check if user is enrolled in the course
    let isEnrolledUser = enrollments.values().toArray().find(
      func(enr) { enr.studentId == caller and enr.courseId == courseId }
    ) != null;

    if (not isEnrolledUser) {
      Runtime.trap("Unauthorized: Must be enrolled in course to mark lessons complete.");
    };

    let lessonProgress : LessonProgress = {
      studentId = caller;
      lessonId;
      courseId;
      completedAt = Time.now();
    };

    let userProgress = switch (progress.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, LessonProgress>();
        progress.add(caller, newMap);
        newMap;
      };
      case (?existing) { existing };
    };

    userProgress.add(lessonId, lessonProgress);

    lessonProgress;
  };

  public query ({ caller }) func getCourseProgress(courseId : Nat) : async { completedLessons : Nat; totalLessons : Nat; percentage : Nat } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view progress.");
    };

    let totalLessons = lessons.values().toArray().filter(
      func(lesson) { lesson.courseId == courseId }
    ).size();

    let completedLessons = switch (progress.get(caller)) {
      case (null) { 0 };
      case (?userProgress) {
        userProgress.values().toArray().filter(
          func(lp) { lp.courseId == courseId }
        ).size();
      };
    };

    let percentage = if (totalLessons == 0) { 0 } else { (completedLessons * 100) / totalLessons };

    { completedLessons; totalLessons; percentage };
  };

  public query ({ caller }) func getMyProgress() : async [{ courseId : Nat; percentage : Nat }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view progress.");
    };

    let myEnrollments = enrollments.values().toArray().filter(
      func(enr) { enr.studentId == caller }
    );

    myEnrollments.map(
      func(enrollment) {
        let totalLessons = lessons.values().toArray().filter(
          func(lesson) { lesson.courseId == enrollment.courseId }
        ).size();

        let completedLessons = switch (progress.get(caller)) {
          case (null) { 0 };
          case (?userProgress) {
            userProgress.values().toArray().filter(
              func(lp) { lp.courseId == enrollment.courseId }
            ).size();
          };
        };

        let percentage = if (totalLessons == 0) { 0 } else { (completedLessons * 100) / totalLessons };

        { courseId = enrollment.courseId; percentage };
      }
    );
  };

  // Admin Stats
  public query ({ caller }) func getStats() : async { totalCourses : Nat; totalStudents : Nat; totalEnrollments : Nat } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can view stats.");
    };

    let totalCourses = courses.size();
    let totalEnrollments = enrollments.size();
    
    // Count unique students
    let studentSet = Map.empty<Principal, Bool>();
    for (enrollment in enrollments.values()) {
      studentSet.add(enrollment.studentId, true);
    };
    let totalStudents = studentSet.size();

    { totalCourses; totalStudents; totalEnrollments };
  };

  public query ({ caller }) func getAllStudents() : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can view all students.");
    };

    userProfiles.values().toArray().filter(
      func(profile) { profile.role == "student" }
    );
  };
};
