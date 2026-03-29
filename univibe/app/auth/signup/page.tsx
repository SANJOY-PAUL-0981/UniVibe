"use client";

import { MailIcon, LockIcon, UserIcon } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signUpEmailAction } from "@/actions/signUpEmail.action";

const SignupPage = () => {
  const [pendingAction, setPendingAction] = useState<"email" | "google" | null>(
    null,
  );
  const router = useRouter();

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setPendingAction("email");

    const formData = new FormData(evt.currentTarget);
    const { error } = await signUpEmailAction(formData); // change

    if (error) {
      toast.error(error);
      setPendingAction(null);
    } else {
      toast.success("Verification email sent! Please check your inbox.");
      router.push("/auth/verify");
    }
  };

  const handleClick = async () => {
    try {
      setPendingAction("google");

      await signIn.social({
        provider: "google",
        callbackURL: "/auth/callback",
        errorCallbackURL: "/auth/login/error"
      })
    } catch (err) {
      toast.error("Google sign in failed");
      setPendingAction(null);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-3xl border border-border/70 bg-card/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-8 space-y-2 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              UniVibe
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Join us today and start your journey
            </p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={pendingAction !== null}
              className="h-11 w-full rounded-xl"
            >
              <span
                className={`${pendingAction === "email" ? "animate-pulse" : ""}`}
              >
                {pendingAction === "email" ? "Signing Up" : "Sign Up"}
              </span>
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div>
            <Button
              onClick={handleClick}
              disabled={pendingAction !== null}
              variant="outline"
              size="lg"
              className="h-11 w-full rounded-xl"
            >
              <FcGoogle className="mr-2 size-4" />
              <span
                className={`${pendingAction === "google" ? "animate-pulse" : ""}`}
              >
                {pendingAction === "google"
                  ? "Redirecting..."
                  : "Sign up with Google"}
              </span>
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary underline-offset-4 transition hover:underline"
            >
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SignupPage;
