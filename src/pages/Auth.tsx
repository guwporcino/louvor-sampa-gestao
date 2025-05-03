
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao sistema de gestão de equipe de louvor!",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome para continuar.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        toast({
          title: "Erro ao cadastrar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cadastro realizado com sucesso",
          description: "Verifique seu e-mail para confirmar seu cadastro.",
        });
        setActiveTab("login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="flex items-center space-x-2 mb-4">
            <div className="rounded-full bg-primary p-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-white"
              >
                <path d="M14.5 2C16 2 16 3.1 16 3.5v17c0 .4 0 1.5-1.5 1.5"></path>
                <path d="M4 10c-1.4 0-2 .8-2 2s.6 2 2 2"></path>
                <path d="M4 18c-1.4 0-2 .8-2 2s.6 2 2 2"></path>
                <path d="M16 10c1.4 0 2 .8 2 2s-.6 2-2 2"></path>
                <path d="M16 5.5C16 7 15 8 14 8H8c-.5 0-1-.2-1.4-.6"></path>
                <path d="M12 2c1.5 0 2 .5 2 2-.5 0-2 0-2 0s-1.5 0-2 0c0-1.5.5-2 2-2Z"></path>
                <path d="M22 19c0 .5-.5 1-1 1"></path>
                <path d="M5 11v6"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Louvor Sampa</CardTitle>
              <CardDescription>Gestão de Equipe de Louvor</CardDescription>
            </div>
          </div>
          
          <Separator className="my-2" />
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>

            <div className="px-6">
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Senha</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Cadastrar
                  </Button>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex-col space-y-4 p-6">
          <div className="text-center text-sm text-muted-foreground">
            <span>
              Ao continuar, você concorda com os{" "}
              <span className="underline cursor-pointer">Termos de Serviço</span>
              {" "}e{" "}
              <span className="underline cursor-pointer">Política de Privacidade</span>.
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
