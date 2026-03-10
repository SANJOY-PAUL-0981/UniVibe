import { MailIcon, LockIcon, UserIcon } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa6";
import { BsTwitterX } from "react-icons/bs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SignupPage = () => {
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

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
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
                  type="password"
                  placeholder="Re-enter your password"
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="h-11 w-full rounded-xl">
              Sign Up with Mail
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" size="lg" className="h-11 rounded-xl">
              <FcGoogle className="mr-2 size-4" />
              Sign up with Google
            </Button>
            <Button variant="outline" size="lg" className="h-11 rounded-xl">
              <FaLinkedin className="mr-2 size-4" />
              Sign up with Linkedin
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 rounded-xl sm:col-span-2"
            >
              <BsTwitterX className="mr-2 size-4" />
              Sign up with X
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
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
