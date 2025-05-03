
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useDepartment } from '../contexts/DepartmentContext';
import { Department } from '../types';
import { Music, BookOpen, Headphones } from 'lucide-react';

const DepartmentSelector = () => {
  const { departments, currentDepartment, setCurrentDepartment, hasAccess } = useDepartment();

  const handleDepartmentChange = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    if (department) {
      setCurrentDepartment(department);
    }
  };

  const getDepartmentIcon = (departmentName: string) => {
    switch (departmentName.toLowerCase()) {
      case 'louvor':
        return <Music className="h-4 w-4 mr-2 text-worship-gold" />;
      case 'escola bíblica':
        return <BookOpen className="h-4 w-4 mr-2 text-worship-blue" />;
      case 'sonoplastia':
        return <Headphones className="h-4 w-4 mr-2 text-worship-purple" />;
      default:
        return <Music className="h-4 w-4 mr-2 text-worship-gold" />;
    }
  };

  // Filter out departments the user doesn't have access to
  const accessibleDepartments = departments.filter(dept => hasAccess(dept.id));

  if (accessibleDepartments.length <= 1) return null;

  return (
    <div className="px-4 py-2 mb-4">
      <Select
        value={currentDepartment?.id}
        onValueChange={handleDepartmentChange}
      >
        <SelectTrigger className="w-full bg-sidebar-accent/30 text-white">
          <SelectValue>
            {currentDepartment ? (
              <div className="flex items-center">
                {getDepartmentIcon(currentDepartment.name)}
                {currentDepartment.name}
              </div>
            ) : (
              "Selecione um departamento"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accessibleDepartments.map((dept: Department) => (
            <SelectItem key={dept.id} value={dept.id}>
              <div className="flex items-center">
                {getDepartmentIcon(dept.name)}
                {dept.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DepartmentSelector;
