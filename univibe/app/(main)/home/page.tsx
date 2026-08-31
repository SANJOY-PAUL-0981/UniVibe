"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  MatchFilterPanel,
  type Filters,
} from "@/components/layouts/MatchFilterPanel";
import { useCallStore } from "@/store/useCallStore";
import { useMedia } from "@/hooks/useMedia";
import { toast } from "sonner";

const Home = () => {
  const router = useRouter();
  const [enableFilters, setEnableFilters] = useState(false);
  const [filtersValid, setFiltersValid] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<Filters | null>(null);
  const { setFilters } = useCallStore();
  const { getMedia } = useMedia();

  const computeCurrentDomain = (filters: Filters | null): number => {
    if (!filters) {
      return 3;
    }

    if (
      filters.filterByCollege.enabled &&
      filters.filterByCollege.value.trim() !== ""
    ) {
      return 0;
    }

    if (
      filters.filterByYear.enabled &&
      filters.filterByYear.value.trim() !== ""
    ) {
      return 1;
    }

    if (
      filters.filterByFieldOfStudy.enabled &&
      filters.filterByFieldOfStudy.value.trim() !== ""
    ) {
      return 2;
    }

    return 3;
  };

  const handleStartCall = async (evt: React.FormEvent<HTMLFormElement>) => {
    try {
      evt.preventDefault();

      const response = await fetch("/api/report/ban_status", {
        method: "POST",
      });
      const data = await response.json().catch(() => null);

      if (data?.code === 401) {
        toast.error("Unauthorized. Please sign in.");
        router.push("/auth/login");
        return;
      }

      if (data?.isBanned) {
        router.push("/banned");
        return;
      }
      await getMedia();

      if (enableFilters && !filtersValid) {
        return;
      }

      const domain = computeCurrentDomain(currentFilters);
      const filters = currentFilters;

      setFilters(
        {
          filterByGender: filters?.filterByGender.enabled ?? false,
          filterGenderData: filters?.filterByGender.value ?? "",
          filterByCollege: filters?.filterByCollege.enabled ?? false,
          filterCollegeData: filters?.filterByCollege.value ?? "",
          filterByFieldOfStudy: filters?.filterByFieldOfStudy.enabled ?? false,
          filterFieldOfStudyData: filters?.filterByFieldOfStudy.value ?? "",
          filterByYear: filters?.filterByYear.enabled ?? false,
          filterYearData: filters?.filterByYear.value ?? "",
        },
        domain,
      );

      const params = new URLSearchParams();
      params.set("currentDomain", String(domain));
      params.set(
        "filterByGender",
        String(filters?.filterByGender.enabled ?? false),
      );
      params.set("filterGenderData", filters?.filterByGender.value ?? "");
      params.set(
        "filterByCollege",
        String(filters?.filterByCollege.enabled ?? false),
      );
      params.set("filterCollegeData", filters?.filterByCollege.value ?? "");
      params.set(
        "filterByFieldOfStudy",
        String(filters?.filterByFieldOfStudy.enabled ?? false),
      );
      params.set(
        "filterFieldOfStudyData",
        filters?.filterByFieldOfStudy.value ?? "",
      );
      params.set(
        "filterByYear",
        String(filters?.filterByYear.enabled ?? false),
      );
      params.set("filterYearData", filters?.filterByYear.value ?? "");

      sessionStorage.setItem("fromHome", "true");

      router.push(`/call/connecting?${params.toString()}`);
    } catch (err) {
      toast.error("Please Allow Media Access!");
    }
  };

  return (
    <div className="flex flex-col items-center py-5 sm:py-10">
      <div className="w-[90vw] sm:w-[65vw]">
        <div className="py-5">
          <h2 className="text-2xl sm:text-3xl font-bold py-3 sm:py-5">How it Works</h2>
          <ol className="pl-6 sm:pl-10 list-decimal space-y-3">
            <li>
              <strong>UniVibe</strong> is an anonymous random video-calling
              platform built exclusively for university students across India,
              making it easy to meet and connect with new people.
            </li>

            <li>
              <strong>Random Calls:</strong> When a user starts a random call,
              UniVibe pairs them with the person who has been waiting in the
              queue the longest. This ensures that users are matched fairly
              based on their waiting time.
            </li>

            <li>
              <strong>Filtered Calls:</strong> Users can choose who they want to
              connect with based on their college. For example, if{" "}
              <strong>User 1</strong> from College A is looking for someone from
              College B, while <strong>User 2</strong> from College B is looking
              for someone from College A, UniVibe detects the mutual preference
              and pairs them together.
            </li>

            <li>
              <strong>Smart Fallback Matching:</strong> Filtered calls follow a
              <strong> College → Year → Field of Study → Random</strong>{" "}
              matching hierarchy. If no suitable match is found at the college
              level, UniVibe progressively broadens the search. Each fallback
              stage runs for <strong>20 seconds</strong>, giving users a chance
              to find the closest possible match before eventually falling back
              to a completely random connection.
            </li>
          </ol>
        </div>

        <div className="py-5">
          <h2 className="text-2xl sm:text-3xl font-bold py-3 sm:py-5">Rules</h2>
          <ol className="pl-6 sm:pl-10 list-decimal space-y-3">
            <li>
              <strong>18+ Only:</strong> UniVibe is exclusively for users aged
              18 and above.
            </li>

            <li>
              <strong>Respect Everyone:</strong> Treat every person you meet
              with respect. Keep conversations friendly, respectful, and
              welcoming.
            </li>

            <li>
              <strong>Zero Tolerance for Abuse:</strong> Nudity, hate speech,
              harassment, threats, or any other abusive behavior are strictly
              prohibited.
            </li>

            <li>
              <strong>Violations Have Consequences:</strong> Users who break
              these rules may be permanently banned, and further action may be
              taken when necessary.
            </li>
          </ol>
        </div>
      </div>

      <form
        onSubmit={handleStartCall}
        className="flex flex-col items-center justify-center gap-4 mt-6"
      >
        <div className="flex gap-6 items-center">
          <Button
            type="submit"
            disabled={enableFilters && !filtersValid}
            className="text-lg font-bold px-6 py-6 rounded-full cursor-pointer"
          >
            Start Call
          </Button>

          <div className="flex items-center gap-3 rounded-full border border-border/70 bg-card px-3 py-3 cursor-pointer">
            <Label htmlFor="single-call-filters" className="text-lg">
              Use filters
            </Label>
            <Switch
              id="single-call-filters"
              checked={enableFilters}
              onCheckedChange={(checked) => setEnableFilters(Boolean(checked))}
            />
          </div>
        </div>

        {enableFilters && (
          <MatchFilterPanel
            onValidityChange={setFiltersValid}
            onFiltersChange={setCurrentFilters}
          />
        )}
      </form>
    </div>
  );
};

export default Home;
