import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { Eye, EyeOff, Loader2, Mail, ShieldCheck, HelpCircle, LogIn, UserPlus, Check, X, AlertCircle, Database, Trash2 } from 'lucide-react';
import { useI18n } from '../utils/i18n';

interface AuthFormProps {
  onSuccess: (userData: { userId: string; name: string; email: string }) => void;
}

export function AuthForm({ onSuccess, onBack, defaultTab = 'login' }: AuthFormProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showDevTools, setShowDevTools] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { authApi } = await import('../utils/api');
      const response = await authApi.signIn(loginData.email, loginData.password);
      
      if (response.success) {
        toast.success(t('auth.loginSuccess'));
        onSuccess({
          userId: response.user.id,
          name: response.user.name,
          email: response.user.email
        });
      } else {
        // Handle unsuccessful login even if no error was thrown
        toast.error(response.error || t('auth.loginFailed'));
      }
    } catch (error: any) {
      console.error('Login error caught:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error string:', String(error));
      
      // Extract error message from various error formats
      let errorMessage = t('auth.loginFailed');
      
      if (error?.message) {
        errorMessage = error.message;
        console.log('Using error.message:', errorMessage);
      } else if (typeof error === 'string') {
        errorMessage = error;
        console.log('Using error string:', errorMessage);
      }
      
      console.log('Final error message to display:', errorMessage);
      
      // Display user-friendly error messages
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }
    
    if (registerData.password.length < 6) {
      toast.error(t('auth.passwordTooShort'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { authApi } = await import('../utils/api');
      const response = await authApi.signUp(
        registerData.email,
        registerData.password,
        registerData.name
      );
      
      if (response.success) {
        toast.success(t('auth.registrationSuccess'));
        onSuccess({
          userId: response.user.id,
          name: response.user.name,
          email: response.user.email
        }, true); // true indicates this is a new user
      } else {
        // Handle unsuccessful registration even if no error was thrown
        toast.error(response.error || t('auth.registrationFailed'));
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract error message from various error formats
      let errorMessage = t('auth.registrationFailed');
      
      if (error.message) {
        // Check if it's an "email exists" error
        if (error.message.includes('already exists')) {
          errorMessage = error.message;
          // Show a toast with action to switch to login
          toast.error(errorMessage, {
            duration: 5000,
            position: 'top-center',
            action: {
              label: 'Sign In',
              onClick: () => {
                // Switch to login tab
                const loginTab = document.querySelector('[value="login"]') as HTMLButtonElement;
                if (loginTab) loginTab.click();
                // Pre-fill email in login form
                setLoginData({ ...loginData, email: registerData.email });
              }
            }
          });
          return;
        }
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Display user-friendly error messages
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center'
      });
    } finally {
      setIsLoading(false);
    }
  };



  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate password reset email
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${t('auth.resetLinkSent')} ${resetEmail}`);
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      toast.error(t('auth.resetLinkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    };
    return requirements;
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    const requirements = validatePassword(password);
    const score = Object.values(requirements).filter(Boolean).length;
    
    if (score <= 1) return { score: 25, label: t('auth.weak'), color: 'bg-red-500' };
    if (score <= 3) return { score: 60, label: t('auth.medium'), color: 'bg-yellow-500' };
    return { score: 100, label: t('auth.strong'), color: 'bg-green-500' };
  };

  const passwordRequirements = validatePassword(registerData.password);
  const passwordStrength = getPasswordStrength(registerData.password);
  const isPasswordValid = registerData.password.length >= 6;

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      // Simulate sending verification email
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t('auth.verificationSent'));
    } catch (error) {
      toast.error(t('auth.verificationError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanupDatabase = async () => {
    if (!window.confirm('⚠️ WARNING: This will delete ALL user accounts and data!\n\nAre you absolutely sure? This cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const { cleanupDatabase } = await import('../utils/cleanup');
      const result = await cleanupDatabase();
      toast.success(`Database cleaned! Removed ${result.removed.auth} accounts, ${result.removed.users} profiles, ${result.removed.wallets} wallets.`);
      
      // Clear the form
      setLoginData({ email: '', password: '' });
      setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Cleanup error:', error);
      toast.error('Failed to cleanup database: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary text-primary-foreground rounded-full p-3">
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t('auth.welcome')}</CardTitle>
          <CardDescription className="text-base">
            {t('auth.description')}
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary" className="text-xs">
              🔒 Secure Authentication
            </Badge>
            <Badge variant="secondary" className="text-xs">
              🌍 Multi-language
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                {t('auth.login')}
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {t('auth.register')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('auth.email')}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={t('auth.email')}
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.password')}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="px-0 text-sm">
                        {t('auth.forgotPassword')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('auth.resetPassword')}</DialogTitle>
                        <DialogDescription>
                          {t('auth.resetPasswordDesc')}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                          <Label htmlFor="reset-email">{t('auth.emailAddress')}</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder={t('auth.email')}
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={isLoading} className="flex-1">
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('auth.sending')}
                              </>
                            ) : (
                              <>
                                <Mail className="mr-2 h-4 w-4" />
                                {t('auth.sendResetLink')}
                              </>
                            )}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)}>
                            {t('common.cancel')}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.signingIn')}
                    </>
                  ) : (
                    t('auth.signIn')
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">{t('auth.fullName')}</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder={t('auth.fullName')}
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">{t('auth.email')}</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder={t('auth.email')}
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.password')}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {registerData.password && (
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('auth.passwordStrength')}:</span>
                        <span className={`font-medium ${
                          passwordStrength.score === 100 ? 'text-green-600 dark:text-green-500' :
                          passwordStrength.score === 60 ? 'text-yellow-600 dark:text-yellow-500' :
                          'text-red-600 dark:text-red-500'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <Progress value={passwordStrength.score} className="h-2" />
                      
                      <div className="text-xs space-y-1 mt-3">
                        <p className="text-muted-foreground mb-2">{t('auth.passwordRequirements')}</p>
                        <div className="space-y-1.5">
                          <div className={`flex items-center gap-2 ${passwordRequirements.length ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                            {passwordRequirements.length ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            <span>{t('auth.minLength')}</span>
                          </div>
                          <div className={`flex items-center gap-2 ${passwordRequirements.uppercase ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                            {passwordRequirements.uppercase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            <span>{t('auth.hasUppercase')}</span>
                          </div>
                          <div className={`flex items-center gap-2 ${passwordRequirements.lowercase ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                            {passwordRequirements.lowercase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            <span>{t('auth.hasLowercase')}</span>
                          </div>
                          <div className={`flex items-center gap-2 ${passwordRequirements.number ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                            {passwordRequirements.number ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            <span>{t('auth.hasNumber')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">{t('auth.confirmPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="register-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.confirmPassword')}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                      className={registerData.confirmPassword && (
                        registerData.password === registerData.confirmPassword
                          ? 'border-green-500 dark:border-green-500'
                          : 'border-red-500 dark:border-red-500'
                      )}
                    />
                    {registerData.confirmPassword && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {registerData.password === registerData.confirmPassword ? (
                          <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-600 dark:text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                    <p className="text-xs text-red-600 dark:text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {t('auth.passwordMismatch')}
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.creatingAccount')}
                    </>
                  ) : (
                    t('auth.createAccount')
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Developer Tools Toggle */}
          <div className="mt-4 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowDevTools(!showDevTools)}
            >
              <Database className="mr-2 h-3 w-3" />
              {showDevTools ? 'Hide' : 'Show'} Developer Tools
            </Button>

            {showDevTools && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-3">
                <Alert className="border-yellow-300 dark:border-yellow-700">
                  <AlertCircle className="h-4 w-4 !text-yellow-600 dark:!text-yellow-500" />
                  <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> This will delete ALL user accounts and data. Use only for testing.
                  </AlertDescription>
                </Alert>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={handleCleanupDatabase}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-3 w-3" />
                      Reset Database (Delete All Data)
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Use this if you see "email already exists" errors
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}