import Image from "next/image";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Medisow Admin Dashboard
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Users"
          value="0"
          description="Active users"
          className="bg-blue-50 dark:bg-blue-950"
        />
        <DashboardCard
          title="Total Medicines"
          value="0"
          description="Across all categories"
          className="bg-green-50 dark:bg-green-950"
        />
        <DashboardCard 
          title="Total Prescriptions"
          value="0"
          description="Across all categories"
          className="bg-purple-50 dark:bg-purple-950"
        />
        <DashboardCard
          title="Total Donors"
          value="0"
          description="Registered blood donors"
          className="bg-red-50 dark:bg-red-950"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
          <div className="text-center py-8 text-muted-foreground">
            Connect to Firestore to view recent users
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Medicines</h2>
          <div className="text-center py-8 text-muted-foreground">
            Connect to Firestore to view recent medicines
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
  className,
}: {
  title: string;
  value: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border bg-card p-6 ${className}`}>
      <div className="font-medium">{title}</div>
      <div className="text-3xl font-bold py-2">{value}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </div>
  );
}
