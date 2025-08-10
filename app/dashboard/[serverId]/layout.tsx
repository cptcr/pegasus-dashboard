import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";

interface ServerLayoutProps {
  children: React.ReactNode;
  params: {
    serverId: string;
  };
}

export default async function ServerLayout({ children, params }: ServerLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // TODO: Fetch server name from API or database
  // For now, we'll pass the serverId
  
  return (
    <DashboardLayout serverId={params['serverId']}>
      {children}
    </DashboardLayout>
  );
}