"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const zodSignIn = z.object({
  email: z.email("Please input a valid Email"),
  password: z.string().min(1, "Please input your Password"),
});

type ZodSignInType = z.infer<typeof zodSignIn>;

export default function SignInPage() {
  const supabase = createClient();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ZodSignInType>({
    resolver: zodResolver(zodSignIn),
  });

  const onSubmit = async (zodData: ZodSignInType) => {
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: zodData.email,
        password: zodData.password,
      });

      if (error) throw error;

      if (data.session) {
        window.location.href = "/pages/home";
        return;
      }
    } catch (error: unknown) {
      setAuthError(
        error instanceof Error ? error.message : "An error occurred",
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#131314] px-6 py-12 text-white font-sans relative">
      <div className="w-full max-w-md rounded-3xl border border-gray-800 bg-[#1e1f20] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#70383a] text-white shadow-lg">
            <span className="text-xl font-bold" style={{ fontFamily: "serif" }}>
              m
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome Back
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className="w-full rounded-xl border border-gray-800 bg-[#131314] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-[#70383a]"
            />
            {errors.email?.message && (
              <p className="mt-1 text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              className="w-full rounded-xl border border-gray-800 bg-[#131314] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-[#70383a]"
            />
            {errors.password?.message && (
              <p className="mt-1 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {authError && (
            <p className="rounded-xl bg-red-950/50 border border-red-800/50 px-4 py-3 text-sm text-red-300">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#70383a] px-4 py-3 font-semibold text-white transition hover:bg-[#8e4548] disabled:opacity-60 shadow-lg"
          >
            <LogIn size={18} />
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-white hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
