import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tender } from '../types';
import { X, Edit2, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReviewTableProps {
  tenders: Tender[];
  onConfirm: (tenders: Tender[]) => void;
  onCancel: () => void;
}

export function ReviewTable({ tenders: initialTenders, onConfirm, onCancel }: ReviewTableProps) {
  const [tenders, setTenders] = useState<Tender[]>(initialTenders);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Tender>>({});

  const handleEdit = (tender: Tender) => {
    setEditingId(tender.id);
    setEditData(tender);
  };

  const handleSave = () => {
    setTenders((prev) =>
      prev.map((t) => (t.id === editingId ? ({ ...t, ...editData } as Tender) : t)),
    );
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setTenders((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Review Extracted Tenders ({tenders.length})</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(tenders)}>Confirm & Save All</Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Org (AR)</TableHead>
              <TableHead>Tender No</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenders.map((tender) => (
              <TableRow key={tender.id}>
                <TableCell>
                  {editingId === tender.id ? (
                    <Input
                      value={editData.organizationNameAr || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, organizationNameAr: e.target.value })
                      }
                    />
                  ) : (
                    tender.organizationNameAr
                  )}
                </TableCell>
                <TableCell>
                  {editingId === tender.id ? (
                    <Input
                      value={editData.tenderNo || ''}
                      onChange={(e) => setEditData({ ...editData, tenderNo: e.target.value })}
                    />
                  ) : (
                    tender.tenderNo
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {editingId === tender.id ? (
                    <Input
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    />
                  ) : (
                    tender.description
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{tender.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {editingId === tender.id ? (
                      <Button size="icon" variant="ghost" onClick={handleSave}>
                        <Save className="h-4 w-4 text-green-500" />
                      </Button>
                    ) : (
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(tender)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(tender.id)}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
