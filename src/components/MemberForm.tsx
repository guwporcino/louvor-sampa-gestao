
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Member, Category } from "../types";

interface MemberFormProps {
  member?: Member;
  categories: Category[];
  onSubmit: (member: Partial<Member>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const MemberForm: React.FC<MemberFormProps> = ({
  member,
  categories,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditing = !!member;
  const [formData, setFormData] = useState<Partial<Member>>(
    member || {
      name: "",
      email: "",
      phone: "",
      categories: [],
      active: true,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData({
      ...formData,
      categories: checked
        ? [...(formData.categories || []), categoryId]
        : (formData.categories || []).filter((id) => id !== categoryId),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Membro" : "Novo Membro"}</CardTitle>
          <CardDescription>
            {isEditing
              ? "Atualize os dados do membro da equipe"
              : "Cadastre um novo membro para a equipe de louvor"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Categorias</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category.id}`}
                    checked={(formData.categories || []).includes(category.id)}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(category.id, Boolean(checked))
                    }
                  />
                  <label
                    htmlFor={`cat-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, active: Boolean(checked) })
              }
            />
            <label
              htmlFor="active"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Membro Ativo
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default MemberForm;
