"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MatchFilterPanel, type Filters } from "@/components/layouts/MatchFilterPanel";
import { useCallStore } from "@/store/useCallStore";
import { useMedia } from "@/hooks/useMedia";
import { toast } from "sonner";

const Home = () => {
  const router = useRouter();
  const [enableFilters, setEnableFilters] = useState(false);
  const [filtersValid, setFiltersValid] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<Filters | null>(null)
  const { setFilters } = useCallStore();
  const { getMedia } = useMedia()

  const computeCurrentDomain = (filters: Filters | null): number => {
    if (!filters) {
      return 3;
    }

    if (filters.filterByCollege.enabled && filters.filterByCollege.value.trim() !== "") {
      return 0;
    }

    if (filters.filterByYear.enabled && filters.filterByYear.value.trim() !== "") {
      return 1;
    }

    if (filters.filterByFieldOfStudy.enabled && filters.filterByFieldOfStudy.value.trim() !== "") {
      return 2;
    }

    return 3;
  }

  const handleStartCall = async (evt: React.FormEvent<HTMLFormElement>) => {
    try {
      evt.preventDefault();
      await getMedia()

      if (enableFilters && !filtersValid) {
        return;
      }

      const domain = computeCurrentDomain(currentFilters)
      const filters = currentFilters

      setFilters({
        filterByGender: filters?.filterByGender.enabled ?? false,
        filterGenderData: filters?.filterByGender.value ?? "",
        filterByCollege: filters?.filterByCollege.enabled ?? false,
        filterCollegeData: filters?.filterByCollege.value ?? "",
        filterByFieldOfStudy: filters?.filterByFieldOfStudy.enabled ?? false,
        filterFieldOfStudyData: filters?.filterByFieldOfStudy.value ?? "",
        filterByYear: filters?.filterByYear.enabled ?? false,
        filterYearData: filters?.filterByYear.value ?? "",
      }, domain);

      const params = new URLSearchParams();
      params.set("currentDomain", String(domain));
      params.set("filterByGender", String(filters?.filterByGender.enabled ?? false));
      params.set("filterGenderData", filters?.filterByGender.value ?? "");
      params.set("filterByCollege", String(filters?.filterByCollege.enabled ?? false));
      params.set("filterCollegeData", filters?.filterByCollege.value ?? "");
      params.set("filterByFieldOfStudy", String(filters?.filterByFieldOfStudy.enabled ?? false));
      params.set("filterFieldOfStudyData", filters?.filterByFieldOfStudy.value ?? "");
      params.set("filterByYear", String(filters?.filterByYear.enabled ?? false));
      params.set("filterYearData", filters?.filterByYear.value ?? "");

      sessionStorage.setItem("fromHome", "true")

      router.push(`/call/connecting?${params.toString()}`);
    } catch (err) {
      toast.error("Please Allow Media Access!")
    }
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
        <MatchFilterPanel
          onValidityChange={setFiltersValid}
          onFiltersChange={setCurrentFilters}
        />
      )}
      <Button type="submit" disabled={enableFilters && !filtersValid}>
        Start Call
      </Button>
    </form>
  );
};

export default Home;