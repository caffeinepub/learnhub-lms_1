import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { GraduationCap, Mail, Shield, User } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Role = "user" | "admin";

export function RegisterPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { refetchProfile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!identity) {
      navigate({ to: "/login" });
    }
  }, [identity, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Not connected. Please try again.");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    setIsSubmitting(true);
    try {
      await actor.saveCallerUserProfile({
        name: name.trim(),
        email: email.trim(),
        role,
      });
      refetchProfile();
      toast.success("Profile created successfully!");
      if (role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/courses" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="bg-card rounded-2xl shadow-card-hover border border-border overflow-hidden">
          {/* Header */}
          <div
            className="p-8 text-white text-center"
            style={{ background: "oklch(0.22 0.08 264)" }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="font-display font-bold text-2xl mb-1">
              Create Your Account
            </h1>
            <p className="text-white/70 text-sm">
              Set up your LearnHub profile to get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-11"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Shield className="w-4 h-4 text-muted-foreground" />
                Account Type
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {(["user", "admin"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      role === r
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="font-semibold text-sm capitalize">
                      {r === "user" ? "Student" : "Admin"}
                    </div>
                    <div className="text-xs mt-0.5 opacity-70">
                      {r === "user"
                        ? "Browse & learn courses"
                        : "Manage courses & students"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 font-semibold text-base mt-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                "Get Started →"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
