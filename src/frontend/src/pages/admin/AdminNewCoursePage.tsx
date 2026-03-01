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
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, ChevronLeft, Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateCourse } from "../../hooks/useQueries";
import { CATEGORIES } from "../../utils/helpers";

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  thumbnailUrl: string;
}

export function AdminNewCoursePage() {
  const navigate = useNavigate();
  const createCourseMutation = useCreateCourse();

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    category: "Web Development",
    price: "0",
    thumbnailUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Course title is required.");
      return;
    }

    try {
      const priceValue = BigInt(
        Math.max(0, Number.parseInt(formData.price) || 0),
      );
      const created = await createCourseMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: priceValue,
        thumbnailUrl: formData.thumbnailUrl,
      });
      toast.success("Course created! Now add curriculum content.");
      navigate({
        to: "/admin/courses/$courseId/edit",
        params: { courseId: created.id.toString() },
      });
    } catch {
      toast.error("Failed to create course. Please try again.");
    }
  };

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
          Back to Courses
        </button>
        <div className="h-5 w-px bg-border" />
        <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Create New Course
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 bg-card rounded-xl border border-border p-6 shadow-card"
      >
        <p className="text-muted-foreground text-sm">
          Fill in the course details below. After creating, you can add
          curriculum sections and lessons.
        </p>

        {/* Title */}
        <div className="space-y-2">
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
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="What will students learn in this course?"
            rows={4}
          />
        </div>

        {/* Category & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
        </div>

        {/* Thumbnail URL */}
        <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail URL</Label>
          <Input
            id="thumbnail"
            type="url"
            value={formData.thumbnailUrl}
            onChange={(e) =>
              setFormData((p) => ({ ...p, thumbnailUrl: e.target.value }))
            }
            placeholder="https://example.com/thumbnail.jpg"
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to use an auto-generated placeholder image.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/admin/courses" })}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createCourseMutation.isPending}>
            {createCourseMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Course →"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
