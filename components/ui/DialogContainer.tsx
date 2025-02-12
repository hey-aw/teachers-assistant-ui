import { ReactNode } from 'react';

interface DialogContainerProps {
    children: ReactNode;
}

export const DialogContainer = ({ children }: DialogContainerProps) => (
    <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gray-50">
        {children}
    </div>
); 