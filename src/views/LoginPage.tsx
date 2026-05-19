import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Building2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const GoogleSvg = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onLogin();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Sign in failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Vision Tenders</h1>
          <p className="text-muted-foreground font-medium">
            Sign in with your Google account to continue
          </p>
        </div>

        <Card className="rounded-[32px] border-border shadow-2xl shadow-slate-200/50 overflow-hidden bg-card">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="pt-8 px-8">
            <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground">
              Sign In
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground">
              Authorized personnel only. All access attempts are logged.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <GoogleSvg />
              )}
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-muted-foreground text-xs font-medium">
          &copy; 2026 Vision International Group. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
