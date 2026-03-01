import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  LogIn,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const { userProfile, isAdmin, isLoadingProfile } = useAuth();

  useEffect(() => {
    if (!identity || isLoadingProfile) return;
    if (userProfile) {
      if (isAdmin) {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/courses" });
      }
    } else if (identity) {
      // Logged in but no profile - go to register
      navigate({ to: "/register" });
    }
  }, [identity, userProfile, isAdmin, isLoadingProfile, navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel - branding */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: "oklch(0.22 0.08 264)" }}
      >
        {/* Background decoration */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
          style={{
            background: "oklch(0.72 0.19 45)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{
            background: "oklch(0.60 0.18 264)",
            transform: "translate(-30%, 30%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl">LearnHub</span>
          </div>

          <h1 className="font-display font-bold text-4xl leading-tight mb-6">
            Unlock Your
            <br />
            <span style={{ color: "oklch(0.72 0.19 45)" }}>
              Learning Potential
            </span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Join thousands of students learning new skills every day with
            expert-led courses.
          </p>

          <div className="space-y-4">
            {[
              { icon: BookOpen, text: "500+ expert-led courses" },
              { icon: Users, text: "50,000+ active learners" },
              { icon: TrendingUp, text: "Track your progress" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white/80" />
                </div>
                <span className="text-white/80">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/40 text-sm">
          © {new Date().getFullYear()} LearnHub. Built with love using
          caffeine.ai
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              LearnHub
            </span>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in with your Internet Identity to continue learning.
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={login}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
              style={{ background: "oklch(0.42 0.18 264)" }}
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign in with Internet Identity
                </>
              )}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-primary font-medium cursor-pointer hover:underline"
                onClick={login}
              >
                Create one
              </button>
            </p>
          </div>

          <div className="mt-8 p-4 rounded-lg border border-border bg-muted/40">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              LearnHub uses{" "}
              <span className="font-medium text-foreground">
                Internet Identity
              </span>{" "}
              for secure, passwordless authentication. Your data is protected on
              the blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
