import { ReactNode } from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

interface SessionTimeoutWrapperProps {
  children: ReactNode;
}

export const SessionTimeoutWrapper = ({ children }: SessionTimeoutWrapperProps) => {
  useSessionTimeout();
  return <>{children}</>;
};