
import React from "react";
import { Button } from "@/components/ui/button";

const Operators = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Operadores</h1>
      <p className="text-gray-600 mb-8">Gerenciamento de operadores de som e mídia</p>
      
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-xl mb-4">Funcionalidade em desenvolvimento</p>
          <Button>Adicionar Operador</Button>
        </div>
      </div>
    </div>
  );
};

export default Operators;
