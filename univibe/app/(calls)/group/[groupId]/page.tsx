import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function GroupCallPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <h1 className="text-2xl font-bold text-foreground">
        Group Call: {groupId}
      </h1>
      <Button variant="destructive">
        <Link href="/room">Leave Group</Link>
      </Button>
    </div>
  );
}
