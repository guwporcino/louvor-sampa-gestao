
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Search, Shirt, Gift, Box } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Tipos para as doações
interface Donation {
  id: string;
  type: 'clothing' | 'food' | 'other';
  description: string;
  quantity: number;
  date: Date;
  donor: string;
  status: 'received' | 'processed' | 'distributed';
}

const DonationsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [filterType, setFilterType] = useState("all");
  
  // Estado para o formulário de nova doação
  const [newDonation, setNewDonation] = useState<Partial<Donation>>({
    type: 'clothing',
    date: new Date(),
    status: 'received'
  });

  // Dados simulados de doações
  const initialDonations: Donation[] = [
    { 
      id: "1", 
      type: 'clothing', 
      description: 'Camisetas adulto', 
      quantity: 15, 
      date: new Date(2025, 4, 12), 
      donor: 'João Silva', 
      status: 'received' 
    },
    { 
      id: "2", 
      type: 'food', 
      description: 'Arroz 5kg', 
      quantity: 8, 
      date: new Date(2025, 4, 14), 
      donor: 'Maria Oliveira', 
      status: 'processed' 
    },
    { 
      id: "3", 
      type: 'clothing', 
      description: 'Casacos infantis', 
      quantity: 5, 
      date: new Date(2025, 4, 10), 
      donor: 'Carlos Santos', 
      status: 'distributed' 
    },
    { 
      id: "4", 
      type: 'food', 
      description: 'Feijão 1kg', 
      quantity: 12, 
      date: new Date(2025, 4, 13), 
      donor: 'Ana Pereira', 
      status: 'received' 
    },
    { 
      id: "5", 
      type: 'other', 
      description: 'Cobertores', 
      quantity: 7, 
      date: new Date(2025, 4, 11), 
      donor: 'Roberto Alves', 
      status: 'processed' 
    },
  ];

  const [donations, setDonations] = useState<Donation[]>(initialDonations);

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         donation.donor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || donation.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleAddDonation = () => {
    // Validação simples
    if (!newDonation.description || !newDonation.quantity || !newDonation.donor) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const donation: Donation = {
      id: Date.now().toString(),
      type: newDonation.type as 'clothing' | 'food' | 'other',
      description: newDonation.description || '',
      quantity: newDonation.quantity || 0,
      date: newDonation.date || new Date(),
      donor: newDonation.donor || '',
      status: newDonation.status as 'received' | 'processed' | 'distributed',
    };

    setDonations([donation, ...donations]);
    setShowDonationForm(false);
    setNewDonation({
      type: 'clothing',
      date: new Date(),
      status: 'received'
    });
  };

  const getDonationTypeIcon = (type: string) => {
    switch (type) {
      case 'clothing':
        return <Shirt className="h-4 w-4 text-blue-500" />;
      case 'food':
        return <Gift className="h-4 w-4 text-green-500" />;
      default:
        return <Box className="h-4 w-4 text-purple-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return "bg-yellow-100 text-yellow-800";
      case 'processed':
        return "bg-blue-100 text-blue-800";
      case 'distributed':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão de Doações</CardTitle>
              <CardDescription>
                Registro e acompanhamento de todas as doações recebidas
              </CardDescription>
            </div>
            <Dialog open={showDonationForm} onOpenChange={setShowDonationForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Doação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Doação</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes da doação recebida.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="type">Tipo de Doação</label>
                    <Select 
                      value={newDonation.type} 
                      onValueChange={(value) => setNewDonation({...newDonation, type: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clothing">Vestuário</SelectItem>
                        <SelectItem value="food">Alimentos</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="description">Descrição</label>
                    <Input 
                      id="description" 
                      value={newDonation.description || ''} 
                      onChange={(e) => setNewDonation({...newDonation, description: e.target.value})}
                      placeholder="Ex: Camisetas masculinas"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="quantity">Quantidade</label>
                    <Input 
                      id="quantity" 
                      type="number"
                      value={newDonation.quantity || ''} 
                      onChange={(e) => setNewDonation({...newDonation, quantity: parseInt(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label>Data de Recebimento</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newDonation.date ? (
                            format(newDonation.date, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newDonation.date}
                          onSelect={(date) => setNewDonation({...newDonation, date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="donor">Doador</label>
                    <Input 
                      id="donor" 
                      value={newDonation.donor || ''} 
                      onChange={(e) => setNewDonation({...newDonation, donor: e.target.value})}
                      placeholder="Nome do doador"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="status">Status</label>
                    <Select 
                      value={newDonation.status} 
                      onValueChange={(value) => setNewDonation({...newDonation, status: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="received">Recebido</SelectItem>
                        <SelectItem value="processed">Processado</SelectItem>
                        <SelectItem value="distributed">Distribuído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDonationForm(false)}>Cancelar</Button>
                  <Button onClick={handleAddDonation}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar doações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="clothing">Vestuário</SelectItem>
                <SelectItem value="food">Alimentos</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[100px] text-center">Quantidade</TableHead>
                  <TableHead className="w-[120px]">Data</TableHead>
                  <TableHead className="w-[150px]">Doador</TableHead>
                  <TableHead className="w-[120px] text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="text-center">
                        {getDonationTypeIcon(donation.type)}
                      </TableCell>
                      <TableCell className="font-medium">{donation.description}</TableCell>
                      <TableCell className="text-center">{donation.quantity}</TableCell>
                      <TableCell>{format(donation.date, "dd/MM/yyyy")}</TableCell>
                      <TableCell>{donation.donor}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(donation.status)}`}>
                          {donation.status === 'received' && 'Recebido'}
                          {donation.status === 'processed' && 'Processado'}
                          {donation.status === 'distributed' && 'Distribuído'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Nenhuma doação encontrada com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredDonations.length} de {donations.length} doações
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Exportar</Button>
            <Button variant="outline" size="sm">Imprimir</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DonationsList;
