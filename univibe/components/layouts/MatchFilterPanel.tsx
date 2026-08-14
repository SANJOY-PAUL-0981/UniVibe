"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { cn } from "@/lib/utils";


import collegeList from "@/data/college-names.json";
import courseList from "@/data/course-names.json";


const FILTER_OPTIONS = {
    filterByGender: ["male", "female", "non-binary", "other"],
    filterByYear: ["1", "2", "3", "4", "5"],
} as const;

type FilterKey = "filterByGender" | "filterByCollege" | "filterByFieldOfStudy" | "filterByYear";
type InputType = "select" | "college" | "course";

export type FilterValue = {
    enabled: boolean;
    value: string;
};

export type Filters = Record<FilterKey, FilterValue>;

type Props = {
    onValidityChange?: (isValid: boolean) => void;
    onFiltersChange?: (filters: Filters) => void;
};

const FILTER_META: {
    key: FilterKey;
    id: string;
    label: string;
    description: string;
    placeholder: string;
    inputType: InputType;
}[] = [
        {
            key: "filterByGender",
            id: "fg",
            label: "Gender",
            description: "Match a specific gender",
            placeholder: "Choose gender",
            inputType: "select",
        },
        {
            key: "filterByCollege",
            id: "fc",
            label: "University/College",
            description: "Match a specific university/college",
            placeholder: "Choose college",
            inputType: "college",
        },
        {
            key: "filterByFieldOfStudy",
            id: "ff",
            label: "Field of study",
            description: "Match a specific major",
            placeholder: "Choose field of study",
            inputType: "course",
        },
        {
            key: "filterByYear",
            id: "fy",
            label: "Year",
            description: "Match a specific academic year",
            placeholder: "Choose year",
            inputType: "select",
        },
    ];

export function MatchFilterPanel({ onValidityChange, onFiltersChange }: Props) {
    const [filters, setFilters] = useState<Filters>({
        filterByGender: { enabled: false, value: "" },
        filterByCollege: { enabled: false, value: "" },
        filterByFieldOfStudy: { enabled: false, value: "" },
        filterByYear: { enabled: false, value: "" },
    });

    const toggle = (key: FilterKey) =>
        setFilters((prev) => ({
            ...prev,
            [key]: { ...prev[key], enabled: !prev[key].enabled },
        }));

    const setValue = (key: FilterKey, value: string) =>
        setFilters((prev) => ({
            ...prev,
            [key]: { ...prev[key], value },
        }));

    useEffect(() => {
        const anyEnabledWithoutValue = Object.values(filters).some(
            (filter) => filter.enabled && filter.value.trim() === "",
        );

        onValidityChange?.(!anyEnabledWithoutValue);
        onFiltersChange?.(filters);
    }, [filters, onValidityChange, onFiltersChange]);

    return (
        <div className="w-[70vw] max-w-4xl rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <p className="text-lg font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Matchmaking filters
            </p>

            <p className="text-md text-muted-foreground mb-2">Narrow by</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {FILTER_META.map((item) => {
                    const filterState = filters[item.key];
                    // Only pass options if it's a select dropdown
                    const options = item.inputType === "select"
                        ? FILTER_OPTIONS[item.key as keyof typeof FILTER_OPTIONS]
                        : [];

                    return (
                        <FilterCard
                            key={item.key}
                            id={item.id}
                            label={item.label}
                            sub={item.description}
                            enabled={filterState.enabled}
                            value={filterState.value}
                            options={options}
                            placeholder={item.placeholder}
                            inputType={item.inputType}
                            onToggle={() => toggle(item.key)}
                            onChange={(value) => setValue(item.key, value)}
                        />
                    );
                })}
            </div>

            {Object.values(filters).some(
                (filter) => filter.enabled && filter.value.trim() === "",
            ) && (
                    <p className="mt-4 text-sm text-destructive">
                        Select a value for every enabled filter before starting the call.
                    </p>
                )}
        </div>
    );
}

function FilterCard({
    id,
    label,
    sub,
    enabled,
    value,
    options,
    placeholder,
    inputType,
    onToggle,
    onChange,
}: {
    id: string;
    label: string;
    sub: string;
    enabled: boolean;
    value: string;
    options: readonly string[];
    placeholder: string;
    inputType: InputType;
    onToggle: () => void;
    onChange: (value: string) => void;
}) {
    return (
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-start justify-between">
                <div>
                    <Label htmlFor={id} className="cursor-pointer text-md font-medium">
                        {label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>
                </div>
                <Switch id={id} checked={enabled} onCheckedChange={onToggle} />
            </div>

            <div
                className={cn(
                    "mt-3 transition-opacity relative",
                    enabled ? "opacity-100" : "pointer-events-none opacity-45",
                )}
            >
                {inputType === "college" && (
                    <AutocompleteInput
                        data={collegeList}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        iconType="college"
                    />
                )}

                {inputType === "course" && (
                    <AutocompleteInput
                        data={courseList}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        iconType="course"
                    />
                )}

                {inputType === "select" && (
                    <Select
                        value={value}
                        onValueChange={(nextValue) => onChange(nextValue ?? "")}
                    >
                        <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option} value={option} className="capitalize">
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
    );
}