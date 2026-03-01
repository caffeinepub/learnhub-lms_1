import { useNavigate } from "@tanstack/react-router";
import { BookMarked, PlayCircle, TrendingUp } from "lucide-react";
import React from "react";
import { CourseCard, CourseCardSkeleton } from "../components/CourseCard";
import {
  useCourses,
  useMyEnrollments,
  useMyProgress,
} from "../hooks/useQueries";

export function MyLearningPage() {
  const navigate = useNavigate();
  const { data: enrollments = [], isLoading: enrollmentsLoading } =
    useMyEnrollments();
  const { data: allCourses = [], isLoading: coursesLoading } = useCourses();
  const { data: progressList = [], isLoading: progressLoading } =
    useMyProgress();

  const isLoading = enrollmentsLoading || coursesLoading || progressLoading;

  const enrolledCourses = React.useMemo(() => {
    const enrolledIds = new Set(enrollments.map((e) => e.courseId.toString()));
    return allCourses.filter((c) => enrolledIds.has(c.id.toString()));
  }, [enrollments, allCourses]);

  const progressMap = React.useMemo(
    () =>
      Object.fromEntries(
        progressList.map((p) => [p.courseId.toString(), Number(p.percentage)]),
      ),
    [progressList],
  );

  const _completedCount = progressList.filter(
    (p) => p.percentage >= 100n,
  ).length;
  const inProgressCount = progressList.filter(
    (p) => p.percentage > 0n && p.percentage < 100n,
  ).length;
  const avgProgress =
    progressList.length > 0
      ? Math.round(
          progressList.reduce((sum, p) => sum + Number(p.percentage), 0) /
            progressList.length,
        )
      : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="py-10 text-white"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.20 0.08 264) 0%, oklch(0.16 0.06 280) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
            My Learning
          </h1>
          <p className="text-white/70">
            Track your progress and continue where you left off.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats row */}
        {!isLoading && enrolledCourses.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              {
                icon: BookMarked,
                value: enrolledCourses.length,
                label: "Enrolled",
                color: "text-primary",
              },
              {
                icon: PlayCircle,
                value: inProgressCount,
                label: "In Progress",
                color: "text-amber-500",
              },
              {
                icon: TrendingUp,
                value: `${avgProgress}%`,
                label: "Avg. Progress",
                color: "text-green-500",
              },
            ].map(({ icon: Icon, value, label, color }) => (
              <div
                key={label}
                className="bg-card rounded-xl border border-border p-4 text-center shadow-card"
              >
                <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                <div className={`text-2xl font-display font-bold ${color}`}>
                  {value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Courses */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loading
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-24">
            <BookMarked className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-2xl text-foreground mb-3">
              No courses yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              You haven't enrolled in any courses yet. Browse our catalog to
              find something you'll love.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/courses" })}
              className="btn-cta py-3 px-8 rounded-lg text-base font-semibold"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl text-foreground">
                Your Courses ({enrolledCourses.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {enrolledCourses.map((course) => (
                <CourseCard
                  key={course.id.toString()}
                  course={course}
                  enrolled={true}
                  showProgress={true}
                  progressPercentage={progressMap[course.id.toString()] ?? 0}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-border py-8 text-center">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
