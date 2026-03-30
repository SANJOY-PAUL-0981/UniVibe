import AppNav from "@/components/layouts/AppNav";
import { getMainUserData } from "@/lib/getMainUserData";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default async function MainLayout({ children }: MainLayoutProps) {
  const user = await getMainUserData();

  return (
    <div className="min-h-screen bg-background">
      <AppNav username={user.profile.username} name={user.name} />
      {children}
    </div>
  );
}