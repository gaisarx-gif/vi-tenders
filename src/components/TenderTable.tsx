import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tender, SortConfig } from '../types';
import { ArrowUpDown, Download, Search, FilterX, Building2, Inbox, RotateCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { translations, Language } from '../lib/translations';
import { SkeletonLoader } from './SkeletonLoader';

interface TenderTableProps {
  tenders: Tender[];
  language: Language;
  onSelectTender?: (tender: Tender) => void;
  loading?: boolean;
  onRefresh?: () => void;
  page?: number;
  hasMore?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

export function TenderTable({ tenders, language, onSelectTender, loading, onRefresh, page, hasMore, onNextPage, onPrevPage }: TenderTableProps) {
  const t = translations[language];
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [searchField, setSearchField] = useState<'organizationName' | 'tenderNo' | 'description'>(
    'organizationName',
  );
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSort = (key: keyof Tender) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedTenders = useMemo(() => {
    let result = [...tenders];

    // Filtering
    if (searchValue) {
      result = result.filter((t) =>
        (t[searchField] || '').toLowerCase().includes(searchValue.toLowerCase()),
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [tenders, sortConfig, searchField, searchValue, statusFilter]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredAndSortedTenders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tenders');
    XLSX.writeFile(wb, `tenders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const resetFilters = () => {
    setSearchValue('');
    setStatusFilter('all');
    setSortConfig(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end bg-muted/30 p-4 rounded-lg border border-border">
        <div className="space-y-2 w-[180px]">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t.searchBy}
          </label>
          <Select
            value={searchField}
            onValueChange={(value) => setSearchField(value as 'organizationName' | 'tenderNo' | 'description')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="organizationName">{t.entity}</SelectItem>
              <SelectItem value="tenderNo">{t.tenderNo}</SelectItem>
              <SelectItem value="description">{t.description}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t.searchPlaceholder}
          </label>
          <div className="relative">
            <Search
              className={`absolute ${language === 'ar' ? 'right-2.5' : 'left-2.5'} top-2.5 h-4 w-4 text-muted-foreground`}
            />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={language === 'ar' ? 'pr-9' : 'pl-9'}
            />
          </div>
        </div>

        <div className="space-y-2 w-[180px]">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t.status}
          </label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? 'all')}>
            <SelectTrigger>
              <SelectValue placeholder={t.allStatuses} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allStatuses}</SelectItem>
              <SelectItem value="New Tender">{t.newTender}</SelectItem>
              <SelectItem value="Postponed">{t.postponed}</SelectItem>
              <SelectItem value="Re-announcement">{t.reAnnouncement}</SelectItem>
              <SelectItem value="Advance Notice">{t.advanceNotice}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={resetFilters} className="h-10">
            <FilterX className={`mr-2 h-4 w-4 ${language === 'ar' ? 'ml-2 mr-0' : ''}`} />
            {t.reset}
          </Button>
          <Button
            onClick={exportToExcel}
            className="h-10 bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className={`mr-2 h-4 w-4 ${language === 'ar' ? 'ml-2 mr-0' : ''}`} />
            {t.exportExcel}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead
                className={`w-[250px] py-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}
              >
                <Button
                  variant="ghost"
                  onClick={() => handleSort('organizationName')}
                  className={`hover:bg-transparent p-0 font-black text-[10px] uppercase tracking-widest text-muted-foreground w-full ${language === 'ar' ? 'justify-end' : 'justify-start'}`}
                >
                  {t.entity}
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[150px] font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                {t.tenderNo}
              </TableHead>
              <TableHead
                className={`min-w-[350px] font-black text-[10px] uppercase tracking-widest text-muted-foreground ${language === 'ar' ? 'text-right' : 'text-left'}`}
              >
                {t.description}
              </TableHead>
              <TableHead className="w-[120px] font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                {t.pubDate}
              </TableHead>
              <TableHead className="w-[120px] font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                {t.closingDate}
              </TableHead>
              <TableHead className="w-[150px] font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                {t.status}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonLoader rows={5} cols={6} />
            ) : filteredAndSortedTenders.length > 0 ? (
              filteredAndSortedTenders.map((tender, index) => (
                <TableRow
                  key={`${tender.id}-${index}`}
                  className="hover:bg-accent/50 transition-colors cursor-pointer group border-border"
                  onClick={() => onSelectTender?.(tender)}
                >
                  <TableCell
                    className={`py-4 font-bold text-foreground ${language === 'ar' ? 'text-right' : 'text-left'}`}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span className="truncate">
                        {language === 'ar'
                          ? tender.organizationNameAr || tender.organizationName
                          : tender.organizationNameEn || tender.organizationName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-muted-foreground">
                    {tender.tenderNo || 'N/C'}
                  </TableCell>
                  <TableCell className="max-w-[400px]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <div
                      className="line-clamp-2 text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors"
                      title={tender.description}
                    >
                      {tender.description}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs font-bold text-muted-foreground">
                    {tender.publishingDate || 'N/C'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs font-bold text-muted-foreground">
                    {tender.closingDate || 'N/C'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`
                      px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-none
                      ${
                        tender.statusEn === 'New Tender' || tender.status === 'New Tender'
                          ? 'bg-blue-500/20 text-blue-500'
                          : tender.statusEn === 'Postponed' || tender.status === 'Postponed'
                            ? 'bg-amber-500/20 text-amber-500'
                            : tender.statusEn === 'Re-announcement' ||
                                tender.status === 'Re-announcement'
                              ? 'bg-purple-500/20 text-purple-500'
                              : tender.statusEn === 'Advance Notice' ||
                                  tender.status === 'Advance Notice'
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : 'bg-muted text-muted-foreground'
                      }
                    `}
                    >
                      {language === 'ar'
                        ? tender.statusAr || tender.status
                        : tender.statusEn || tender.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Inbox className="h-12 w-12 text-muted-foreground/40" />
                    <p className="text-sm font-medium">{t.noTenders}</p>
                    {onRefresh && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        className="gap-2"
                      >
                        <RotateCw className="h-4 w-4" />
                        {t.refresh}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(onNextPage || onPrevPage) && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            disabled={!page || page <= 1}
            onClick={onPrevPage}
          >
            {t.previousPage}
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            {t.pageX.replace('{page}', String(page ?? 1))}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore}
            onClick={onNextPage}
          >
            {t.nextPage}
          </Button>
        </div>
      )}
    </div>
  );
}
