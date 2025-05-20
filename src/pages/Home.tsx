
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, ChartBar, Calendar, ArrowRight, Archive, Box, Church, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12 pt-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
              IC
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Igreja Batista Renovada Cristo À Única Esperança</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Sistema de Gestão</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/financeiro" className="block group">
            <Card className="h-full transition-all duration-300 group-hover:shadow-lg border-2 group-hover:border-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-12 w-12 text-blue-500" />
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <CardTitle className="text-3xl pt-4">Financeiro</CardTitle>
                <CardDescription className="text-base">
                  Gestão financeira completa da igreja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                    </div>
                    <span>Controle de receitas e despesas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <ChartBar className="h-4 w-4 text-blue-500" />
                    </div>
                    <span>Relatórios e dashboards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                    <span>Planejamento financeiro</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  Acessar Módulo Financeiro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>

          <Link to="/dashboard" className="block group">
            <Card className="h-full transition-all duration-300 group-hover:shadow-lg border-2 group-hover:border-purple-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Users className="h-12 w-12 text-purple-500" />
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <CardTitle className="text-3xl pt-4">Gestão de Equipes</CardTitle>
                <CardDescription className="text-base">
                  Gerenciamento de ministérios e equipes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-500" />
                    </div>
                    <span>Gestão de membros</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-purple-500" />
                    </div>
                    <span>Escalas e agendamentos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <ChartBar className="h-4 w-4 text-purple-500" />
                    </div>
                    <span>Relatórios de atividades</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">
                  Acessar Gestão de Equipes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
          
          <Link to="/projetos-sociais" className="block group">
            <Card className="h-full transition-all duration-300 group-hover:shadow-lg border-2 group-hover:border-green-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Archive className="h-12 w-12 text-green-500" />
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <CardTitle className="text-3xl pt-4">Projetos Sociais</CardTitle>
                <CardDescription className="text-base">
                  Gestão de doações e ações sociais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Archive className="h-4 w-4 text-green-500" />
                    </div>
                    <span>Controle de doações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Box className="h-4 w-4 text-green-500" />
                    </div>
                    <span>Gestão de estoque</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-500" />
                    </div>
                    <span>Escalas de voluntários</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="success">
                  Acessar Projetos Sociais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        </div>

        <footer className="mt-16 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Igreja Batista Renovada Cristo À Única Esperança. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Home;
