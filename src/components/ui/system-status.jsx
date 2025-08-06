import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const SystemStatus = ({ 
  isLoading = false,
  error = null,
  className = "",
  showDetails = false 
}) => {
  if (isLoading) {
    return (
      <Badge variant="secondary" className={`animate-pulse ${className}`}>
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        جاري التحميل...
      </Badge>
    );
  }

  if (error) {
    return (
      <Badge variant="destructive" className={className}>
        <XCircle className="w-3 h-3 mr-1" />
        خطأ في النظام
        {showDetails && <span className="text-xs mr-1">({error})</span>}
      </Badge>
    );
  }

  return (
    <Badge variant="success" className={className}>
      <CheckCircle className="w-3 h-3 mr-1" />
      النظام جاهز
    </Badge>
  );
};

export default SystemStatus;