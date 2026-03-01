import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Lesson {
    id: bigint;
    title: string;
    duration: bigint;
    order: bigint;
    sectionId: bigint;
    videoUrl: string;
    courseId: bigint;
}
export interface Enrollment {
    id: bigint;
    studentId: Principal;
    enrolledAt: Time;
    courseId: bigint;
}
export interface Section {
    id: bigint;
    title: string;
    order: bigint;
    courseId: bigint;
}
export interface LessonProgress {
    lessonId: bigint;
    completedAt: Time;
    studentId: Principal;
    courseId: bigint;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export interface Course {
    id: bigint;
    title: string;
    thumbnailUrl: string;
    isPublished: boolean;
    createdAt: Time;
    description: string;
    instructorId: Principal;
    category: string;
    price: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLesson(sectionId: bigint, courseId: bigint, title: string, videoUrl: string, duration: bigint, order: bigint): Promise<Lesson>;
    addSection(courseId: bigint, title: string, order: bigint): Promise<Section>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCourse(title: string, description: string, category: string, price: bigint, thumbnailUrl: string): Promise<Course>;
    deleteCourse(id: bigint): Promise<boolean>;
    deleteLesson(id: bigint): Promise<boolean>;
    deleteSection(id: bigint): Promise<boolean>;
    enrollCourse(courseId: bigint): Promise<Enrollment>;
    getAdminCourses(): Promise<Array<Course>>;
    getAllEnrollments(): Promise<Array<Enrollment>>;
    getAllStudents(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourseById(id: bigint): Promise<Course | null>;
    getCourseCurriculum(courseId: bigint): Promise<Array<[Section, Array<Lesson>]>>;
    getCourseProgress(courseId: bigint): Promise<{
        totalLessons: bigint;
        completedLessons: bigint;
        percentage: bigint;
    }>;
    getCourses(): Promise<Array<Course>>;
    getMyEnrollments(): Promise<Array<Enrollment>>;
    getMyProgress(): Promise<Array<{
        courseId: bigint;
        percentage: bigint;
    }>>;
    getStats(): Promise<{
        totalEnrollments: bigint;
        totalStudents: bigint;
        totalCourses: bigint;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isEnrolled(courseId: bigint): Promise<boolean>;
    markLessonComplete(lessonId: bigint, courseId: bigint): Promise<LessonProgress>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCourse(id: bigint, title: string, description: string, category: string, price: bigint, thumbnailUrl: string, isPublished: boolean): Promise<Course>;
    updateLesson(id: bigint, title: string, videoUrl: string, duration: bigint, order: bigint): Promise<Lesson>;
    updateSection(id: bigint, title: string, order: bigint): Promise<Section>;
}
