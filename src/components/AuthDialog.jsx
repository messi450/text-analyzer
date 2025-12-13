import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { authService } from '@/lib/auth';

export default function AuthDialog({ onAuthChange, trigger }) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState('login');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    
    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Clear error when inputs change
    useEffect(() => {
        setError('');
    }, [email, password, name, confirmPassword, tab]);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
        setShowPassword(false);
        setError('');
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validation
        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (!password) {
            setError('Please enter your password');
            return;
        }

        setIsLoading(true);

        try {
            const user = await authService.login(email.trim(), password);
            toast.success(`Welcome back, ${user.name}!`, {
                icon: <Sparkles className="w-4 h-4 text-indigo-500" />
            });
            onAuthChange?.(user);
            setOpen(false);
            resetForm();
        } catch (error) {
            setError(error.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validation
        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (!password) {
            setError('Please enter a password');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const user = await authService.register(email.trim(), password, name.trim() || undefined);
            toast.success(`Account created! Welcome, ${user.name}!`, {
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            });
            onAuthChange?.(user);
            setOpen(false);
            resetForm();
        } catch (error) {
            setError(error.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Demo login for quick testing
    const handleDemoLogin = async () => {
        setIsLoading(true);
        try {
            // Create demo user if doesn't exist
            const demoEmail = 'demo@textalyzer.app';
            const demoPassword = 'demo123';
            
            try {
                // Try to login first
                const user = await authService.login(demoEmail, demoPassword);
                toast.success(`Welcome to the demo, ${user.name}!`);
                onAuthChange?.(user);
                setOpen(false);
                resetForm();
            } catch {
                // If login fails, register the demo user
                const user = await authService.register(demoEmail, demoPassword, 'Demo User');
                toast.success(`Demo account created! Welcome, ${user.name}!`);
                onAuthChange?.(user);
                setOpen(false);
                resetForm();
            }
        } catch (error) {
            setError('Demo login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 px-3 border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 font-medium gap-1.5"
                    >
                        <LogIn className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Sign In</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-center justify-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl">Textalyzer</span>
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Sign in to save your analyses and access all features
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={tab} onValueChange={setTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="login" className="rounded-lg">
                            <LogIn className="w-4 h-4 mr-2" />
                            Sign In
                        </TabsTrigger>
                        <TabsTrigger value="register" className="rounded-lg">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Create Account
                        </TabsTrigger>
                    </TabsList>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        autoComplete="email"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Sign In
                                    </>
                                )}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-slate-500">Or</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleDemoLogin}
                                disabled={isLoading}
                            >
                                <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                                Try Demo Account
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="register">
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="register-name">Name (optional)</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="register-name"
                                        type="text"
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-10"
                                        autoComplete="name"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        autoComplete="email"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="register-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="At least 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        autoComplete="new-password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {password && password.length < 6 && (
                                    <p className="text-xs text-amber-600">Password must be at least 6 characters</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-confirm">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="register-confirm"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        autoComplete="new-password"
                                        disabled={isLoading}
                                    />
                                    {confirmPassword && password === confirmPassword && (
                                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Create Account
                                    </>
                                )}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>

                {/* Benefits */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 text-center mb-3">With an account you can:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-600">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Save analyses
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Access history
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            AI features
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Sync settings
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
