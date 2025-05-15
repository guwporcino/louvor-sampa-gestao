
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Archive, Box, Calendar, Shirt, Tag, Truck } from 'lucide-react';
import DonationsList from '@/components/social/DonationsList';
import InventoryManagement from '@/components/social/InventoryManagement';
import SocialSchedules from '@/components/social/SocialSchedules';
import SocialDashboard from '@/components/social/SocialDashboard';

const SocialProjects = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos Sociais</h1>
          <p className="text-muted-foreground">
            Gerenciamento de doações, estoque e escalas para projetos sociais
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/home">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="donations" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Doações</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            <span className="hidden sm:inline">Estoque</span>
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Escalas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <SocialDashboard />
        </TabsContent>

        <TabsContent value="donations" className="space-y-4">
          <DonationsList />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryManagement />
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <SocialSchedules />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialProjects;
