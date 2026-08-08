import AppNav from "@/components/layouts/AppNav";
import { getMainUserData } from "@/lib/getMainUserData";
import ProfileStoreHydrator from "@/components/provider/ProfileStoreHydrator";
type MainLayoutProps = {
  children: React.ReactNode;
};

export default async function MainLayout({ children }: MainLayoutProps) {
  const user = await getMainUserData();

  return (
    <div className="min-h-screen bg-background">
      <ProfileStoreHydrator initialUser={user} />
      <AppNav />
      {children}
    </div>
  );
}