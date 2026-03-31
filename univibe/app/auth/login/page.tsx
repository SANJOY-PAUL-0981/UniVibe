"use client";

import { MailIcon, LockIcon } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { signInEmailAction } from "@/actions/signInEmail.action";

const LoginPage = () => {
  const [pendingAction, setPendingAction] = useState<"email" | "google" | null>(
    null,
  );
  const router = useRouter();

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setPendingAction("email");

    const formData = new FormData(evt.currentTarget);
    const { error } = await signInEmailAction(formData);

    if (error) {
      toast.error(error);
      setPendingAction(null);
    } else {
      toast.success("Login successful. Good to have you back.");
      router.push("/auth/callback"); // this will be checked, if user-details is in DB then push /profile if not in DB then push /user-details
    }
  };

  const handleClick = async () => {
    try {
      setPendingAction("google");

      await signIn.social({
        provider: "google",
        callbackURL: "/auth/callback", // this will be checked, if user-details is in DB then push /profile if not in DB then push /user-details
        errorCallbackURL: "/auth/login/error",
      });
    } catch (err) {
      toast.error("Google sign in failed");
      setPendingAction(null);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md items-center justify-center">
        <Card className="w-full rounded-3xl border border-border/70 bg-card/85 py-0 shadow-8xl backdrop-blur-xl">
          <CardHeader className="space-y-2 px-6 pt-6 text-center sm:px-8 sm:pt-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              UniVibe
            </p>
            <CardTitle className="text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Sign in to continue your journey.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-6 sm:px-8">
            {/*login form*/}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <MailIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="h-11 pl-9"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
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
                  {pendingAction === "email" ? "Logging In" : "Log In"}
                </span>
              </Button>
            </form>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span>or continue with</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div>
              <Button
                disabled={pendingAction !== null}
                onClick={handleClick}
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
                    : "Sign in with Google"}
                </span>
              </Button>
            </div>
          </CardContent>

          <CardFooter className="justify-center px-6 pb-6 text-sm text-muted-foreground sm:px-8 sm:pb-8">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary underline-offset-4 transition hover:underline"
            >
              Sign Up
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
};

export default LoginPage;
