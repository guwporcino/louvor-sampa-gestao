
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Music, Users } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  emptyState?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, description, emptyState }) => {
  return (
    <Card className="worship-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`h-8 w-8 rounded-full p-1.5 ${emptyState ? 'bg-gray-200 text-gray-400' : 'bg-worship-gold/20 text-worship-gold'}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${emptyState ? 'text-gray-400' : ''}`}>{value}</div>
        {description && (
          <p className={`text-xs mt-1 ${emptyState ? 'text-gray-400' : 'text-muted-foreground'}`}>{description}</p>
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
        emptyState={totalMembers === 0}
      />
      <StatsCard
        title="Membros Ativos"
        value={activeMembers}
        icon={<FileText className="h-5 w-5" />}
        description="Participando ativamente"
        emptyState={activeMembers === 0}
      />
      <StatsCard
        title="Próximas Escalas"
        value={upcomingSchedules}
        icon={<Calendar className="h-5 w-5" />}
        description="Escalas futuras"
        emptyState={upcomingSchedules === 0}
      />
      <StatsCard
        title="Músicas"
        value={totalSongs}
        icon={<Music className="h-5 w-5" />}
        description="No repertório"
        emptyState={totalSongs === 0}
      />
    </div>
  );
};

export default DashboardStats;
