import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Tender } from '../types';

interface AnalyticsProps {
  tenders: Tender[];
}

const COLORS = ['#0ea5e9', '#ef4444', '#8b5cf6', '#f59e0b'];

export function Analytics({ tenders }: AnalyticsProps) {
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    tenders.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tenders]);

  const orgData = useMemo(() => {
    const counts: Record<string, number> = {};
    tenders.forEach((t) => {
      counts[t.organizationName] = (counts[t.organizationName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [tenders]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="rounded-[24px] border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-black">Tenders by Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-black">Top 5 Organizations</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={orgData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                fontSize={12}
                tick={{ fill: '#64748b', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="value" fill="var(--primary)" radius={[0, 8, 8, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
