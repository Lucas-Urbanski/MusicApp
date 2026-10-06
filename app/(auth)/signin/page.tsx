"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Session } from "@supabase/supabase-js";

const zodSignIn = z.object({
  email: z.email("Please input a valid Email"),
  password: z.string().min(1, "Please input your Password"),
});

type ZodSignInType = z.infer<typeof zodSignIn>;

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ZodSignInType>({
    resolver: zodResolver(zodSignIn),
  });

  const onSubmit = async (zodData: ZodSignInType) => {
    // Clear previous errors
    setAuthError(null);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: zodData.email,
        password: zodData.password,
      });

      if (error) throw error;

      setSession(data.session);
      console.log(data);
    } catch (error: unknown) {
      setAuthError(
        error instanceof Error ? error.message : "An error occurred",
      );
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Sign In</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "300px",
        }}
      >
        <div>
          <input type="email" placeholder="Email" {...register("email")} />
          {errors.email?.message && (
            <p style={{ color: "red" }}>{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password?.message && (
            <p style={{ color: "red" }}>{errors.password.message}</p>
          )}
        </div>

        {authError && (
          <p style={{ color: "red", fontWeight: "bold" }}>{authError}</p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div style={{ marginTop: "2rem" }}>
        {session ? (
          <pre>{JSON.stringify(session.user, null, 2)}</pre>
        ) : (
          <p>Not logged in</p>
        )}
      </div>
    </div>
  );
}
