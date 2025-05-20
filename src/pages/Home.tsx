
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, ChartBar, Calendar, ArrowRight, Archive, Box, Bird, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-divinus-blue/10 to-divinus-deepBlue/5 dark:from-gray-900 dark:to-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12 pt-8">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-divinus-blue flex items-center justify-center relative">
              <Bird className="h-14 w-14 text-white" />
              <div className="absolute -bottom-1 -right-1">
                <Leaf className="h-6 w-6 text-divinus-gold rotate-45" />
              </div>
            </div>
          </div>
          <h1 className="font-serif text-5xl font-bold tracking-tight mb-2 text-divinus-deepBlue dark:text-white">DivinusGest</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Sistema de Gestão para Igrejas</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/financeiro" className="block group">
            <Card className="h-full transition-all duration-300 group-hover:shadow-lg border-2 group-hover:border-divinus-blue">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-12 w-12 text-divinus-blue" />
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <CardTitle className="text-3xl pt-4 font-serif">Financeiro</CardTitle>
                <CardDescription className="text-base">
                  Gestão financeira completa da igreja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-divinus-blue/10 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-divinus-blue" />
                    </div>
                    <span>Controle de receitas e despesas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-divinus-blue/10 flex items-center justify-center">
                      <ChartBar className="h-4 w-4 text-divinus-blue" />
                    </div>
                    <span>Relatórios e dashboards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-divinus-blue/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-divinus-blue" />
                    </div>
                    <span>Planejamento financeiro</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-divinus-blue hover:bg-divinus-blue/90">
                  Acessar Módulo Financeiro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>

          <Link to="/dashboard" className="block group">
            <Card className="h-full transition-all duration-300 group-hover:shadow-lg border-2 group-hover:border-divinus-deepBlue">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Users className="h-12 w-12 text-divinus-deepBlue" />
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <CardTitle className="text-3xl pt-4 font-serif">Gestão de Equipes</CardTitle>
                <CardDescription className="text-base">
                  Gerenciamento de ministérios e equipes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-divinus-deepBlue/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-divinus-deepBlue" />
                    </div>
                    <span>Gestão de membros</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-divinus-deepBlue/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-divinus-deepBlue" />
                    </div>
                    <span>Escalas e agendamentos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-divinus-deepBlue/10 flex items-center justify-center">
                      <ChartBar className="h-4 w-4 text-divinus-deepBlue" />
                    </div>
                    <span>Relatórios de atividades</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" 
                  style={{ borderColor: 'var(--divinus-deepBlue)', color: 'var(--divinus-deepBlue)' }}>
                  Acessar Gestão de Equipes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
          
          <Link to="/projetos-sociais" className="block group">
            <Card className="h-full transition-all duration-300 group-hover:shadow-lg border-2 group-hover:border-divinus-olive">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Archive className="h-12 w-12 text-divinus-olive" />
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <CardTitle className="text-3xl pt-4 font-serif">Projetos Sociais</CardTitle>
                <CardDescription className="text-base">
                  Gestão de doações e ações sociais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-divinus-olive/10 flex items-center justify-center">
                      <Archive className="h-4 w-4 text-divinus-olive" />
                    </div>
                    <span>Controle de doações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-divinus-olive/10 flex items-center justify-center">
                      <Box className="h-4 w-4 text-divinus-olive" />
                    </div>
                    <span>Gestão de estoque</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-divinus-olive/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-divinus-olive" />
                    </div>
                    <span>Escalas de voluntários</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" 
                       style={{ backgroundColor: '#8BAB6A', color: 'white' }}
                       onClick={() => {}}>
                  Acessar Projetos Sociais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        </div>

        <footer className="mt-16 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} DivinusGest - Sistema de Gestão para Igrejas. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Home;
