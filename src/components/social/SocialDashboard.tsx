
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt, Gift, Box, Users, Calendar as CalendarIcon, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SocialDashboard = () => {
  // Dados simulados para o dashboard
  const dashboardData = {
    clothingDonations: 128,
    foodDonations: 56,
    activeVolunteers: 24,
    inventoryItems: 215
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doações de Roupas</CardTitle>
            <Shirt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.clothingDonations}</div>
            <p className="text-xs text-muted-foreground">
              +4% comparado ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doações de Alimentos</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.foodDonations}</div>
            <p className="text-xs text-muted-foreground">
              +12% comparado ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voluntários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeVolunteers}</div>
            <p className="text-xs text-muted-foreground">
              +2 voluntários este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens em Estoque</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.inventoryItems}</div>
            <p className="text-xs text-muted-foreground">
              15 itens com baixo estoque
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas atividades nos projetos sociais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Recebido 35kg de alimentos</p>
                  <p className="text-sm text-muted-foreground">Há 2 horas atrás</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Distribuídas 22 marmitas</p>
                  <p className="text-sm text-muted-foreground">Há 1 dia atrás</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-purple-500"></div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Recebido 15 peças de roupa</p>
                  <p className="text-sm text-muted-foreground">Há 2 dias atrás</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full" variant="outline">
                <Shirt className="mr-2 h-4 w-4" />
                Registrar nova doação
              </Button>
              <Button className="w-full" variant="outline">
                <Box className="mr-2 h-4 w-4" />
                Atualizar estoque
              </Button>
              <Button className="w-full" variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Criar nova escala
              </Button>
              <Button className="w-full" variant="outline">
                <TagIcon className="mr-2 h-4 w-4" />
                Adicionar categoria
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialDashboard;
