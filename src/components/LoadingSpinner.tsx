
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
};

export default LoadingSpinner;
