import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, User as UserIcon, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthorizedEmployee {
  id: string;
  employeeId: string;
  role: string;
}

export function AdminView() {
  const [authorizedEmployees, setAuthorizedEmployees] = useState<AuthorizedEmployee[]>([]);
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('user');

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const json = await response.json();
        setAuthorizedEmployees(json.data ?? json);
      } else if (response.status === 401 || response.status === 403) {
        console.warn('Unauthorized/Forbidden access to employees list');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(`Failed to fetch employees: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async () => {
    if (!newEmployeeId) return;
    try {
      const response = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmployeeId, role: newEmployeeRole }),
      });

      if (response.ok) {
        setNewEmployeeId('');
        fetchEmployees();
        toast.success('Employee added successfully!');
      } else {
        toast.error('Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/employees/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchEmployees();
        toast.success('Employee removed.');
      } else {
        toast.error('Failed to remove employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>

      <Card className="bg-card border-none rounded-xl overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            User Management
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage authorized employees and their roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-end bg-background p-6 rounded-2xl border border-border">
            <div className="flex-1 space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Employee ID
              </Label>
              <Input
                value={newEmployeeId}
                onChange={(e) => setNewEmployeeId(e.target.value)}
                placeholder="e.g. EMP005"
                className="bg-card border-border text-foreground"
              />
            </div>
            <div className="w-full md:w-48 space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Role
              </Label>
              <select
                value={newEmployeeRole}
                onChange={(e) => setNewEmployeeRole(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button
              onClick={handleAddEmployee}
              className="rounded-xl px-8 bg-primary text-primary-foreground font-bold h-10 shadow-lg shadow-primary/20"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> Authorized List
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {authorizedEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border shadow-sm group hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        emp.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-blue-500/20 text-blue-500'
                      }`}
                    >
                      {emp.employeeId.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">{emp.employeeId}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {emp.role}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => handleDeleteEmployee(emp.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
