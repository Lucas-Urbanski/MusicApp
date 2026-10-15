"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const zodSignUp = z
  .object({
    fullName: z.string().min(1, "Please input your Full Name"),
    email: z.email("Please input a valid Email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ZodSignUpType = z.infer<typeof zodSignUp>;

export default function SignUpPage() {
  const supabase = createClient();
  const [authError, setAuthError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ZodSignUpType>({
    resolver: zodResolver(zodSignUp),
  });

  const onSubmit = async (zodData: ZodSignUpType) => {
    setAuthError(null);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: zodData.email,
        password: zodData.password,
        options: {
          data: {
            fullName: zodData.fullName,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        window.location.href = "/pages/home";
        return;
      }

      setMessage(
        "Account created. Check your email to confirm your account, then sign in.",
      );
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
            Create Account
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              {...register("fullName")}
              className="w-full rounded-xl border border-gray-800 bg-[#131314] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-[#70383a]"
            />
            {errors.fullName?.message && (
              <p className="mt-1 text-sm text-red-400">
                {errors.fullName.message}
              </p>
            )}
          </div>

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
              placeholder="Create a password"
              {...register("password")}
              className="w-full rounded-xl border border-gray-800 bg-[#131314] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-[#70383a]"
            />
            {errors.password?.message && (
              <p className="mt-1 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className="w-full rounded-xl border border-gray-800 bg-[#131314] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-[#70383a]"
            />
            {errors.confirmPassword?.message && (
              <p className="mt-1 text-sm text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {authError && (
            <p className="rounded-xl bg-red-950/50 border border-red-800/50 px-4 py-3 text-sm text-red-300">
              {authError}
            </p>
          )}

          {message && (
            <p className="rounded-xl bg-green-950/50 border border-green-800/50 px-4 py-3 text-sm text-green-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#70383a] px-4 py-3 font-semibold text-white transition hover:bg-[#8e4548] disabled:opacity-60 shadow-lg"
          >
            <UserPlus size={18} />
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </form>
        {/* Continue With Accounts Section */}
        <div className="w-full text-center">
          <p className="m-3 text-base font-normal text-gray-400">
            Continue With
          </p>

          {/* Social Buttons */}
          <div className="grid w-full">
            <button className="flex items-center justify-center rounded-xl bg-[#70383a] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#8e4548]">
              GOOGLE
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-semibold text-white hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
