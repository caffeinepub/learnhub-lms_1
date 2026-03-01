import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { Clock, Star, Users } from "lucide-react";
import React from "react";
import type { Course } from "../backend.d";
import {
  formatPrice,
  getCategoryColor,
  getThumbnailUrl,
} from "../utils/helpers";

interface CourseCardProps {
  course: Course;
  progressPercentage?: number;
  showProgress?: boolean;
  enrolled?: boolean;
}

export function CourseCard({
  course,
  progressPercentage,
  showProgress = false,
  enrolled = false,
}: CourseCardProps) {
  const thumbnail = getThumbnailUrl(course.thumbnailUrl, course.id);
  const navigate = useNavigate();

  const handleNav = () =>
    navigate({
      to: "/courses/$courseId",
      params: { courseId: course.id.toString() },
    });

  return (
    <button
      type="button"
      onClick={handleNav}
      className="block cursor-pointer w-full text-left"
    >
      <div className="course-card group h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {!course.isPublished && (
            <div className="absolute top-2 right-2">
              <span className="bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                Draft
              </span>
            </div>
          )}
          {enrolled && (
            <div className="absolute top-2 left-2">
              <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                Enrolled
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category badge */}
          <div className="mb-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getCategoryColor(course.category)}`}
            >
              {course.category || "General"}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-foreground text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors flex-1">
            {course.title}
          </h3>

          {/* Description snippet */}
          <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
            {course.description}
          </p>

          {/* Progress bar (for enrolled courses) */}
          {showProgress && typeof progressPercentage === "number" && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{progressPercentage}% complete</span>
                {progressPercentage === 100 && (
                  <span className="text-green-600 font-medium">
                    ✓ Completed
                  </span>
                )}
              </div>
              <div className="lms-progress-bar">
                <div
                  className="lms-progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
            <span
              className={`font-bold text-base ${course.price === 0n ? "text-green-600" : "text-foreground"}`}
            >
              {formatPrice(course.price)}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs text-muted-foreground">4.5</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="course-card">
      <div className="aspect-video skeleton" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-20 rounded-full" />
        <div className="space-y-1">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-3/4 rounded" />
        </div>
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
        <div className="flex justify-between pt-2">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-4 w-10 rounded" />
        </div>
      </div>
    </div>
  );
}
