import { getMainUserData } from "@/lib/getMainUserData";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileInteractions } from "@/components/profile/ProfileInteractions";
import { signOutAction } from "@/actions/signOut.action";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default async function ProfilePage() {
    const user = await getMainUserData();

    const { profile } = user;
    const initials = user.profile.username
        .split(/[\s_-]+/).map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

    return (
        <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    {/* ── Card 1: Identity (spans 2 cols) ── */}
                    <div className="relative md:col-span-2 rounded-2xl border border-border/70 bg-card p-8 shadow-sm">
                        <div className="flex items-center gap-6">
                            <ProfileAvatar initials={initials} />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    @{profile.username}
                                </p>
                                <h1 className="text-3xl font-semibold tracking-tight">{user.name}</h1>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        {/* Sign out — top right */}
                        <form action={signOutAction} className="absolute right-6 top-6">
                            <Button type="submit" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground rounded-full">
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </Button>
                        </form>
                    </div>

                    {/* ── Card 2: Personal Details ── */}
                    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
                        <SectionTitle>Personal</SectionTitle>
                        <div className="mt-3 flex flex-col gap-2">
                            <Field label="Gender" value={profile.gender} />
                            <Field label="Age" value={profile.age?.toString()} />
                            <Field label="Pronouns" value={profile.pronouns} />
                        </div>
                    </div>

                    {/* ── Card 3: Education (spans 2 cols) ── */}
                    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm md:col-span-2">
                        <SectionTitle>Education</SectionTitle>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <Field label="University" value={profile.university} />
                            <Field label="College" value={profile.college} />
                            <Field label="Field of Study" value={profile.fieldOfStudy} />
                            <Field label="Semester" value={profile.semester?.toString()} />
                        </div>
                    </div>

                    {/* ── Card 4: Hobbies (client island) ── */}
                    <ProfileInteractions
                        initialHobbies={profile.hobbies}
                    />

                </div>
        </main>
    );
}

// ── tiny server-only helpers ──────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {children}
        </h2>
    );
}

function Field({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}