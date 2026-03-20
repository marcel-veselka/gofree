'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CreateDialogProps {
  trigger: React.ReactNode;
  title: string;
  children: (props: { close: () => void }) => React.ReactNode;
}

export function CreateDialog({ trigger, title, children }: CreateDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children({ close: () => setOpen(false) })}
      </DialogContent>
    </Dialog>
  );
}
