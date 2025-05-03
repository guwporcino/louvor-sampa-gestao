
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Member, Category } from "../types";
import { FileText } from "lucide-react";

interface MembersListProps {
  members: Member[];
  categories: Category[];
  onEdit: (member: Member) => void;
}

const MembersList: React.FC<MembersListProps> = ({ members, categories, onEdit }) => {
  const getMemberCategories = (member: Member) => {
    return member.categories.map((catId) => {
      const category = categories.find((cat) => cat.id === catId);
      return category ? category.name : "";
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Categorias</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                Nenhum membro encontrado
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {getMemberCategories(member).map((cat, index) => (
                      <Badge key={index} variant="secondary">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={member.active ? "success" : "destructive"}>
                    {member.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(member)}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MembersList;
