import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SingleCallPage({
  params,
}: {
  params: Promise<{ callId: string }>;
}) {
  const { callId } = await params;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <h1 className="text-2xl font-bold text-foreground">
        Single Call: {callId}
      </h1>
      <Button variant="destructive">
        <Link href="/home">End Call</Link>
      </Button>
    </div>
  );
}
