import {
  Calendar,
  DollarSign,
  Users,
  UserCog,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    title: "Monthly Revenue",
    value: "R$ 18.420",
    icon: DollarSign,
  },
  {
    title: "Today's Appointments",
    value: "24",
    icon: Calendar,
  },
  {
    title: "Customers",
    value: "328",
    icon: Users,
  },
  {
    title: "Employees",
    value: "8",
    icon: UserCog,
  },
];

const appointments = [
  {
    customer: "João Silva",
    service: "Haircut",
    time: "09:00",
  },
  {
    customer: "Maria Souza",
    service: "Manicure",
    time: "10:30",
  },
  {
    customer: "Pedro Lima",
    service: "Beard",
    time: "13:00",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your business.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>

                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-3xl font-bold">
                  {stat.value}
                </div>

                <p className="mt-1 flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +12% this month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex h-80 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
              Revenue chart will be displayed here
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.customer}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">
                    {appointment.customer}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {appointment.service}
                  </p>
                </div>

                <span className="font-semibold">
                  {appointment.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}