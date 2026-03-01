import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { Course } from "../../backend.d";
import { useAdminCourses, useDeleteCourse } from "../../hooks/useQueries";
import {
  formatPrice,
  getCategoryColor,
  getThumbnailUrl,
} from "../../utils/helpers";

export function AdminCoursesPage() {
  const navigate = useNavigate();
  const { data: courses = [], isLoading } = useAdminCourses();
  const deleteMutation = useDeleteCourse();
  const [searchQuery, setSearchQuery] = useState("");
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const filteredCourses = courses.filter(
    (c) =>
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!courseToDelete) return;
    try {
      await deleteMutation.mutateAsync(courseToDelete.id);
      toast.success(`"${courseToDelete.title}" deleted successfully.`);
      setCourseToDelete(null);
    } catch {
      toast.error("Failed to delete course. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Courses
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage all your courses
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-16 h-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded" />
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-16 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              {searchQuery
                ? `No courses match "${searchQuery}"`
                : "No courses yet"}
            </p>
            {!searchQuery && (
              <Link
                to="/admin/courses/new"
                className="mt-4 inline-flex items-center gap-2 btn-cta text-sm py-2 px-4 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Create your first course
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[auto,1fr,auto,auto,auto,auto] gap-4 items-center px-6 py-3 bg-muted/30 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Thumbnail</span>
              <span>Course</span>
              <span>Category</span>
              <span>Price</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-border">
              {filteredCourses.map((course) => (
                <div
                  key={course.id.toString()}
                  className="flex flex-col md:grid md:grid-cols-[auto,1fr,auto,auto,auto,auto] gap-3 md:gap-4 items-start md:items-center px-6 py-4 hover:bg-muted/10 transition-colors"
                >
                  {/* Thumbnail */}
                  <img
                    src={getThumbnailUrl(course.thumbnailUrl, course.id)}
                    alt={course.title}
                    className="w-16 h-12 rounded object-cover hidden md:block"
                  />

                  {/* Title and description */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {course.description}
                    </p>
                  </div>

                  {/* Category */}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(course.category)}`}
                  >
                    {course.category || "General"}
                  </span>

                  {/* Price */}
                  <span
                    className={`text-sm font-semibold ${course.price === 0n ? "text-green-600" : "text-foreground"}`}
                  >
                    {formatPrice(course.price)}
                  </span>

                  {/* Status */}
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "/admin/courses/$courseId/edit",
                          params: { courseId: course.id.toString() },
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors text-xs font-medium text-foreground"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseToDelete(course)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-200 hover:bg-red-50 text-red-600 transition-colors text-xs font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!courseToDelete}
        onOpenChange={() => setCourseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>"{courseToDelete?.title}"</strong>? This action cannot be
              undone and will remove all sections and lessons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
