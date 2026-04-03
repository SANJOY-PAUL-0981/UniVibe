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
import { CollegePicker } from "@/components/ui/college-picker";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS = {
    filterByGender: ["male", "female"],
    filterByFieldOfStudy: [
        "computer-science",
        "electrical-engineering",
        "mechanical-engineering",
        "data-science",
        "business-administration",
        "biology",
    ],
    filterByYear: ["1", "2", "3", "4", "5"],
} as const;

type FilterKey = keyof typeof FILTER_OPTIONS;

type FilterValue = {
    enabled: boolean;
    value: string;
};

type Filters = {
    filterByGender: FilterValue;
    filterByCollege: FilterValue;
    filterByFieldOfStudy: FilterValue;
    filterByYear: FilterValue;
};

type Props = {
    onValidityChange?: (isValid: boolean) => void;
};

const FILTER_META: {
    key: FilterKey;
    id: string;
    label: string;
    description: string;
    placeholder: string;
}[] = [
        {
            key: "filterByGender",
            id: "fg",
            label: "Gender",
            description: "Match a specific gender",
            placeholder: "Choose gender",
        },
        {
            key: "filterByCollege",
            id: "fc",
            label: "University/College",
            description: "Match a specific university/college",
            placeholder: "Choose college",
        },
        {
            key: "filterByFieldOfStudy",
            id: "ff",
            label: "Field of study",
            description: "Match a specific major",
            placeholder: "Choose field of study",
        },
        {
            key: "filterByYear",
            id: "fy",
            label: "Year",
            description: "Match a specific academic year",
            placeholder: "Choose year",
        },
    ];

export function MatchFilterPanel({ onValidityChange }: Props) {
    const [filters, setFilters] = useState<Filters>({
        filterByGender: { enabled: false, value: "" },
        filterByCollege: {
            enabled: false,
            value: "",
        },
        filterByFieldOfStudy: {
            enabled: false,
            value: "",
        },
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
    }, [filters, onValidityChange]);

    return (
        <div className="w-full max-w-4xl rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Matchmaking filters
            </p>

            <p className="text-xs text-muted-foreground mb-2">Narrow by</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {FILTER_META.map((item) => {
                    const filterState = filters[item.key];
                    const options = FILTER_OPTIONS[item.key];

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
                            useCollegePicker={item.key === "filterByCollege"}
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
    useCollegePicker,
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
    useCollegePicker?: boolean;
    onToggle: () => void;
    onChange: (value: string) => void;
}) {
    return (
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
                        {label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
                <Switch id={id} checked={enabled} onCheckedChange={onToggle} />
            </div>

            <div
                className={cn(
                    "mt-3 transition-opacity",
                    enabled ? "opacity-100" : "pointer-events-none opacity-45",
                )}
            >
                {useCollegePicker ? (
                    <CollegePicker
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                    />
                ) : (
                    <Select
                        value={value}
                        onValueChange={(nextValue) => onChange(nextValue ?? "")}
                    >
                        <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option} value={option}>
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