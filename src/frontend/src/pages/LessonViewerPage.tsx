import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Menu,
  PlayCircle,
  X,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import type { Lesson, Section } from "../backend.d";
import {
  useCourseById,
  useCourseCurriculum,
  useCourseProgress,
  useMarkLessonComplete,
} from "../hooks/useQueries";
import { formatDuration, getYouTubeEmbedUrl } from "../utils/helpers";

export function LessonViewerPage() {
  const { courseId, lessonId } = useParams({
    from: "/learn/$courseId/$lessonId" as const,
  });
  const navigate = useNavigate();
  const courseIdBigInt = BigInt(courseId);
  const lessonIdBigInt = BigInt(lessonId);

  const { data: course } = useCourseById(courseIdBigInt);
  const { data: curriculum = [], isLoading } =
    useCourseCurriculum(courseIdBigInt);
  const { data: progress, refetch: refetchProgress } =
    useCourseProgress(courseIdBigInt);
  const markComplete = useMarkLessonComplete();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(),
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Find current lesson
  const allLessons = useMemo(() => {
    return curriculum
      .slice()
      .sort((a, b) => Number(a[0].order) - Number(b[0].order))
      .flatMap(([section, sectionLessons]) =>
        sectionLessons
          .slice()
          .sort((a, b) => Number(a.order) - Number(b.order))
          .map((lesson) => ({ section, lesson })),
      );
  }, [curriculum]);

  const currentIdx = allLessons.findIndex(
    (l) => l.lesson.id.toString() === lessonId,
  );
  const currentItem = allLessons[currentIdx];
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson =
    currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const handleMarkComplete = async () => {
    if (!currentItem) return;
    try {
      await markComplete.mutateAsync({
        lessonId: lessonIdBigInt,
        courseId: courseIdBigInt,
      });
      setCompletedLessons((prev) => new Set([...prev, lessonId]));
      await refetchProgress();
      toast.success("Lesson marked as complete!");
      // Auto-advance to next lesson
      if (nextLesson) {
        setTimeout(() => {
          navigate({
            to: "/learn/$courseId/$lessonId",
            params: { courseId, lessonId: nextLesson.lesson.id.toString() },
          });
        }, 1000);
      }
    } catch {
      toast.error("Failed to mark lesson complete.");
    }
  };

  const embedUrl = currentItem
    ? getYouTubeEmbedUrl(currentItem.lesson.videoUrl)
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 h-14 text-white flex-shrink-0 z-40"
        style={{ background: "oklch(0.16 0.04 255)" }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/my-learning" })}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">My Learning</span>
          </button>
          <span className="text-white/30">|</span>
          <span className="font-display font-medium text-sm truncate max-w-xs">
            {course?.title || "Loading..."}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {progress && (
            <div className="hidden md:flex items-center gap-3">
              <Progress
                value={Number(progress.percentage)}
                className="w-32 h-2"
              />
              <span className="text-white/70 text-sm">
                {Number(progress.percentage)}% complete
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/70 hover:text-white transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Video */}
          <div className="bg-black">
            {isLoading ? (
              <div className="aspect-video skeleton" />
            ) : embedUrl ? (
              <div className="aspect-video">
                <iframe
                  src={embedUrl}
                  title={currentItem?.lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center text-white/50">
                  <PlayCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    No video URL provided for this lesson
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Lesson info */}
          <div className="p-6 max-w-4xl">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : currentItem ? (
              <>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">
                      {currentItem.section.title}
                    </p>
                    <h1 className="font-display font-bold text-2xl text-foreground">
                      {currentItem.lesson.title}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                    <PlayCircle className="w-4 h-4" />
                    {formatDuration(currentItem.lesson.duration)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleMarkComplete}
                    disabled={
                      markComplete.isPending || completedLessons.has(lessonId)
                    }
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      completedLessons.has(lessonId)
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-primary text-white hover:bg-primary/90"
                    } disabled:opacity-60`}
                  >
                    {markComplete.isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : completedLessons.has(lessonId) ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    {completedLessons.has(lessonId)
                      ? "Completed!"
                      : "Mark as Complete"}
                  </button>

                  {/* Navigation */}
                  <div className="flex gap-2">
                    {prevLesson && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/learn/$courseId/$lessonId",
                            params: {
                              courseId,
                              lessonId: prevLesson.lesson.id.toString(),
                            },
                          })
                        }
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors text-foreground"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                    )}
                    {nextLesson && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/learn/$courseId/$lessonId",
                            params: {
                              courseId,
                              lessonId: nextLesson.lesson.id.toString(),
                            },
                          })
                        }
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground">Lesson not found</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar curriculum */}
        {sidebarOpen && (
          <div
            className="w-80 flex-shrink-0 border-l border-border flex flex-col"
            style={{ background: "oklch(var(--card))" }}
          >
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-semibold text-sm text-foreground">
                Course Content
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {allLessons.length} lessons •{" "}
                {progress
                  ? `${Number(progress.percentage)}% complete`
                  : "0% complete"}
              </p>
            </div>

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="py-2">
                  {curriculum
                    .sort((a, b) => Number(a[0].order) - Number(b[0].order))
                    .map(([section, lessons]) => (
                      <div key={section.id.toString()}>
                        {/* Section header */}
                        <div className="px-4 py-3 bg-muted/40">
                          <p className="font-semibold text-xs text-foreground uppercase tracking-wide">
                            {section.title}
                          </p>
                        </div>
                        {/* Lessons */}
                        {lessons
                          .sort((a, b) => Number(a.order) - Number(b.order))
                          .map((lesson) => {
                            const isCurrentLesson =
                              lesson.id.toString() === lessonId;
                            const isDone = completedLessons.has(
                              lesson.id.toString(),
                            );
                            return (
                              <button
                                key={lesson.id.toString()}
                                type="button"
                                onClick={() =>
                                  navigate({
                                    to: "/learn/$courseId/$lessonId",
                                    params: {
                                      courseId,
                                      lessonId: lesson.id.toString(),
                                    },
                                  })
                                }
                                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                                  isCurrentLesson
                                    ? "bg-primary/10 border-r-2 border-primary"
                                    : "hover:bg-muted/40"
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                ) : isCurrentLesson ? (
                                  <PlayCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-xs leading-snug ${
                                      isCurrentLesson
                                        ? "text-primary font-medium"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {formatDuration(lesson.duration)}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
