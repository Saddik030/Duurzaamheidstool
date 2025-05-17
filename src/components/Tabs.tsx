import React from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  currentValue: string;
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
}

interface TabsContentProps {
  value: string;
  currentValue: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
  return (
    <div className="w-full">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { currentValue: value, onClick: () => onValueChange(child.props.value) });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, currentValue, children, className, onClick }) => {
  const isActive = value === currentValue;
  
  return (
    <button
      onClick={onClick}
      className={`${className} p-4 rounded-lg transition-all duration-200 hover:bg-indigo-50
        ${isActive ? 'bg-indigo-100 text-indigo-900' : 'bg-white text-gray-600'}`}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ value, currentValue, children }) => {
  if (value !== currentValue) return null;
  
  return (
    <div className="mt-4">
      {children}
    </div>
  );
};