import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building2, Search, ChevronRight, TrendingUp } from 'lucide-react';
import { Tender } from '../types';
import { KNOWN_ORG_MAP } from '../../shared/normalizer';

interface OrganizationsViewProps {
  allTenders: Tender[];
  onSelectOrg: (orgName: string) => void;
}

export function OrganizationsView({ allTenders, onSelectOrg }: OrganizationsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const orgStats = useMemo(() => {
    const stats: Record<string, { count: number; latest: number }> = {};

    allTenders.forEach((t) => {
      const name = t.organizationNameAr || t.organizationName;
      if (!stats[name]) {
        stats[name] = { count: 0, latest: 0 };
      }
      stats[name].count++;
      if (t.createdAt > stats[name].latest) {
        stats[name].latest = t.createdAt;
      }
    });

    return stats;
  }, [allTenders]);

  const filteredOrgs = KNOWN_ORG_MAP.filter(
    (org) =>
      org.canonicalAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.canonicalEn.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Government Organizations</h2>
        <p className="text-muted-foreground">Browse tenders by government entity</p>
      </div>

      <div className="flex gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org, idx) => {
          const stats = orgStats[org.canonicalAr] || { count: 0, latest: 0 };
          return (
            <Card
              key={idx}
              className="bg-card border-none rounded-2xl overflow-hidden group hover:shadow-xl transition-all border border-transparent hover:border-primary/10 cursor-pointer"
              onClick={() => onSelectOrg(org.canonicalAr)}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-primary/20 group-hover:text-primary/40 transition-colors">
                      {stats.count.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Tenders
                    </span>
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-tight">
                  {org.canonicalAr}
                </CardTitle>
                <CardDescription className="font-medium text-xs">{org.canonicalEn}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span>
                      Latest: {stats.latest ? new Date(stats.latest).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
