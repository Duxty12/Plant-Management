"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";


const formSchema = z.object({
  email: z
    .email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleLogin(values: LoginFormValues) {
  const formData = new URLSearchParams();

  formData.append("username", values.email);
  formData.append("password", values.password);

  setError("");
  setLoading(true);

  try {
    const resp = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include",
      body: formData,
    });

    const data = await resp.json();

    if (!resp.ok) {
      setError(data.detail || "Invalid username or password.");
      return;
    }

    // Store user globally
    setUser(data.user);

    console.log("Logged in user:", data.user);

    router.push("/dashboard");
  } catch {
    setError("Unable to connect to the server. Please try again.");
  } finally {
    setLoading(false);
  }
}


  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d2618] via-[#1B3B2C] to-[#0a4020]" />

      {/* Decorative blobs */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-green-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl" />
      <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-green-400/10 rounded-full blur-2xl" />

      {/* Card */}
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-green-600 via-emerald-500 to-green-400" />

          <div className="px-8 pt-8 pb-10">
            {/* Logo badge */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#1B3B2C] flex items-center justify-center mb-4 shadow-lg">
                <Leaf className="w-8 h-8 text-green-400" />
              </div>

              <h1 className="text-2xl font-bold text-[#1B3B2C] tracking-tight">
                Exotic Botanicals
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Management System Login
              </p>
            </div>

            <form
              onSubmit={form.handleSubmit(handleLogin)}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    id="email"
                    type="email"
                    placeholder="user@exoticbotanicals.edu"
                    autoComplete="email"
                    {...form.register("email")}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 bg-gray-50 transition ${
                      form.formState.errors.email
                        ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                        : "border-gray-200"
                    }`}
                  />
                </div>

                {form.formState.errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs text-green-700 hover:text-green-800 font-medium transition"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    {...form.register("password")}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 bg-gray-50 transition ${
                      form.formState.errors.password
                        ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                        : "border-gray-200"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {form.formState.errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Server Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    SIGN IN TO DASHBOARD
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Option */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
