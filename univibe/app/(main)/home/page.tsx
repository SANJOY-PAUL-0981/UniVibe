"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MatchFilterPanel } from "@/components/layouts/MatchFilterPanel";

const Home = () => {
  const router = useRouter();
  const [enableFilters, setEnableFilters] = useState(false);
  const [filtersValid, setFiltersValid] = useState(true);

  const handleStartCall = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    if (enableFilters && !filtersValid) {
      return;
    }

    const callId = crypto.randomUUID();

    router.push(`/call/${callId}`);
  };

  return (
    <form
      onSubmit={handleStartCall}
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-card px-3 py-2">
        <Label htmlFor="single-call-filters" className="cursor-pointer text-sm">
          Use filters
        </Label>
        <Switch
          id="single-call-filters"
          checked={enableFilters}
          onCheckedChange={(checked) => setEnableFilters(Boolean(checked))}
        />
      </div>
      {enableFilters && (
        <MatchFilterPanel onValidityChange={setFiltersValid} />
      )}
      <Button type="submit" disabled={enableFilters && !filtersValid}>
        Start Single Call
      </Button>
    </form>
  );
};

export default Home;
