
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

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
  title1?: string;
  value1: number;
  description1?: string;
  icon1?: ReactNode;
  
  title2?: string;
  value2: number;
  description2?: string;
  icon2?: ReactNode;
  
  title3?: string;
  value3: number;
  description3?: string;
  icon3?: ReactNode;
  
  title4?: string;
  value4: number;
  description4?: string;
  icon4?: ReactNode;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  title1 = "Total de Membros",
  value1,
  description1 = "Membros cadastrados",
  icon1,
  
  title2 = "Membros Ativos",
  value2,
  description2 = "Participando ativamente",
  icon2,
  
  title3 = "Próximas Escalas",
  value3,
  description3 = "Escalas futuras",
  icon3,
  
  title4 = "Músicas",
  value4,
  description4 = "No repertório",
  icon4,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title={title1}
        value={value1}
        icon={icon1}
        description={description1}
        emptyState={value1 === 0}
      />
      <StatsCard
        title={title2}
        value={value2}
        icon={icon2}
        description={description2}
        emptyState={value2 === 0}
      />
      <StatsCard
        title={title3}
        value={value3}
        icon={icon3}
        description={description3}
        emptyState={value3 === 0}
      />
      <StatsCard
        title={title4}
        value={value4}
        icon={icon4}
        description={description4}
        emptyState={value4 === 0}
      />
    </div>
  );
};

export default DashboardStats;
