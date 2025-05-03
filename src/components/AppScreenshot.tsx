
import React from "react";
import { Card } from "@/components/ui/card";

interface AppScreenshotProps {
  src: string;
  alt: string;
  caption?: string;
}

const AppScreenshot: React.FC<AppScreenshotProps> = ({ src, alt, caption }) => {
  return (
    <Card className="overflow-hidden shadow-lg border-0">
      <div className="relative">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-auto rounded-t-lg"
        />
        {caption && (
          <div className="p-3 bg-gray-100 text-gray-700 text-sm text-center">
            {caption}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AppScreenshot;
