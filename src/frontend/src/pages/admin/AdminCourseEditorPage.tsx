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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Film,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Lesson, Section } from "../../backend.d";
import {
  useAddLesson,
  useAddSection,
  useCourseById,
  useCourseCurriculum,
  useCreateCourse,
  useDeleteLesson,
  useDeleteSection,
  useUpdateCourse,
  useUpdateLesson,
  useUpdateSection,
} from "../../hooks/useQueries";
import { CATEGORIES } from "../../utils/helpers";

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  thumbnailUrl: string;
  isPublished: boolean;
}

export function AdminCourseEditorPage() {
  const { courseId } = useParams({
    from: "/admin-layout/admin/courses/$courseId/edit",
  });
  const navigate = useNavigate();
  const isNew = courseId === "new";
  const courseIdBigInt = isNew ? null : BigInt(courseId);

  const { data: course, isLoading: courseLoading } =
    useCourseById(courseIdBigInt);
  const { data: curriculum = [], isLoading: curriculumLoading } =
    useCourseCurriculum(courseIdBigInt);

  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const addSectionMutation = useAddSection();
  const updateSectionMutation = useUpdateSection();
  const deleteSectionMutation = useDeleteSection();
  const addLessonMutation = useAddLesson();
  const _updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    category: "Web Development",
    price: "0",
    thumbnailUrl: "",
    isPublished: false,
  });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [deletingSection, setDeletingSection] = useState<Section | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<{
    lesson: Lesson;
    courseId: bigint;
  } | null>(null);
  const [addingLessonToSection, setAddingLessonToSection] = useState<
    string | null
  >(null);
  const [newLesson, setNewLesson] = useState({
    title: "",
    videoUrl: "",
    duration: "0",
  });
  const [editingSection, setEditingSection] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [savedCourseId, setSavedCourseId] = useState<bigint | null>(
    courseIdBigInt,
  );

  // Populate form from existing course
  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        category: course.category,
        price: Number(course.price).toString(),
        thumbnailUrl: course.thumbnailUrl,
        isPublished: course.isPublished,
      });
    }
  }, [course]);

  const handleSaveCourseInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Course title is required.");
      return;
    }
    try {
      const priceValue = BigInt(
        Math.max(0, Number.parseInt(formData.price) || 0),
      );
      if (isNew) {
        const created = await createCourseMutation.mutateAsync({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: priceValue,
          thumbnailUrl: formData.thumbnailUrl,
        });
        setSavedCourseId(created.id);
        toast.success("Course created! You can now add curriculum.");
        navigate({ to: `/admin/courses/${created.id.toString()}/edit` });
      } else if (savedCourseId) {
        await updateCourseMutation.mutateAsync({
          id: savedCourseId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: priceValue,
          thumbnailUrl: formData.thumbnailUrl,
          isPublished: formData.isPublished,
        });
        toast.success("Course updated successfully!");
      }
    } catch (_err) {
      toast.error("Failed to save course. Please try again.");
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim() || !savedCourseId) {
      if (!savedCourseId) toast.error("Save course info first.");
      return;
    }
    try {
      await addSectionMutation.mutateAsync({
        courseId: savedCourseId,
        title: newSectionTitle.trim(),
        order: BigInt(curriculum.length + 1),
      });
      setNewSectionTitle("");
      toast.success("Section added!");
    } catch {
      toast.error("Failed to add section.");
    }
  };

  const handleUpdateSection = async (section: Section) => {
    if (!editingSection || !savedCourseId) return;
    try {
      await updateSectionMutation.mutateAsync({
        id: section.id,
        title: editingSection.title,
        order: section.order,
        courseId: savedCourseId,
      });
      setEditingSection(null);
      toast.success("Section updated!");
    } catch {
      toast.error("Failed to update section.");
    }
  };

  const handleDeleteSection = async () => {
    if (!deletingSection || !savedCourseId) return;
    try {
      await deleteSectionMutation.mutateAsync({
        id: deletingSection.id,
        courseId: savedCourseId,
      });
      setDeletingSection(null);
      toast.success("Section deleted.");
    } catch {
      toast.error("Failed to delete section.");
    }
  };

  const handleAddLesson = async (sectionId: bigint, lessonsCount: number) => {
    if (!newLesson.title.trim() || !savedCourseId) return;
    try {
      await addLessonMutation.mutateAsync({
        sectionId,
        courseId: savedCourseId,
        title: newLesson.title.trim(),
        videoUrl: newLesson.videoUrl,
        duration: BigInt(Number.parseInt(newLesson.duration) || 0),
        order: BigInt(lessonsCount + 1),
      });
      setNewLesson({ title: "", videoUrl: "", duration: "0" });
      setAddingLessonToSection(null);
      toast.success("Lesson added!");
    } catch {
      toast.error("Failed to add lesson.");
    }
  };

  const handleDeleteLesson = async () => {
    if (!deletingLesson || !savedCourseId) return;
    try {
      await deleteLessonMutation.mutateAsync({
        id: deletingLesson.lesson.id,
        courseId: savedCourseId,
      });
      setDeletingLesson(null);
      toast.success("Lesson deleted.");
    } catch {
      toast.error("Failed to delete lesson.");
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isLoading = courseLoading && !isNew;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/courses" })}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="h-5 w-px bg-border" />
        <h1 className="font-display font-bold text-2xl text-foreground">
          {isNew ? "Create Course" : "Edit Course"}
        </h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-12 w-2/3 rounded-lg" />
        </div>
      ) : (
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Course Info
            </TabsTrigger>
            <TabsTrigger
              value="curriculum"
              disabled={isNew && !savedCourseId}
              className="flex items-center gap-2"
            >
              <Film className="w-4 h-4" />
              Curriculum
            </TabsTrigger>
          </TabsList>

          {/* Course Info Tab */}
          <TabsContent value="info">
            <form
              onSubmit={handleSaveCourseInfo}
              className="space-y-6 bg-card rounded-xl border border-border p-6 shadow-card"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g. Complete React Developer in 2024"
                    required
                    className="h-11"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    placeholder="What will students learn in this course?"
                    rows={4}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, category: val }))
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, price: e.target.value }))
                      }
                      placeholder="0 for free"
                      className="pl-7 h-11"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Set to 0 for a free course
                  </p>
                </div>

                {/* Thumbnail URL */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        thumbnailUrl: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/thumbnail.jpg"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use an auto-generated placeholder image.
                  </p>
                </div>

                {/* Published toggle (only for existing courses) */}
                {!isNew && (
                  <div className="md:col-span-2 flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                    <div>
                      <Label className="font-medium">Publish Course</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Published courses are visible to all students
                      </p>
                    </div>
                    <Switch
                      checked={formData.isPublished}
                      onCheckedChange={(val) =>
                        setFormData((p) => ({ ...p, isPublished: val }))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/admin/courses" })}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createCourseMutation.isPending ||
                    updateCourseMutation.isPending
                  }
                >
                  {(createCourseMutation.isPending ||
                    updateCourseMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isNew ? "Create Course" : "Save Changes"}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum">
            <div className="space-y-4">
              {curriculumLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Existing sections */}
                  {curriculum.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-border rounded-xl bg-muted/10">
                      <Film className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-muted-foreground font-medium">
                        No sections yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add your first section below to get started.
                      </p>
                    </div>
                  )}

                  {curriculum
                    .sort((a, b) => Number(a[0].order) - Number(b[0].order))
                    .map(([section, lessons]) => {
                      const isExpanded = expandedSections.has(
                        section.id.toString(),
                      );
                      const isEditingThis =
                        editingSection?.id === section.id.toString();

                      return (
                        <div
                          key={section.id.toString()}
                          className="curriculum-section"
                        >
                          {/* Section header */}
                          <div className="curriculum-section-header">
                            <div className="flex items-center gap-2 flex-1">
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                              {isEditingThis ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <Input
                                    value={editingSection.title}
                                    onChange={(e) =>
                                      setEditingSection((p) =>
                                        p ? { ...p, title: e.target.value } : p,
                                      )
                                    }
                                    className="h-8 text-sm flex-1"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <Button
                                    size="sm"
                                    className="h-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateSection(section);
                                    }}
                                    disabled={updateSectionMutation.isPending}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSection(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="flex items-center justify-between flex-1 text-left"
                                  onClick={() =>
                                    toggleSection(section.id.toString())
                                  }
                                >
                                  <div>
                                    <span className="font-semibold text-sm text-foreground">
                                      {section.title}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      ({lessons.length}{" "}
                                      {lessons.length === 1
                                        ? "lesson"
                                        : "lessons"}
                                      )
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSection({
                                          id: section.id.toString(),
                                          title: section.title,
                                        });
                                      }}
                                      className="text-xs text-primary hover:underline px-2"
                                    >
                                      Rename
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletingSection(section);
                                      }}
                                      className="text-xs text-red-500 hover:underline px-2"
                                    >
                                      Delete
                                    </button>
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </div>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Section content (expanded) */}
                          {isExpanded && (
                            <div className="px-4 pb-4">
                              {/* Lessons list */}
                              {lessons.length > 0 && (
                                <div className="divide-y divide-border border border-border rounded-lg overflow-hidden mb-3 mt-3">
                                  {lessons
                                    .sort(
                                      (a, b) =>
                                        Number(a.order) - Number(b.order),
                                    )
                                    .map((lesson) => (
                                      <div
                                        key={lesson.id.toString()}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20"
                                      >
                                        <Film className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-foreground truncate">
                                            {lesson.title}
                                          </p>
                                          {lesson.videoUrl && (
                                            <p className="text-xs text-muted-foreground truncate">
                                              {lesson.videoUrl}
                                            </p>
                                          )}
                                        </div>
                                        <span className="text-xs text-muted-foreground flex-shrink-0">
                                          {Number(lesson.duration)}s
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setDeletingLesson({
                                              lesson,
                                              courseId: savedCourseId!,
                                            })
                                          }
                                          className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                </div>
                              )}

                              {/* Add lesson form */}
                              {addingLessonToSection ===
                              section.id.toString() ? (
                                <div className="border border-border rounded-lg p-4 bg-muted/10 space-y-3">
                                  <p className="text-sm font-semibold text-foreground">
                                    Add New Lesson
                                  </p>
                                  <Input
                                    placeholder="Lesson title"
                                    value={newLesson.title}
                                    onChange={(e) =>
                                      setNewLesson((p) => ({
                                        ...p,
                                        title: e.target.value,
                                      }))
                                    }
                                    className="h-9"
                                  />
                                  <Input
                                    placeholder="Video URL (YouTube link)"
                                    value={newLesson.videoUrl}
                                    onChange={(e) =>
                                      setNewLesson((p) => ({
                                        ...p,
                                        videoUrl: e.target.value,
                                      }))
                                    }
                                    className="h-9"
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Duration (seconds)"
                                    value={newLesson.duration}
                                    onChange={(e) =>
                                      setNewLesson((p) => ({
                                        ...p,
                                        duration: e.target.value,
                                      }))
                                    }
                                    className="h-9"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleAddLesson(
                                          section.id,
                                          lessons.length,
                                        )
                                      }
                                      disabled={
                                        addLessonMutation.isPending ||
                                        !newLesson.title.trim()
                                      }
                                    >
                                      {addLessonMutation.isPending && (
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                      )}
                                      Add Lesson
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setAddingLessonToSection(null);
                                        setNewLesson({
                                          title: "",
                                          videoUrl: "",
                                          duration: "0",
                                        });
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAddingLessonToSection(
                                      section.id.toString(),
                                    )
                                  }
                                  className="flex items-center gap-2 text-sm text-primary hover:underline mt-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Lesson
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* Add section */}
                  <div className="border-2 border-dashed border-border rounded-xl p-4">
                    <p className="text-sm font-semibold text-foreground mb-3">
                      <Plus className="w-4 h-4 inline mr-1" />
                      Add New Section
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Section title (e.g. Getting Started)"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        className="h-9"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddSection()
                        }
                      />
                      <Button
                        onClick={handleAddSection}
                        disabled={
                          addSectionMutation.isPending ||
                          !newSectionTitle.trim()
                        }
                        size="sm"
                        className="h-9 px-4"
                      >
                        {addSectionMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Add Section"
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Delete section dialog */}
      <AlertDialog
        open={!!deletingSection}
        onOpenChange={() => setDeletingSection(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>"{deletingSection?.title}"</strong>? All lessons in this
              section will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
              className="bg-destructive text-destructive-foreground"
            >
              Delete Section
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete lesson dialog */}
      <AlertDialog
        open={!!deletingLesson}
        onOpenChange={() => setDeletingLesson(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>"{deletingLesson?.lesson.title}"</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              className="bg-destructive text-destructive-foreground"
            >
              Delete Lesson
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
