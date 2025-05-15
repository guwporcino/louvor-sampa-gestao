
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, ArrowDown, ArrowUp, Box, Edit, Plus, Search, Shirt } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Tipo para os itens de estoque
interface InventoryItem {
  id: string;
  category: string;
  name: string;
  currentQuantity: number;
  minimumQuantity: number;
  lastUpdated: Date;
}

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showItemForm, setShowItemForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  
  // Estado para o formulário
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    category: 'clothing',
    minimumQuantity: 5
  });

  // Dados simulados de estoque
  const initialItems: InventoryItem[] = [
    { 
      id: "1", 
      category: 'clothing', 
      name: 'Camisetas adulto', 
      currentQuantity: 25, 
      minimumQuantity: 10,
      lastUpdated: new Date(2025, 4, 12)
    },
    { 
      id: "2", 
      category: 'clothing', 
      name: 'Calças', 
      currentQuantity: 15, 
      minimumQuantity: 8,
      lastUpdated: new Date(2025, 4, 10)
    },
    { 
      id: "3", 
      category: 'clothing', 
      name: 'Meias', 
      currentQuantity: 40, 
      minimumQuantity: 20,
      lastUpdated: new Date(2025, 4, 11)
    },
    { 
      id: "4", 
      category: 'food', 
      name: 'Arroz 5kg', 
      currentQuantity: 12, 
      minimumQuantity: 15,
      lastUpdated: new Date(2025, 4, 14)
    },
    { 
      id: "5", 
      category: 'food', 
      name: 'Feijão 1kg', 
      currentQuantity: 8, 
      minimumQuantity: 10,
      lastUpdated: new Date(2025, 4, 13)
    },
    { 
      id: "6", 
      category: 'other', 
      name: 'Cobertores', 
      currentQuantity: 7, 
      minimumQuantity: 5,
      lastUpdated: new Date(2025, 4, 15)
    },
  ];

  const [items, setItems] = useState<InventoryItem[]>(initialItems);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddOrUpdateItem = () => {
    // Validação básica
    if (!newItem.name || !newItem.currentQuantity) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (formMode === 'add') {
      const item: InventoryItem = {
        id: Date.now().toString(),
        category: newItem.category as string,
        name: newItem.name as string,
        currentQuantity: newItem.currentQuantity as number,
        minimumQuantity: newItem.minimumQuantity as number,
        lastUpdated: new Date()
      };
      
      setItems([...items, item]);
    } else {
      // Atualizar item existente
      setItems(items.map(item => 
        item.id === newItem.id 
          ? {...item, ...newItem, lastUpdated: new Date()}
          : item
      ));
    }
    
    // Resetar formulário
    setShowItemForm(false);
    setNewItem({
      category: 'clothing',
      minimumQuantity: 5
    });
  };

  const handleEditItem = (item: InventoryItem) => {
    setNewItem({...item});
    setFormMode('edit');
    setShowItemForm(true);
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? {...item, currentQuantity: Math.max(0, item.currentQuantity + change), lastUpdated: new Date()}
        : item
    ));
  };

  const lowStockItems = items.filter(item => item.currentQuantity < item.minimumQuantity);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clothing':
        return <Shirt className="h-4 w-4 text-blue-500" />;
      case 'food':
        return <Box className="h-4 w-4 text-green-500" />;
      default:
        return <Box className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {lowStockItems.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Existem {lowStockItems.length} itens com estoque abaixo do mínimo recomendado.
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão de Estoque</CardTitle>
              <CardDescription>
                Controle de todos os itens em estoque para doação
              </CardDescription>
            </div>
            <Dialog open={showItemForm} onOpenChange={setShowItemForm}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setFormMode('add');
                  setNewItem({
                    category: 'clothing',
                    minimumQuantity: 5
                  });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {formMode === 'add' ? 'Adicionar Novo Item' : 'Editar Item'}
                  </DialogTitle>
                  <DialogDescription>
                    {formMode === 'add' 
                      ? 'Preencha os detalhes do novo item para o estoque.'
                      : 'Atualize as informações do item.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="category">Categoria</label>
                    <Select 
                      value={newItem.category} 
                      onValueChange={(value) => setNewItem({...newItem, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clothing">Vestuário</SelectItem>
                        <SelectItem value="food">Alimentos</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="name">Nome do Item</label>
                    <Input 
                      id="name" 
                      value={newItem.name || ''} 
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Ex: Camisetas masculinas"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="currentQuantity">Quantidade Atual</label>
                    <Input 
                      id="currentQuantity" 
                      type="number"
                      value={newItem.currentQuantity || ''} 
                      onChange={(e) => setNewItem({...newItem, currentQuantity: parseInt(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="minimumQuantity">Quantidade Mínima</label>
                    <Input 
                      id="minimumQuantity" 
                      type="number"
                      value={newItem.minimumQuantity || ''} 
                      onChange={(e) => setNewItem({...newItem, minimumQuantity: parseInt(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowItemForm(false)}>Cancelar</Button>
                  <Button onClick={handleAddOrUpdateItem}>
                    {formMode === 'add' ? 'Adicionar' : 'Atualizar'}
                  </Button>
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
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
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
                  <TableHead className="w-[50px]">Categoria</TableHead>
                  <TableHead>Nome do Item</TableHead>
                  <TableHead className="w-[100px] text-center">Quantidade</TableHead>
                  <TableHead className="w-[100px] text-center">Mínimo</TableHead>
                  <TableHead className="w-[130px]">Última Atualização</TableHead>
                  <TableHead className="w-[120px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center">
                        {getCategoryIcon(item.category)}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className={`text-center ${item.currentQuantity < item.minimumQuantity ? 'text-red-500 font-medium' : ''}`}>
                        {item.currentQuantity}
                      </TableCell>
                      <TableCell className="text-center">{item.minimumQuantity}</TableCell>
                      <TableCell>{item.lastUpdated.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.id, -1)}>
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.id, 1)}>
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Nenhum item encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredItems.length} de {items.length} itens
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Exportar</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InventoryManagement;
