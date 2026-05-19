import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Plus,
  Trash2,
  Search,
  Mail,
  Phone,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { Company } from '../types';
import { toast } from 'sonner';

export function CompaniesView() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    nameAr: '',
    nameEn: '',
    contactPerson: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    category: '',
    notes: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const json = await response.json();
        setCompanies(json.data ?? json);
      }
    } catch (error) {
      console.error('Failed to fetch companies', error);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.nameAr || !newCompany.email || !newCompany.phone) {
      toast.error('Please fill in the required fields.');
      return;
    }

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompany),
      });

      if (response.ok) {
        toast.success('Company added successfully!');
        setIsAdding(false);
        setNewCompany({
          nameAr: '',
          nameEn: '',
          contactPerson: '',
          email: '',
          phone: '',
          location: '',
          website: '',
          category: '',
          notes: '',
        });
        fetchCompanies();
      }
    } catch (error) {
      console.error('Error adding company:', error);
      toast.error('Failed to add company');
    }
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      const response = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCompanies((prev) => prev.filter((c) => c.id !== id));
        toast.success('Company removed');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Companies Directory</h2>
          <p className="text-muted-foreground">Manage your partner and contractor contacts</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="bg-primary text-white font-bold">
          <Plus className="mr-2 h-4 w-4" /> Add New Company
        </Button>
      </div>

      <div className="flex gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
      </div>

      {isAdding && (
        <Card className="bg-card border-none rounded-xl overflow-hidden shadow-xl border border-primary/20">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-lg font-bold">Add New Company</CardTitle>
            <CardDescription>Enter company details to add them to your directory</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleAddCompany} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Company Name (Arabic)
                </Label>
                <Input
                  value={newCompany.nameAr}
                  onChange={(e) => setNewCompany({ ...newCompany, nameAr: e.target.value })}
                  placeholder="اسم الشركة بالعربي"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Company Name (English)
                </Label>
                <Input
                  value={newCompany.nameEn}
                  onChange={(e) => setNewCompany({ ...newCompany, nameEn: e.target.value })}
                  placeholder="Company Name in English"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Contact Person
                </Label>
                <Input
                  value={newCompany.contactPerson}
                  onChange={(e) => setNewCompany({ ...newCompany, contactPerson: e.target.value })}
                  placeholder="John Doe"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Category
                </Label>
                <Input
                  value={newCompany.category}
                  onChange={(e) => setNewCompany({ ...newCompany, category: e.target.value })}
                  placeholder="e.g. IT Services, Construction"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                  placeholder="contact@company.com"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Phone Number
                </Label>
                <Input
                  value={newCompany.phone}
                  onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                  placeholder="+965 1234 5678"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Location / Address
                </Label>
                <Input
                  value={newCompany.location}
                  onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                  placeholder="Kuwait City, Block 1, St 5"
                  className="bg-background border-border"
                />
              </div>
              <div className="flex gap-2 md:col-span-2 pt-4">
                <Button type="submit" className="bg-primary text-white font-bold px-8">
                  Save Company
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAdding(false)}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card
            key={company.id}
            className="bg-card border-none rounded-2xl overflow-hidden group hover:shadow-xl transition-all border border-transparent hover:border-primary/10"
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Building2 className="h-6 w-6" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-all"
                  onClick={() => handleDeleteCompany(company.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg font-bold text-foreground">{company.nameAr}</CardTitle>
              <CardDescription className="font-medium">{company.nameEn}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 text-primary/60" />
                <span className="font-medium">{company.contactPerson}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary/60" />
                <a
                  href={`mailto:${company.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {company.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary/60" />
                <span>{company.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary/60" />
                <span className="truncate">{company.location}</span>
              </div>
              {company.category && (
                <div className="pt-2">
                  <Badge
                    variant="secondary"
                    className="bg-primary/5 text-primary border-none font-bold text-[10px] uppercase tracking-widest"
                  >
                    {company.category}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filteredCompanies.length === 0 && (
          <div className="col-span-full py-20 text-center bg-card rounded-3xl border-2 border-dashed border-border">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium">
              No companies found in your directory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
