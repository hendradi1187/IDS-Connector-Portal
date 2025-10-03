'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { AnimatedLogo } from "@/components/ui/animated-logo";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
      });
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'kkks' | 'consumer') => {
    setLoading(true);
    try {
      const demoCredentials = {
        admin: { email: 'admin@skkmigas.go.id', password: '123456' },
        kkks: { email: 'kkks@chevron.com', password: '123456' },
        consumer: { email: 'consumer@skkmigas.go.id', password: '123456' }
      };

      const { email: demoEmail, password: demoPassword } = demoCredentials[role];
      await login(demoEmail, demoPassword);

      toast({
        title: "Demo Login Successful",
        description: `Logged in as ${role.toUpperCase()} demo account.`,
      });

      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Demo Login Failed",
        description: "Demo account may not be available. Please try manual login.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-cyan-100 to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md px-4">
        {/* Logo Section - Outside Card for Better Visibility */}
        <div className="mb-8">
          <AnimatedLogo size="xl" className="mb-4" />
          <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
            Secure Data Space Connector Platform
          </p>
        </div>

        <Card className="shadow-2xl border-2 backdrop-blur-sm bg-white dark:bg-background/95">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Portal Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the platform
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
               <div className="relative my-4">
                  <Separator />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-background text-xs text-muted-foreground">
                    OR
                  </div>
                </div>
              <Button variant="outline" className="w-full" type="button" disabled={loading}>
                Sign in with SSO
              </Button>

              {/* Demo Accounts */}
              <div className="grid gap-2">
                <p className="text-sm font-medium text-center">Quick Demo Access:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => handleDemoLogin('admin')}
                    disabled={loading}
                  >
                    Admin
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => handleDemoLogin('kkks')}
                    disabled={loading}
                  >
                    KKKS
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => handleDemoLogin('consumer')}
                    disabled={loading}
                  >
                    Consumer
                  </Button>
                </div>
              </div>
            </CardContent>
          </form>
        </Card>
        <div className="mt-6 space-y-2">
          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="h-3 w-3" />
            Your session is secure and encrypted
          </p>
          <p className="text-center text-xs text-muted-foreground/60">
            © 2025 RapIDSK - International Data Spaces Connector
          </p>
        </div>
      </div>
    </div>
  );
}
