import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  BookMarked,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, clear, identity, isLoggingIn } = useInternetIdentity();
  const { userProfile, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = !!identity && !!userProfile;

  const handleLogout = () => {
    clear();
    navigate({ to: "/login" });
    setMobileOpen(false);
  };

  const handleLogin = () => {
    login();
    setMobileOpen(false);
  };

  const navLinks = isAdmin
    ? [
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/courses", label: "Courses", icon: BookOpen },
        { to: "/admin/students", label: "Students", icon: Users },
      ]
    : [
        { to: "/courses", label: "Browse", icon: BookOpen },
        { to: "/my-learning", label: "My Learning", icon: BookMarked },
      ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav className="lms-navbar shadow-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={isAdmin ? "/admin" : "/courses"}
            className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              LearnHub
            </span>
          </Link>

          {/* Desktop nav links */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(to)
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="text-white/70 text-sm">
                  {isAdmin && (
                    <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full mr-2 font-medium">
                      Admin
                    </span>
                  )}
                  {userProfile?.name || userProfile?.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 btn-cta text-sm"
              >
                {isLoggingIn ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {isLoggingIn ? "Connecting..." : "Sign In"}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {isLoggedIn &&
              navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(to)
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            <div className="pt-2 border-t border-white/10">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-white/70 hover:text-white px-3 py-2 text-sm w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Logout ({userProfile?.name || userProfile?.email})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="flex items-center gap-2 btn-cta text-sm w-full justify-center"
                >
                  <LogIn className="w-4 h-4" />
                  {isLoggingIn ? "Connecting..." : "Sign In"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
