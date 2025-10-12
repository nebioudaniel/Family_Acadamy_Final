// app/dashboard/teacher/_components/StatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
    colorClass: string;
}

export default function StatsCard({ title, value, description, icon: Icon, colorClass }: StatsCardProps) {
    return (
        <Card className="hover:shadow-xl transition-all duration-300 border-t-4 border-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
            <Icon className={`h-5 w-5 ${colorClass}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-extrabold ${colorClass}`}>{value}</div>
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          </CardContent>
        </Card>
    );
}