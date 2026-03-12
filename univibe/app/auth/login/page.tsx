"use client"

import { MailIcon, LockIcon } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { signInEmailAction } from "@/actions/signInEmail.action";

const LoginPage = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    setIsPending(true)

    const formData = new FormData(evt.currentTarget);
    const { error } = await signInEmailAction(formData);

    if (error) {
      toast.error(error);
      setIsPending(false);
    } else {
      toast.success("Login successful. Good to have you back.");
      router.push("/profile");
    }
  }

  const handleClick = async () => {
    try {
      setIsPending(true)

      await signIn.social({
        provider: "google",
        callbackURL: "/profile",
        errorCallbackURL: "/auth/login/error"
      })
    } catch (err) {
      toast.error("Google sign in failed")
      setIsPending(false)
    }
  }

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
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue your journey.
            </p>
          </div>

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
              disabled={isPending}
              className="h-11 w-full rounded-xl">
              {isPending ? "Logging In" : "Log In"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div>
            <Button
              disabled={isPending}
              onClick={handleClick}
              variant="outline"
              size="lg"
              className="h-11 w-full rounded-xl">
              <FcGoogle className="mr-2 size-4" />
              {isPending ? "Redirecting..." : "Sign in with Google"}
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary underline-offset-4 transition hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
