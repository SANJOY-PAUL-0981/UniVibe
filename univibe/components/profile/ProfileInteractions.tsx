"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  selectProfileStoreHobbies,
  useProfileStore,
} from "@/store/useProfileStore";

const MAX_HOBBIES = 10;

type Props = { initialHobbies: string[] };

export function ProfileInteractions({ initialHobbies }: Props) {
  const storeHobbies = useProfileStore(selectProfileStoreHobbies);
  const updateProfilePartial = useProfileStore((state) => state.updateProfilePartial);

  const [hobbies, setHobbies] = useState(
    storeHobbies.length > 0 ? storeHobbies : initialHobbies,
  );
  const [editing, setEditing] = useState(false);
  const [newHobby, setNewHobby] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (saving) {
      return;
    }

    setHobbies(storeHobbies.length > 0 ? storeHobbies : initialHobbies);
  }, [storeHobbies, initialHobbies, saving]);

  const updateHobbies = async (updated: string[]) => {
    setSaving(true);

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hobbies: updated }),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message ?? "Failed to update hobbies");
      }

      const normalizedHobbies = Array.isArray(data.hobbies) ? data.hobbies : updated;
      setHobbies(normalizedHobbies);
      updateProfilePartial({ hobbies: normalizedHobbies });
    } catch (error) {
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const removeHobby = async (hobby: string) => {
    const previousHobbies = hobbies;
    const updated = hobbies.filter((h) => h !== hobby);
    setHobbies(updated);

    try {
      await updateHobbies(updated);
    } catch {
      setHobbies(previousHobbies);
      toast.error("Could not delete hobby. Please try again.");
    }
  };

  const addHobby = async () => {
    const hobby = newHobby.trim();

    if (!hobby) return;

    if (hobbies.some((h) => h.toLowerCase() === hobby.toLowerCase())) {
      toast.error("That hobby already exists.");
      return;
    }

    if (hobbies.length >= MAX_HOBBIES) {
      toast.error(`You can add up to ${MAX_HOBBIES} hobbies.`);
      return;
    }

    const previousHobbies = hobbies;
    const updated = [...hobbies, hobby];
    setHobbies(updated);
    setNewHobby("");

    try {
      await updateHobbies(updated);
    } catch {
      setHobbies(previousHobbies);
      setNewHobby(hobby);
      toast.error("Could not add hobby. Please try again.");
    }
  };

  return (
    // Same card style as the other bento cells
    <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Hobbies
        </h2>
        <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs"
          onClick={() => setEditing((e) => !e)}>
          {editing ? "Done" : "Edit"}
        </Button>
      </div>

      {editing && (
        <div className="mt-3 flex gap-2">
          <Input
            value={newHobby}
            onChange={(e) => setNewHobby(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!saving) {
                  void addHobby();
                }
              }
            }}
            placeholder="Add a hobby"
            className="h-9"
            disabled={saving}
          />
          <Button
            type="button"
            size="sm"
            className="h-9 px-3"
            onClick={() => void addHobby()}
            disabled={saving}
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {hobbies.map((h) => (
          <Badge key={h} variant="secondary" className="gap-1 text-sm">
            {h}
            {editing && (
              <button type="button" onClick={() => void removeHobby(h)}
                disabled={saving}
                className="hover:text-destructive transition-colors">
                <X className="size-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
}