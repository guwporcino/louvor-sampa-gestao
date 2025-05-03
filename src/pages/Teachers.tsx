
import React from "react";
import { Button } from "@/components/ui/button";

const Teachers = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Professores</h1>
      <p className="text-gray-600 mb-8">Gerenciamento de professores da Escola Bíblica</p>
      
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-xl mb-4">Funcionalidade em desenvolvimento</p>
          <Button>Adicionar Professor</Button>
        </div>
      </div>
    </div>
  );
};

export default Teachers;
