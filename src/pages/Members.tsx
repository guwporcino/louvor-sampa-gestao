
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockMembers, mockCategories } from "../data/mockData";
import MembersList from "../components/MembersList";
import MemberForm from "../components/MemberForm";
import { Member } from "../types";

const Members = () => {
  const [members, setMembers] = useState(mockMembers);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCreateNew = () => {
    setEditingMember(undefined);
    setShowForm(true);
  };
  
  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setShowForm(true);
  };
  
  const handleCancel = () => {
    setShowForm(false);
    setEditingMember(undefined);
  };
  
  const handleSubmit = (formData: Partial<Member>) => {
    setIsSubmitting(true);
    
    // Simulação de delay de API
    setTimeout(() => {
      if (editingMember) {
        // Edição
        setMembers(members.map(member => 
          member.id === editingMember.id ? { ...member, ...formData } as Member : member
        ));
      } else {
        // Criação
        const newMember: Member = {
          id: String(Date.now()),
          name: formData.name || "",
          email: formData.email || "",
          phone: formData.phone || "",
          categories: formData.categories || [],
          active: formData.active ?? true,
          createdAt: new Date()
        };
        setMembers([...members, newMember]);
      }
      
      setIsSubmitting(false);
      setShowForm(false);
      setEditingMember(undefined);
    }, 500);
  };
  
  return (
    <div className="animate-fade-in">
      {showForm ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              {editingMember ? "Editar Membro" : "Novo Membro"}
            </h1>
          </div>
          <MemberForm 
            member={editingMember}
            categories={mockCategories}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Membros</h1>
              <p className="text-gray-600">Gerenciamento de membros da equipe</p>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-1" /> Novo Membro
            </Button>
          </div>
          
          <MembersList 
            members={members} 
            categories={mockCategories} 
            onEdit={handleEdit} 
          />
        </div>
      )}
    </div>
  );
};

export default Members;
