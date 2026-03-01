import { Input } from "@/components/ui/input";
import { BookOpen, Filter, Search } from "lucide-react";
import React, { useState, useMemo } from "react";
import { CourseCard, CourseCardSkeleton } from "../components/CourseCard";
import {
  useCourses,
  useMyEnrollments,
  useMyProgress,
} from "../hooks/useQueries";
import { CATEGORIES } from "../utils/helpers";

export function CourseCatalogPage() {
  const { data: courses = [], isLoading } = useCourses();
  const { data: enrollments = [] } = useMyEnrollments();
  const { data: progressList = [] } = useMyProgress();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const enrolledCourseIds = useMemo(
    () => new Set(enrollments.map((e) => e.courseId.toString())),
    [enrollments],
  );

  const progressMap = useMemo(
    () =>
      Object.fromEntries(
        progressList.map((p) => [p.courseId.toString(), Number(p.percentage)]),
      ),
    [progressList],
  );

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        !searchQuery ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || course.category === selectedCategory;
      return matchesSearch && matchesCategory && course.isPublished;
    });
  }, [courses, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <div
        className="py-16 text-white"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.20 0.08 264) 0%, oklch(0.16 0.06 280) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-4 leading-tight">
              Expand your
              <br />
              <span style={{ color: "oklch(0.72 0.19 45)" }}>knowledge</span>{" "}
              today
            </h1>
            <p className="text-white/70 text-lg mb-8">
              Discover expert-led courses across web development, design, data
              science, and more.
            </p>

            {/* Search bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-13 text-base bg-white text-foreground border-white shadow-lg rounded-xl pr-4 py-3.5 focus:ring-2 w-full"
                style={{ height: "52px" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-semibold text-xl text-foreground">
              {selectedCategory === "All" ? "All Courses" : selectedCategory}
            </h2>
            {!isLoading && (
              <p className="text-muted-foreground text-sm mt-0.5">
                {filteredCourses.length}{" "}
                {filteredCourses.length === 1 ? "course" : "courses"} available
              </p>
            )}
          </div>
        </div>

        {/* Course grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loading
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              No courses found
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? `No courses match "${searchQuery}". Try a different search term.`
                : "No courses in this category yet. Check back soon!"}
            </p>
            {(searchQuery || selectedCategory !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 text-primary hover:underline text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id.toString()}
                course={course}
                enrolled={enrolledCourseIds.has(course.id.toString())}
                showProgress={enrolledCourseIds.has(course.id.toString())}
                progressPercentage={progressMap[course.id.toString()] ?? 0}
              />
            ))}
          </div>
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
