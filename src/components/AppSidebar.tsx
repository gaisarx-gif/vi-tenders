import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  LogOut,
  Globe,
  FileText,
  FileSpreadsheet,
  BarChart3,
  Calendar,
  Shield,
  Building2,
  Briefcase,
} from 'lucide-react';
import { translations, Language } from '../lib/translations';
import { Logo } from './Logo';

interface AppSidebarProps {
  onLogout: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;
}

export function AppSidebar({
  onLogout,
  language,
  onLanguageChange,
  setActiveTab,
  activeTab,
}: AppSidebarProps) {
  const t = translations[language];

  return (
    <Sidebar
      side={language === 'ar' ? 'right' : 'left'}
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="p-6 flex flex-row items-center justify-between">
        <Logo className="h-8 text-sidebar-foreground" />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab('overview')}
                  className={activeTab === 'overview' ? 'bg-primary/10 text-primary' : ''}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{t.dashboard}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {t.entities}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab('organizations')}
                  className={activeTab === 'organizations' ? 'bg-primary/10 text-primary' : ''}
                >
                  <Building2 className="h-4 w-4" />
                  <span>{t.organizations}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab('companies')}
                  className={activeTab === 'companies' ? 'bg-primary/10 text-primary' : ''}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>{t.companiesDirectory}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {t.dataManagement}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab('analysis')}
                  className={activeTab === 'analysis' ? 'bg-primary/10 text-primary' : ''}
                >
                  <FileText className="h-4 w-4" />
                  <span>{t.documentsCenter}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab('import')}
                  className={activeTab === 'import' ? 'bg-primary/10 text-primary' : ''}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{t.excelImport}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {t.tracking}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab('analytics')}
                  className={activeTab === 'analytics' ? 'bg-primary/10 text-primary' : ''}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>{t.analyticsReports}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab('calendar')}
                  className={activeTab === 'calendar' ? 'bg-primary/10 text-primary' : ''}
                >
                  <Calendar className="h-4 w-4" />
                  <span>{t.deadlinesCalendar}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {t.admin}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab('admin')}
                  className={activeTab === 'admin' ? 'bg-primary/10 text-primary' : ''}
                >
                  <Shield className="h-4 w-4" />
                  <span>{t.adminPanel}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}>
              <Globe className="h-4 w-4" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>{t.logout}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
