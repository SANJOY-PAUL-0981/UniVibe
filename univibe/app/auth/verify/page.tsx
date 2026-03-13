import { MailIcon } from "lucide-react";
import Link from "next/link";

const VerifyEmailPage = () => {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-3xl border border-border/70 bg-card/85 p-8 shadow-2xl text-center space-y-4">
        <div className="flex justify-center">
          <MailIcon className="size-12 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to your email. Click the link to verify your account and continue.
        </p>
        <p className="text-xs text-muted-foreground">
          Already verified?{" "}
          <Link href="/auth/login" className="text-primary hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
};

export default VerifyEmailPage;