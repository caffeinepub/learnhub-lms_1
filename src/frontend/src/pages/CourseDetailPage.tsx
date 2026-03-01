import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Lock,
  Play,
  Star,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import {
  useCourseById,
  useCourseCurriculum,
  useCourseProgress,
  useEnrollCourse,
  useIsEnrolled,
} from "../hooks/useQueries";
import {
  formatDuration,
  formatPrice,
  getCategoryColor,
  getThumbnailUrl,
} from "../utils/helpers";

export function CourseDetailPage() {
  const { courseId } = useParams({ from: "/student-layout/courses/$courseId" });
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const courseIdBigInt = BigInt(courseId);

  const { data: course, isLoading: courseLoading } =
    useCourseById(courseIdBigInt);
  const { data: curriculum = [], isLoading: curriculumLoading } =
    useCourseCurriculum(courseIdBigInt);
  const { data: isEnrolled = false, isLoading: enrolledLoading } =
    useIsEnrolled(courseIdBigInt);
  const { data: progress } = useCourseProgress(
    isEnrolled ? courseIdBigInt : null,
  );
  const enrollMutation = useEnrollCourse();

  const totalLessons = curriculum.reduce(
    (sum, [, lessons]) => sum + lessons.length,
    0,
  );
  const totalDuration = curriculum.reduce(
    (sum, [, lessons]) => sum + lessons.reduce((s, l) => s + l.duration, 0n),
    0n,
  );

  const handleEnroll = async () => {
    if (!userProfile) {
      toast.error("Please sign in to enroll in courses.");
      navigate({ to: "/login" });
      return;
    }
    try {
      await enrollMutation.mutateAsync(courseIdBigInt);
      toast.success("Successfully enrolled! Start learning now.");
    } catch (_err) {
      toast.error("Enrollment failed. Please try again.");
    }
  };

  const handleStartLearning = () => {
    if (curriculum.length > 0 && curriculum[0][1].length > 0) {
      const firstLesson = curriculum[0][1][0];
      navigate({ to: `/learn/${courseId}/${firstLesson.id.toString()}` });
    }
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Course Not Found
          </h2>
          <p className="text-muted-foreground mb-4">
            This course doesn't exist or has been removed.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/courses" })}
            className="btn-cta"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const thumbnail = getThumbnailUrl(course.thumbnailUrl, course.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div
        className="py-12 text-white"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.20 0.08 264) 0%, oklch(0.16 0.06 280) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-4 inline-block ${getCategoryColor(course.category)} bg-opacity-20`}
              style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
            >
              {course.category || "General"}
            </span>
            <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight mb-4">
              {course.title}
            </h1>
            <p className="text-white/75 text-lg mb-6 leading-relaxed">
              {course.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-white font-medium">4.5</span>
                <span>(2,847 ratings)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>12,390 students</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{totalLessons} lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(totalDuration)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            <section>
              <h2 className="font-display font-bold text-xl text-foreground mb-4">
                What you'll learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-6 rounded-xl border border-border bg-muted/20">
                {[
                  "Industry-standard best practices",
                  "Real-world project experience",
                  "Expert-led instruction",
                  "Hands-on exercises",
                  "Career-ready skills",
                  "Certificate of completion",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section>
              <h2 className="font-display font-bold text-xl text-foreground mb-4">
                Course Curriculum
              </h2>
              <div className="text-sm text-muted-foreground mb-4">
                {curriculum.length} sections • {totalLessons} lessons •{" "}
                {formatDuration(totalDuration)} total length
              </div>

              {curriculumLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : curriculum.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xl">
                  <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">
                    No curriculum added yet.
                  </p>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-3">
                  {curriculum
                    .sort((a, b) => Number(a[0].order) - Number(b[0].order))
                    .map(([section, lessons], _idx) => (
                      <AccordionItem
                        key={section.id.toString()}
                        value={section.id.toString()}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:bg-muted/30 hover:no-underline [&[data-state=open]]:bg-muted/30">
                          <div className="flex items-center gap-3 text-left flex-1">
                            <span className="font-semibold text-foreground">
                              {section.title}
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto mr-2">
                              {lessons.length} lessons
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-0">
                          <div className="divide-y divide-border">
                            {lessons
                              .sort((a, b) => Number(a.order) - Number(b.order))
                              .map((lesson) => (
                                <div
                                  key={lesson.id.toString()}
                                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    {isEnrolled ? (
                                      <Play className="w-4 h-4 text-primary flex-shrink-0" />
                                    ) : (
                                      <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    )}
                                    <span className="text-sm text-foreground">
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                    {formatDuration(lesson.duration)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              )}
            </section>

            {/* Description */}
            <section>
              <h2 className="font-display font-bold text-xl text-foreground mb-4">
                Course Description
              </h2>
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                <p>{course.description}</p>
              </div>
            </section>
          </div>

          {/* Right sticky card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-card rounded-2xl shadow-card-hover border border-border overflow-hidden">
                {/* Thumbnail */}
                <div className="aspect-video overflow-hidden">
                  <img
                    src={thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Card content */}
                <div className="p-6 space-y-4">
                  {/* Price */}
                  <div className="text-3xl font-display font-bold text-foreground">
                    {formatPrice(course.price)}
                  </div>

                  {/* Progress (if enrolled) */}
                  {isEnrolled && progress && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">
                          Your progress
                        </span>
                        <span className="font-semibold text-primary">
                          {Number(progress.percentage)}%
                        </span>
                      </div>
                      <Progress
                        value={Number(progress.percentage)}
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* CTA button */}
                  {enrolledLoading ? (
                    <div className="h-12 skeleton rounded-lg" />
                  ) : isEnrolled ? (
                    <button
                      type="button"
                      onClick={handleStartLearning}
                      className="w-full btn-cta py-3 text-base rounded-lg flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Continue Learning
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEnroll}
                      disabled={enrollMutation.isPending}
                      className="w-full btn-cta py-3 text-base rounded-lg flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {enrollMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <BookOpen className="w-5 h-5" />
                          {course.price === 0n
                            ? "Enroll for Free"
                            : "Enroll Now"}
                        </>
                      )}
                    </button>
                  )}

                  {/* Course details */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <h4 className="font-semibold text-sm text-foreground">
                      This course includes:
                    </h4>
                    {[
                      {
                        icon: BookOpen,
                        text: `${totalLessons} on-demand lessons`,
                      },
                      {
                        icon: Clock,
                        text: `${formatDuration(totalDuration)} of content`,
                      },
                      { icon: CheckCircle, text: "Certificate of completion" },
                      { icon: Users, text: "Access to community" },
                    ].map(({ icon: Icon, text }) => (
                      <div
                        key={text}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
