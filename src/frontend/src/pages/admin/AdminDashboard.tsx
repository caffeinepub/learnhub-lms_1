import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Eye,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import React from "react";
import { useAdminCourses, useStats } from "../../hooks/useQueries";
import { formatPrice, getThumbnailUrl } from "../../utils/helpers";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: courses = [], isLoading: coursesLoading } = useAdminCourses();

  const statCards = [
    {
      title: "Total Courses",
      value: statsLoading ? null : Number(stats?.totalCourses || 0),
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
      change: "+12% this month",
    },
    {
      title: "Total Students",
      value: statsLoading ? null : Number(stats?.totalStudents || 0),
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
      change: "+8% this month",
    },
    {
      title: "Total Enrollments",
      value: statsLoading ? null : Number(stats?.totalEnrollments || 0),
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
      change: "+24% this month",
    },
  ];

  const recentCourses = courses.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Welcome back! Here's what's happening on LearnHub.
          </p>
        </div>
        <Link
          to="/admin/courses/new"
          className="flex items-center gap-2 btn-cta text-sm py-2 px-4 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          New Course
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map(({ title, value, icon: Icon, color, bg, change }) => (
          <div
            key={title}
            className="bg-card rounded-xl border border-border p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                {title}
              </span>
              <div
                className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            {value === null ? (
              <Skeleton className="h-8 w-20 mb-1" />
            ) : (
              <div className="text-3xl font-display font-bold text-foreground mb-1">
                {value.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-green-600 font-medium">{change}</p>
          </div>
        ))}
      </div>

      {/* Recent courses */}
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-base text-foreground">
            Recent Courses
          </h2>
          <Link
            to="/admin/courses"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {coursesLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-14 h-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentCourses.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No courses yet. Create your first course!
            </p>
            <Link
              to="/admin/courses/new"
              className="mt-4 inline-flex items-center gap-2 btn-cta text-sm py-2 px-4 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Create Course
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentCourses.map((course) => (
              <div
                key={course.id.toString()}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
              >
                <img
                  src={getThumbnailUrl(course.thumbnailUrl, course.id)}
                  alt={course.title}
                  className="w-14 h-10 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {course.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {course.category} • {formatPrice(course.price)}
                  </p>
                </div>
                <Badge
                  variant={course.isPublished ? "default" : "secondary"}
                  className="flex-shrink-0"
                >
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/admin/courses/$courseId/edit",
                      params: { courseId: course.id.toString() },
                    })
                  }
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline flex-shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick stats chart placeholder */}
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-base text-foreground">
            Platform Overview
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              label: "Published Courses",
              value: courses.filter((c) => c.isPublished).length,
            },
            {
              label: "Draft Courses",
              value: courses.filter((c) => !c.isPublished).length,
            },
            {
              label: "Free Courses",
              value: courses.filter((c) => c.price === 0n).length,
            },
            {
              label: "Paid Courses",
              value: courses.filter((c) => c.price > 0n).length,
            },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-display font-bold text-foreground">
                {value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
