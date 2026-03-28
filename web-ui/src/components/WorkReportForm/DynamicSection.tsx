import type { ReactNode } from 'react';

interface Props {
  visible: boolean;
  children: ReactNode;
}

export function DynamicSection({ visible, children }: Props) {
  if (!visible) return null;
  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      {children}
    </div>
  );
}
