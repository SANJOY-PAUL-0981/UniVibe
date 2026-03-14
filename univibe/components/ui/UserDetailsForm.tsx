"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  const [selectedPronoun, setSelectedPronoun] = React.useState<string>("");
  const [customPronoun, setCustomPronoun] = React.useState<string>("");
  const isCustom = selectedPronoun === "other";

  const [selectedHobbies, setSelectedHobbies] = React.useState<string[]>([]);
  const [hobbyInput, setHobbyInput] = React.useState<string>("");
  const [referralSource, setReferralSource] = React.useState<string>("");

  const availableHobbies = hobbyOptions.filter(
    (h) => !selectedHobbies.includes(h),
  );

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

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-10 sm:px-6">
      <Carousel className="w-full max-w-2xl" setApi={setApi}>
        <CarouselContent className="flex items-center">
          {/*Personal Details*/}
          <CarouselItem>
            <div className="p-4 sm:p-10">
              <Card className="border border-border/70 bg-card shadow-2xl backdrop-blur-xl">
                <CardContent className="border-b border-border/70 p-6">
                  <div className="flex flex-col gap-2 text-center">
                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                      Step 1 of 3
                    </p>
                    <div className="text-2xl tracking-tight text-card-foreground font-semibold">
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
                      placeholder="johndoe1234"
                      className="h-9"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1 flex-1">
                      <Label htmlFor="gender">Gender</Label>
                      <Select>
                        <SelectTrigger className="h-11 w-full">
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
                        placeholder="21"
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
            <div className="p-4 sm:p-6">
              <Card className="border border-border/70 bg-card shadow-xl">
                <CardContent className="border-b border-border/70 p-6">
                  <div className="flex flex-col gap-2 text-center">
                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                      Step 2 of 3
                    </p>
                    <div className="text-2xl font-semibold">
                      Education Details
                    </div>
                  </div>
                </CardContent>
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="university">University</Label>
                    <Input
                      id="university"
                      type="text"
                      name="university"
                      placeholder="e.g. MIT"
                      className="h-9"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="college">College</Label>
                    <Input
                      id="college"
                      type="text"
                      name="college"
                      placeholder="e.g. School of Engineering"
                      className="h-9"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="field">Field of Study</Label>
                    <Input
                      id="field"
                      type="text"
                      name="field"
                      placeholder="e.g. Computer Science"
                      className="h-9"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="semester">Semester</Label>
                    <Input
                      id="semester"
                      type="number"
                      name="semester"
                      placeholder="e.g. 4"
                      className="h-9"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>

          {/*Miscellaneous*/}
          <CarouselItem>
            <div className="p-4 sm:p-6">
              <Card className="border border-border/70 bg-card shadow-xl">
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
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button className="h-11 text-base font-bold">
                      Finish!
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="left-0 border-border/70 bg-background/90 shadow-sm sm:-left-4" />
        <CarouselNext className="right-0 border-border/70 bg-background/90 shadow-sm sm:-right-4" />
      </Carousel>

      {/* Dot indicators VIBCODED*/}
      <div className="mt-3 flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-2">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => api?.scrollTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
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
