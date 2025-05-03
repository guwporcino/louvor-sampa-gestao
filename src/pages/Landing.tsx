
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const features = {
  basic: [
    "Gerenciamento de membros",
    "Escalas de louvor",
    "Repertório de músicas",
    "1 departamento",
    "Suporte por email",
  ],
  pro: [
    "Tudo do plano Basic",
    "3 departamentos",
    "Escalas da EBD",
    "Escalas da Sonoplastia",
    "Gerenciamento de turmas",
    "Gerenciamento de professores",
    "Suporte prioritário",
  ],
  premium: [
    "Tudo do plano Pro",
    "Departamentos ilimitados",
    "Exportar relatórios",
    "Geração automática de escalas",
    "Importação em massa",
    "Suporte 24/7",
    "Personalização completa",
  ],
};

const notIncluded = {
  basic: ["Escalas da EBD", "Escalas da Sonoplastia", "Exportar relatórios", "Personalização"],
  pro: ["Departamentos ilimitados", "Geração automática de escalas", "Suporte 24/7"],
  premium: [],
};

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-worship-blue to-worship-purple">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Louvor Sampa Gestão
          </h1>
          <p className="text-xl text-worship-lightGray mb-10">
            Gerencie sua equipe de louvor, escola bíblica e sonoplastia com facilidade.
            Organize escalas, membros e repertório em um só lugar.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-worship-gold hover:bg-worship-gold/90 text-worship-blue text-lg">
              Começar Gratuitamente
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-lg">
              Ver Demonstração
            </Button>
          </div>
        </div>
      </div>

      {/* App Preview Section */}
      <div className="bg-white py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-worship-blue text-center mb-16">
            Tudo que você precisa para gerenciar seu ministério
          </h2>
          
          <Tabs defaultValue="escalas" className="w-full max-w-5xl mx-auto">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-gray-100">
                <TabsTrigger value="escalas" className="text-lg px-6 py-3">Escalas</TabsTrigger>
                <TabsTrigger value="membros" className="text-lg px-6 py-3">Membros</TabsTrigger>
                <TabsTrigger value="repertorio" className="text-lg px-6 py-3">Repertório</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="escalas" className="mt-0">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <h3 className="text-3xl font-bold text-worship-purple mb-4">Escalas Inteligentes</h3>
                  <p className="text-gray-700 mb-6">
                    Crie e gerencie escalas para louvor, sonoplastia e escola bíblica dominical.
                    Defina datas, adicione participantes e até mesmo gere escalas automaticamente.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="text-green-600" />
                      <span>Gere escalas aleatórias</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-600" />
                      <span>Replique escalas anteriores</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-600" />
                      <span>Visualização em calendário</span>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2 bg-gray-100 rounded-xl overflow-hidden shadow-xl">
                  <img 
                    src="/placeholder.svg" 
                    alt="Escalas" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="membros" className="mt-0">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <h3 className="text-3xl font-bold text-worship-purple mb-4">Gestão de Membros</h3>
                  <p className="text-gray-700 mb-6">
                    Mantenha registros detalhados de todos os membros da sua equipe,
                    incluindo contatos, funções, instrumentos e disponibilidade.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="text-green-600" />
                      <span>Perfis personalizados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-600" />
                      <span>Controle de disponibilidade</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-600" />
                      <span>Histórico de participação</span>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2 bg-gray-100 rounded-xl overflow-hidden shadow-xl">
                  <img 
                    src="/placeholder.svg" 
                    alt="Membros" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="repertorio" className="mt-0">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <h3 className="text-3xl font-bold text-worship-purple mb-4">Repertório Completo</h3>
                  <p className="text-gray-700 mb-6">
                    Organize todas as suas músicas em um só lugar. Adicione letras, cifras,
                    partituras e links para áudios e vídeos. Crie setlists para cada ocasião.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="text-green-600" />
                      <span>Importação de músicas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-600" />
                      <span>Organização por tonalidade</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-600" />
                      <span>Integração com escalas</span>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2 bg-gray-100 rounded-xl overflow-hidden shadow-xl">
                  <img 
                    src="/placeholder.svg" 
                    alt="Repertório" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-worship-lightGray py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-worship-blue text-center mb-16">
            Funcionalidades Poderosas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-lg gold-glow">
              <div className="w-16 h-16 bg-worship-blue rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-worship-blue mb-3">Múltiplos Departamentos</h3>
              <p className="text-gray-600">
                Gerencie diversos departamentos da sua igreja em um único sistema, mantendo tudo organizado.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg gold-glow">
              <div className="w-16 h-16 bg-worship-purple rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                  <line x1="16" x2="16" y1="2" y2="6"></line>
                  <line x1="8" x2="8" y1="2" y2="6"></line>
                  <line x1="3" x2="21" y1="10" y2="10"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-worship-purple mb-3">Calendário Integrado</h3>
              <p className="text-gray-600">
                Visualize todas as escalas em um calendário intuitivo, facilitando o planejamento e organização.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg gold-glow">
              <div className="w-16 h-16 bg-worship-gold rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A365D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"></path>
                  <circle cx="17" cy="7" r="5"></circle>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-worship-blue mb-3">Geração Automática</h3>
              <p className="text-gray-600">
                Economize tempo com a geração automática de escalas baseada na disponibilidade dos membros.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg gold-glow">
              <div className="w-16 h-16 bg-worship-blue rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-worship-blue mb-3">Gestão de Equipes</h3>
              <p className="text-gray-600">
                Organize facilmente equipes de louvor, professores da EBD e operadores de som.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg gold-glow">
              <div className="w-16 h-16 bg-worship-purple rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
                  <path d="m13 13 6 6"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-worship-purple mb-3">Interface Intuitiva</h3>
              <p className="text-gray-600">
                Design moderno e fácil de usar, permitindo rápida adaptação por todos os usuários.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg gold-glow">
              <div className="w-16 h-16 bg-worship-gold rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A365D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 18H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8"></path>
                  <polyline points="9 14 4 9 9 4"></polyline>
                  <line x1="20" y1="13" x2="13" y2="20"></line>
                  <line x1="13" y1="13" x2="20" y2="20"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-worship-blue mb-3">Importar/Exportar</h3>
              <p className="text-gray-600">
                Importe dados em massa e exporte relatórios para análise e compartilhamento.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-24" id="planos">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-worship-blue text-center mb-6">
            Escolha o Plano Ideal
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Oferecemos planos flexíveis para atender às necessidades de igrejas de todos os tamanhos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <Card className="border-2 border-gray-200 relative animate-fade-in">
              <CardHeader className="bg-gray-50 border-b pb-8">
                <CardTitle className="text-2xl font-bold text-center text-worship-blue">Basic</CardTitle>
                <div className="text-center mt-4">
                  <span className="text-4xl font-bold">R$29</span>
                  <span className="text-gray-500">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {features.basic.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check size={18} className="text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {notIncluded.basic.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-400">
                      <X size={18} className="text-gray-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4 pb-8 flex justify-center">
                <Button className="w-full bg-worship-blue hover:bg-worship-blue/90">Começar Agora</Button>
              </CardFooter>
            </Card>
            
            {/* Pro Plan */}
            <Card className="border-2 border-worship-purple relative transform scale-105 shadow-xl animate-fade-in">
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 bg-worship-purple text-white text-sm rounded-full font-medium">
                Mais Popular
              </div>
              <CardHeader className="bg-worship-purple/10 border-b pb-8">
                <CardTitle className="text-2xl font-bold text-center text-worship-purple">Pro</CardTitle>
                <div className="text-center mt-4">
                  <span className="text-4xl font-bold">R$49</span>
                  <span className="text-gray-500">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {features.pro.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check size={18} className="text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {notIncluded.pro.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-400">
                      <X size={18} className="text-gray-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4 pb-8 flex justify-center">
                <Button className="w-full bg-worship-purple hover:bg-worship-purple/90">Escolher Pro</Button>
              </CardFooter>
            </Card>
            
            {/* Premium Plan */}
            <Card className="border-2 border-worship-gold relative animate-fade-in">
              <CardHeader className="bg-worship-gold/10 border-b pb-8">
                <CardTitle className="text-2xl font-bold text-center text-worship-blue">Premium Plus</CardTitle>
                <div className="text-center mt-4">
                  <span className="text-4xl font-bold">R$69</span>
                  <span className="text-gray-500">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {features.premium.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check size={18} className="text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4 pb-8 flex justify-center">
                <Button className="w-full bg-worship-gold hover:bg-worship-gold/90 text-worship-blue">Escolher Premium</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="worship-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 max-w-2xl mx-auto">
            Pronto para facilitar a gestão do seu ministério?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de igrejas que já estão usando o Louvor Sampa Gestão para organizar seus ministérios.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-white hover:bg-white/90 text-worship-blue text-lg">
              Experimente Grátis por 7 dias
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent hover:bg-white/10 text-white border-white/60 text-lg">
              <Link to="/auth">Faça Login</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-worship-blue text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Louvor Sampa Gestão</h3>
              <p className="text-white/70">
                Uma solução completa para gestão de ministérios de igreja.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white">Início</a></li>
                <li><a href="#planos" className="text-white/70 hover:text-white">Preços</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Recursos</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Sobre</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white">Centro de Ajuda</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Contato</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Documentação</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white">Termos de Serviço</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Privacidade</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <p>© 2025 Louvor Sampa Gestão. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
