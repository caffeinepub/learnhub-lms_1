import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

import { CourseCatalogPage } from "./pages/CourseCatalogPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { LessonViewerPage } from "./pages/LessonViewerPage";
// Pages
import { LoginPage } from "./pages/LoginPage";
import { MyLearningPage } from "./pages/MyLearningPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminCourseEditorPage } from "./pages/admin/AdminCourseEditorPage";
import { AdminCoursesPage } from "./pages/admin/AdminCoursesPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminNewCoursePage } from "./pages/admin/AdminNewCoursePage";
import { AdminStudentsPage } from "./pages/admin/AdminStudentsPage";

import { AdminLayout } from "./components/AdminLayout";
// Layouts
import { Navbar } from "./components/Navbar";

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  ),
});

function AppContent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

// ============ PUBLIC ROUTES ============
const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public-layout",
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/register",
  component: RegisterPage,
});

// ============ STUDENT ROUTES ============
const studentLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "student-layout",
  component: () => (
    <>
      <Navbar />
      <Outlet />
    </>
  ),
});

const coursesRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/courses",
  component: CourseCatalogPage,
});

const courseDetailRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/courses/$courseId",
  component: CourseDetailPage,
});

const myLearningRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/my-learning",
  component: MyLearningPage,
});

// Lesson viewer (full screen, no standard navbar)
const lessonViewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/learn/$courseId/$lessonId",
  component: LessonViewerPage,
});

// ============ ADMIN ROUTES ============
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin-layout",
  component: AdminLayout,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin",
  component: AdminDashboard,
});

const adminCoursesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/courses",
  component: AdminCoursesPage,
});

const adminNewCourseRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/courses/new",
  component: AdminNewCoursePage,
});

const adminEditCourseRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/courses/$courseId/edit",
  component: AdminCourseEditorPage,
});

const adminStudentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/students",
  component: AdminStudentsPage,
});

// ============ INDEX REDIRECT ============
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexRedirect,
});

function IndexRedirect() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { userProfile, isAdmin, isLoadingProfile } = useAuth();

  useEffect(() => {
    if (isInitializing || isLoadingProfile) return;
    if (!identity) {
      navigate({ to: "/login" });
      return;
    }
    if (!userProfile) {
      navigate({ to: "/register" });
      return;
    }
    if (isAdmin) {
      navigate({ to: "/admin" });
    } else {
      navigate({ to: "/courses" });
    }
  }, [
    identity,
    userProfile,
    isAdmin,
    isInitializing,
    isLoadingProfile,
    navigate,
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading LearnHub...</p>
      </div>
    </div>
  );
}

// ============ ROUTER ============
const routeTree = rootRoute.addChildren([
  indexRoute,
  publicLayoutRoute.addChildren([loginRoute, registerRoute]),
  studentLayoutRoute.addChildren([
    coursesRoute,
    courseDetailRoute,
    myLearningRoute,
  ]),
  lessonViewerRoute,
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminCoursesRoute,
    adminNewCourseRoute,
    adminEditCourseRoute,
    adminStudentsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
