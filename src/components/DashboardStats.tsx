
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Music, Users } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, description }) => {
  return (
    <Card className="worship-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-worship-gold/20 p-1.5 text-worship-gold">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  totalMembers: number;
  upcomingSchedules: number;
  totalSongs: number;
  activeMembers: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalMembers,
  upcomingSchedules,
  totalSongs,
  activeMembers,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total de Membros"
        value={totalMembers}
        icon={<Users className="h-5 w-5" />}
        description="Membros cadastrados"
      />
      <StatsCard
        title="Membros Ativos"
        value={activeMembers}
        icon={<FileText className="h-5 w-5" />}
        description="Participando ativamente"
      />
      <StatsCard
        title="Próximas Escalas"
        value={upcomingSchedules}
        icon={<Calendar className="h-5 w-5" />}
        description="Escalas futuras"
      />
      <StatsCard
        title="Músicas"
        value={totalSongs}
        icon={<Music className="h-5 w-5" />}
        description="No repertório"
      />
    </div>
  );
};

export default DashboardStats;
