import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Course,
  Enrollment,
  Lesson,
  LessonProgress,
  Section,
  UserProfile,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ============ USER QUERIES ============
export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ============ COURSE QUERIES ============
export function useCourses() {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCourses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminCourses() {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["adminCourses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminCourses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCourseById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Course | null>({
    queryKey: ["course", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getCourseById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCourseCurriculum(courseId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Section, Array<Lesson>]>>({
    queryKey: ["curriculum", courseId?.toString()],
    queryFn: async () => {
      if (!actor || courseId === null) return [];
      return actor.getCourseCurriculum(courseId);
    },
    enabled: !!actor && !isFetching && courseId !== null,
  });
}

// ============ ENROLLMENT QUERIES ============
export function useMyEnrollments() {
  const { actor, isFetching } = useActor();
  return useQuery<Enrollment[]>({
    queryKey: ["myEnrollments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyEnrollments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsEnrolled(courseId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isEnrolled", courseId?.toString()],
    queryFn: async () => {
      if (!actor || courseId === null) return false;
      return actor.isEnrolled(courseId);
    },
    enabled: !!actor && !isFetching && courseId !== null,
  });
}

export function useAllEnrollments() {
  const { actor, isFetching } = useActor();
  return useQuery<Enrollment[]>({
    queryKey: ["allEnrollments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEnrollments();
    },
    enabled: !!actor && !isFetching,
  });
}

// ============ PROGRESS QUERIES ============
export function useCourseProgress(courseId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<{
    totalLessons: bigint;
    completedLessons: bigint;
    percentage: bigint;
  }>({
    queryKey: ["courseProgress", courseId?.toString()],
    queryFn: async () => {
      if (!actor || courseId === null)
        return { totalLessons: 0n, completedLessons: 0n, percentage: 0n };
      return actor.getCourseProgress(courseId);
    },
    enabled: !!actor && !isFetching && courseId !== null,
  });
}

export function useMyProgress() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<{ courseId: bigint; percentage: bigint }>>({
    queryKey: ["myProgress"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyProgress();
    },
    enabled: !!actor && !isFetching,
  });
}

// ============ ADMIN QUERIES ============
export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery<{
    totalEnrollments: bigint;
    totalStudents: bigint;
    totalCourses: bigint;
  }>({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor)
        return { totalEnrollments: 0n, totalStudents: 0n, totalCourses: 0n };
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["allStudents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

// ============ MUTATIONS ============
export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["callerRole"] });
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useCreateCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      category: string;
      price: bigint;
      thumbnailUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCourse(
        data.title,
        data.description,
        data.category,
        data.price,
        data.thumbnailUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      category: string;
      price: bigint;
      thumbnailUrl: string;
      isPublished: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCourse(
        data.id,
        data.title,
        data.description,
        data.category,
        data.price,
        data.thumbnailUrl,
        data.isPublished,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      queryClient.invalidateQueries({
        queryKey: ["course", variables.id.toString()],
      });
    },
  });
}

export function useDeleteCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCourse(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useAddSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      courseId: bigint;
      title: string;
      order: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addSection(data.courseId, data.title, data.order);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["curriculum", variables.courseId.toString()],
      });
    },
  });
}

export function useUpdateSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      order: bigint;
      courseId: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateSection(data.id, data.title, data.order);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["curriculum", variables.courseId.toString()],
      });
    },
  });
}

export function useDeleteSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; courseId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteSection(data.id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["curriculum", variables.courseId.toString()],
      });
    },
  });
}

export function useAddLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      sectionId: bigint;
      courseId: bigint;
      title: string;
      videoUrl: string;
      duration: bigint;
      order: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addLesson(
        data.sectionId,
        data.courseId,
        data.title,
        data.videoUrl,
        data.duration,
        data.order,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["curriculum", variables.courseId.toString()],
      });
    },
  });
}

export function useUpdateLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      videoUrl: string;
      duration: bigint;
      order: bigint;
      courseId: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateLesson(
        data.id,
        data.title,
        data.videoUrl,
        data.duration,
        data.order,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["curriculum", variables.courseId.toString()],
      });
    },
  });
}

export function useDeleteLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; courseId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteLesson(data.id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["curriculum", variables.courseId.toString()],
      });
    },
  });
}

export function useEnrollCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.enrollCourse(courseId);
    },
    onSuccess: (_data, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
      queryClient.invalidateQueries({
        queryKey: ["isEnrolled", courseId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["allEnrollments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useMarkLessonComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      lessonId: bigint;
      courseId: bigint;
    }): Promise<LessonProgress> => {
      if (!actor) throw new Error("Not connected");
      return actor.markLessonComplete(data.lessonId, data.courseId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["courseProgress", variables.courseId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["myProgress"] });
    },
  });
}
