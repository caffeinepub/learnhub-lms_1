import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Mail, Search, Users } from "lucide-react";
import React, { useState } from "react";
import { useAllEnrollments, useAllStudents } from "../../hooks/useQueries";

export function AdminStudentsPage() {
  const { data: students = [], isLoading: studentsLoading } = useAllStudents();
  const { data: enrollments = [], isLoading: enrollmentsLoading } =
    useAllEnrollments();
  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = studentsLoading || enrollmentsLoading;

  // Count enrollments per student
  const _enrollmentCountMap = React.useMemo(() => {
    return enrollments.reduce<Record<string, number>>((acc, e) => {
      const sid = e.studentId.toString();
      acc[sid] = (acc[sid] || 0) + 1;
      return acc;
    }, {});
  }, [enrollments]);

  const filteredStudents = students.filter(
    (s) =>
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">
          Students
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage and view all registered students
        </p>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              icon: Users,
              value: students.length,
              label: "Total Students",
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              icon: GraduationCap,
              value: enrollments.length,
              label: "Total Enrollments",
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              icon: Mail,
              value:
                students.length > 0
                  ? Math.round((enrollments.length / students.length) * 10) / 10
                  : 0,
              label: "Avg. Courses/Student",
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
          ].map(({ icon: Icon, value, label, color, bg }) => (
            <div
              key={label}
              className="bg-card rounded-xl border border-border p-4 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <div className={`text-xl font-display font-bold ${color}`}>
                    {value}
                  </div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              {searchQuery
                ? `No students match "${searchQuery}"`
                : "No students registered yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[auto,1fr,1fr,auto,auto] gap-4 items-center px-6 py-3 bg-muted/30 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Avatar</span>
              <span>Name</span>
              <span>Email</span>
              <span>Enrollments</span>
              <span>Role</span>
            </div>
            <div className="divide-y divide-border">
              {filteredStudents.map((student, idx) => {
                const initials = student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div
                    key={`${student.email}-${idx}`}
                    className="flex flex-col md:grid md:grid-cols-[auto,1fr,1fr,auto,auto] gap-2 md:gap-4 items-start md:items-center px-6 py-4 hover:bg-muted/10 transition-colors"
                  >
                    {/* Avatar */}
                    <Avatar className="w-10 h-10">
                      <AvatarFallback
                        className="text-sm font-semibold"
                        style={{
                          background: "oklch(0.42 0.18 264 / 0.15)",
                          color: "oklch(0.42 0.18 264)",
                        }}
                      >
                        {initials || "?"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name */}
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {student.name}
                      </p>
                    </div>

                    {/* Email */}
                    <p className="text-sm text-muted-foreground">
                      {student.email}
                    </p>

                    {/* Enrollment count */}
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">0</span>
                    </div>

                    {/* Role */}
                    <Badge
                      variant={
                        student.role === "admin" ? "default" : "secondary"
                      }
                    >
                      {student.role === "admin" ? "Admin" : "Student"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
