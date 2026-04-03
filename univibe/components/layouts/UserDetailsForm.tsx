"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import collegeList from "@/data/college-names.json"
import courseList from "@/data/course-names.json"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const pronounOptions = [
  "he/him",
  "she/her",
  "they/them",
  "he/they",
  "she/they",
  "other",
];

const hobbyOptions = [
  "Reading",
  "Gaming",
  "Cooking",
  "Hiking",
  "Photography",
  "Music",
  "Art",
  "Travel",
  "Fitness",
  "Coding",
  "Writing",
  "Dancing",
  "Gardening",
  "Sports",
  "Yoga",
];

const MAX_HOBBIES = 5;
const TOTAL_SLIDES = 3;

const UserDetailsForm = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const [selectedPronoun, setSelectedPronoun] = useState<string>("");
  const [customPronoun, setCustomPronoun] = useState<string>("");
  const isCustom = selectedPronoun === "other";
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [hobbyInput, setHobbyInput] = useState<string>("");
  const [isGender, setGender] = useState<string>("");
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const availableHobbies = hobbyOptions.filter(
    (h) => !selectedHobbies.includes(h),
  );

  const usernameRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
  const semesterRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const referralSourceRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const addHobby = (val: string) => {
    if (
      !val ||
      selectedHobbies.includes(val) ||
      selectedHobbies.length >= MAX_HOBBIES
    )
      return;
    setSelectedHobbies((prev) => [...prev, val]);
    setHobbyInput("");
  };

  const removeHobby = (hobby: string) => {
    setSelectedHobbies((prev) => prev.filter((h) => h !== hobby));
  };

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleSubmit = async () => {
    try {
      const body = {
        username: usernameRef?.current?.value,
        gender: isGender,
        age: Number(ageRef?.current?.value),
        pronouns: isCustom ? customPronoun : selectedPronoun,
        college: selectedCollege,
        fieldOfStudy: selectedCourse,
        semester: Number(semesterRef?.current?.value),
        year: Number(yearRef?.current?.value),
        hobbies: selectedHobbies,
        heardFrom: referralSourceRef?.current?.value,
      };
      console.log(body);

      setLoading(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success === true) {
        setLoading(false);
        toast.success(data.message);
        router.push("/home");
      } else {
        setLoading(false);
        if (data.errors) {
          const errors = data.errors as Record<string, string[]>;
          const firstError = Object.values(errors)[0][0];
          toast.error(firstError);
        } else {
          toast.error(data.message);
        }
      }
    } catch {
      toast.error("Something Went Wrong From client!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen py-10">
      <Carousel className="w-[35vw]" setApi={setApi}>
        <CarouselContent className="flex items-center">
          {/*Personal Details*/}
          <CarouselItem>
            <div className="p-5">
              <Card className="shadow-8xl backdrop-blur-3xl border">
                <CardContent className="border-b border-border/70 p-6">
                  <div className="flex flex-col gap-2 text-center">
                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                      Step 1 of 3
                    </p>
                    <div className="text-2xl font-semibold">
                      Personal Details
                    </div>
                  </div>
                </CardContent>
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      name="username"
                      ref={usernameRef}
                      placeholder="johndoe1234"
                      className="h-9"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1 flex-1">
                      <Label htmlFor="gender">Gender</Label>
                      <Select onValueChange={(val) => setGender(val as string)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Genders</SelectLabel>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">
                              Non-binary
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1 w-24">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        name="age"
                        ref={ageRef}
                        placeholder="21"
                        min={1}
                        max={100}
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="pronouns">Pronouns</Label>
                    <Combobox
                      items={pronounOptions}
                      value={selectedPronoun}
                      onValueChange={(val) => {
                        setSelectedPronoun(val as string);
                        if (val !== "other") setCustomPronoun("");
                      }}
                    >
                      <ComboboxInput placeholder="Select pronouns" />
                      <ComboboxContent>
                        <ComboboxEmpty>No pronouns found.</ComboboxEmpty>
                        <ComboboxList>
                          {pronounOptions.map((item) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {isCustom && (
                      <Input
                        type="text"
                        placeholder="e.g. xe/xem, ze/zir..."
                        value={customPronoun}
                        onChange={(e) => setCustomPronoun(e.target.value)}
                        className="h-9 mt-1"
                        autoFocus
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>

          {/*Education Details*/}
          <CarouselItem>
            <div className="p-4 sm:p-8">
              <Card className="shadow-8xl backdrop-blur-3xl border">
                <CardContent className="border-b border-border/70 p-6">
                  <div className="flex flex-col gap-2 text-center">
                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                      Step 2 of 3
                    </p>
                    <div className="text-2xl font-semibold">
                      Educational Details
                    </div>
                  </div>
                </CardContent>
                <CardContent className="flex flex-col gap-4 p-6">

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="college">University/College</Label>
                    <AutocompleteInput
                      data={collegeList}
                      value={selectedCollege}
                      onChange={setSelectedCollege}
                      placeholder="Search your college..."
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="field">Field of Study</Label>
                    <AutocompleteInput
                      data={courseList}
                      value={selectedCourse}
                      onChange={setSelectedCourse}
                      placeholder="e.g. BTECH "
                    />
                  </div>
                  <div className="flex w-full gap-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        name="year"
                        ref={yearRef}
                        placeholder="e.g. 4"
                        min={1}
                        max={4}
                        className="h-9"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <Label htmlFor="semester">Semester</Label>
                      <Input
                        id="semester"
                        type="number"
                        name="semester"
                        ref={semesterRef}
                        placeholder="e.g. 4"
                        min={1}
                        max={8}
                        className="h-9"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>

          {/*Miscellaneous*/}
          <CarouselItem>
            <div className="p-4 sm:p-8">
              <Card className="shadow-8xl backdrop-blur-3xl border">
                <CardContent className="border-b border-border/70 p-6">
                  <div className="flex flex-col gap-2 text-center">
                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                      Step 3 of 3
                    </p>
                    <div className="text-2xl font-semibold">Miscellaneous</div>
                  </div>
                </CardContent>
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <Label>Hobbies</Label>
                      <span className="text-xs text-muted-foreground">
                        {selectedHobbies.length}/{MAX_HOBBIES}
                      </span>
                    </div>

                    {/* Badges displayed inside the combobox */}
                    <div className="min-h-9 flex flex-wrap gap-1.5 rounded-md border-input bg-transparent px-2.5 py-1.5 border">
                      {selectedHobbies.map((hobby) => (
                        <Badge
                          key={hobby}
                          variant="secondary"
                          className="flex items-center gap-1 h-6 text-xs"
                        >
                          {hobby}
                          <button
                            type="button"
                            onClick={() => removeHobby(hobby)}
                            className="ml-0.5 hover:text-destructive transition-colors"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>

                    {selectedHobbies.length < MAX_HOBBIES && (
                      <Combobox
                        items={availableHobbies}
                        value={hobbyInput}
                        onValueChange={(val) => addHobby(val as string)}
                      >
                        <ComboboxInput
                          placeholder="Search or type a hobby..."
                          value={hobbyInput}
                          onChange={(e) =>
                            setHobbyInput((e.target as HTMLInputElement).value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && hobbyInput.trim()) {
                              addHobby(hobbyInput.trim());
                            }
                          }}
                        />
                        <ComboboxContent>
                          <ComboboxEmpty>
                            Press Enter to add "{hobbyInput}"
                          </ComboboxEmpty>
                          <ComboboxList>
                            {availableHobbies.map((item) => (
                              <ComboboxItem key={item} value={item}>
                                {item}
                              </ComboboxItem>
                            ))}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    )}

                    {selectedHobbies.length >= MAX_HOBBIES && (
                      <p className="text-xs text-muted-foreground">
                        Maximum of {MAX_HOBBIES} hobbies reached.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="referral">
                      Where did you hear about us?
                    </Label>
                    <Input
                      id="referral"
                      type="text"
                      name="referral"
                      placeholder="e.g. Twitter, friend, Google..."
                      ref={referralSourceRef}
                      //onChange={(e) => setReferralSource(e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button
                      disabled={loading}
                      onClick={handleSubmit}
                      className="text-base font-semibold"
                    >
                      {loading ? (
                        <span className="animate-pulse">Submitting...</span>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Dot indicators VIBCODED*/}
      <div className="mt-1 flex items-center gap-2 px-3 py-2">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => api?.scrollTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current
              ? "h-2 w-5 bg-primary"
              : "h-2 w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default UserDetailsForm;
