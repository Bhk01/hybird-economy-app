import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { 
  Wallet as WalletIcon,
  DollarSign,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Send,
  Download,
  CreditCard,
  Smartphone,
  Building2,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  BarChart3,
  Loader2,
  Trash2,
  Star
} from 'lucide-react';
import { PageType, useUser } from '../App';
import { walletApi, Transaction } from '../utils/api';
import { toast } from 'sonner';
import { useI18n } from '../utils/i18n';

interface PaymentMethod {
  id: number;
  name: string;
  type: 'mobile' | 'card' | 'bank';
  number: string;
  isDefault: boolean;
  verified: boolean;
  expiryDate?: string;
  cardholderName?: string;
}

interface WalletProps {
  onNavigate: (page: PageType) => void;
}

export function WalletEnhanced({ onNavigate }: WalletProps) {
  const { t } = useI18n();
  const handleLogout = () => {
    onNavigate('landing');
  };
  const { user, wallet, refreshWallet } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payments'>('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addFundsDialogOpen, setAddFundsDialogOpen] = useState(false);
  const [addCardDialogOpen, setAddCardDialogOpen] = useState(false);
  const [removeCardDialog, setRemoveCardDialog] = useState<number | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 1,
      name: 'D17 Mobile',
      type: 'mobile',
      number: '**** 1234',
      isDefault: true,
      verified: true
    },
    {
      id: 2,
      name: 'Flouci Wallet',
      type: 'mobile',
      number: '**** 5678',
      isDefault: false,
      verified: true
    },
    {
      id: 3,
      name: 'BIAT Credit Card',
      type: 'card',
      number: '**** **** **** 9012',
      isDefault: false,
      verified: true,
      expiryDate: '12/26',
      cardholderName: 'John Doe'
    }
  ]);

  // New card form state
  const [newCard, setNewCard] = useState({
    type: 'card' as 'mobile' | 'card' | 'bank',
    name: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    mobileNumber: '',
    bankAccount: ''
  });

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await walletApi.getTransactions(user.id);
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!user || !addAmount) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(addAmount);
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      await walletApi.updateBalance(user.id, 'money', amount, 'add');
      await refreshWallet();
      await loadTransactions();
      setAddFundsDialogOpen(false);
      setAddAmount('');
      setSelectedPaymentMethod('');
      toast.success(t('wallet.topUpSuccess') + ` ${amount} TND`);
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error(t('wallet.topUpFailed'));
    }
  };

  const handleAddCard = () => {
    if (newCard.type === 'card') {
      if (!newCard.cardNumber || !newCard.expiryDate || !newCard.cvv || !newCard.cardholderName) {
        toast.error('Please fill in all card details');
        return;
      }
    } else if (newCard.type === 'mobile') {
      if (!newCard.name || !newCard.mobileNumber) {
        toast.error('Please fill in all mobile payment details');
        return;
      }
    } else if (newCard.type === 'bank') {
      if (!newCard.name || !newCard.bankAccount) {
        toast.error('Please fill in all bank details');
        return;
      }
    }

    const newPaymentMethod: PaymentMethod = {
      id: paymentMethods.length + 1,
      name: newCard.name || `Card ending in ${newCard.cardNumber.slice(-4)}`,
      type: newCard.type,
      number: newCard.type === 'card' 
        ? `**** **** **** ${newCard.cardNumber.slice(-4)}`
        : newCard.type === 'mobile'
        ? `**** ${newCard.mobileNumber.slice(-4)}`
        : `****${newCard.bankAccount.slice(-4)}`,
      isDefault: paymentMethods.length === 0,
      verified: true,
      expiryDate: newCard.expiryDate || undefined,
      cardholderName: newCard.cardholderName || undefined
    };

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setAddCardDialogOpen(false);
    setNewCard({
      type: 'card',
      name: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      mobileNumber: '',
      bankAccount: ''
    });
    toast.success(t('wallet.cardAdded'));
  };

  const handleRemoveCard = (id: number) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method?.isDefault && paymentMethods.length > 1) {
      toast.error('Please set another card as default before removing this one');
      return;
    }
    setPaymentMethods(paymentMethods.filter(m => m.id !== id));
    setRemoveCardDialog(null);
    toast.success(t('wallet.cardRemoved'));
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods(paymentMethods.map(m => ({
      ...m,
      isDefault: m.id === id
    })));
    toast.success('Default payment method updated');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const walletBalances = {
    cash: wallet?.money || 0,
    credits: wallet?.credits || 0,
    equity: wallet?.equity || 0,
    total: (wallet?.money || 0) + (wallet?.equity || 0)
  };

  // Transform backend transactions to display format
  const recentTransactions = transactions.map(tx => ({
    id: tx.id,
    type: tx.operation === 'add' ? 'received' : 'sent',
    description: tx.description || `${tx.operation === 'add' ? 'Added' : 'Spent'} ${tx.type}`,
    amount: Math.abs(tx.amount),
    currency: tx.type === 'money' ? 'TND' : tx.type === 'credits' ? 'Credits' : 'Equity',
    date: new Date(tx.timestamp).toLocaleDateString(),
    time: new Date(tx.timestamp).toLocaleTimeString(),
    status: 'completed',
    category: tx.type
  }));

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'received':
      case 'credit':
      case 'equity':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'failed': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'money': return 'bg-green-500/10 text-green-500';
      case 'credits': return 'bg-blue-500/10 text-blue-500';
      case 'equity': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-5 w-5" />;
      case 'card': return <CreditCard className="h-5 w-5" />;
      case 'bank': return <Building2 className="h-5 w-5" />;
      default: return <WalletIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="wallet" onNavigate={onNavigate} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-2">{t('wallet.title')}</h1>
            <p className="text-muted-foreground">
              Manage your earnings, investments, and payments
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={addFundsDialogOpen} onOpenChange={setAddFundsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Money
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Money to Wallet</DialogTitle>
                  <DialogDescription>
                    Choose your preferred payment method and amount
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (TND)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="Enter amount"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id.toString()}>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(method.type)}
                              <span>{method.name} ({method.number})</span>
                              {method.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-blue-600">Secure Payment</p>
                        <p className="text-xs text-muted-foreground">
                          All payments are encrypted and secured with bank-level security
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddFundsDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleAddFunds}>
                    Add Money
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Money
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Money</DialogTitle>
                  <DialogDescription>
                    Send money to another user or withdraw to your account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">Recipient</Label>
                    <Input id="recipient" placeholder="Username or email" />
                  </div>
                  <div>
                    <Label htmlFor="send-amount">Amount (TND)</Label>
                    <Input id="send-amount" type="number" placeholder="Enter amount" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Input id="message" placeholder="Add a note..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">{t('common.cancel')}</Button>
                  <Button>Send Money</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg">Total Balance</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="gap-2"
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="text-3xl mb-4">
                {showBalance ? `${walletBalances.total.toFixed(2)} TND` : '••••••'}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cash</p>
                  <p className="text-lg text-green-600">
                    {showBalance ? `${walletBalances.cash.toFixed(2)}` : '••••'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Credits</p>
                  <p className="text-lg text-blue-600">
                    {showBalance ? walletBalances.credits : '••'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Equity</p>
                  <p className="text-lg text-purple-600">
                    {showBalance ? `${walletBalances.equity.toFixed(2)}` : '••••'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">This Month</span>
              </div>
              <p className="text-xl text-green-500">+435 TND</p>
              <p className="text-xs text-muted-foreground">Earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Investments</span>
              </div>
              <p className="text-xl text-blue-500">+92 TND</p>
              <p className="text-xs text-muted-foreground">Returns</p>
            </CardContent>
          </Card>
        </div>

  <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as any)}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3"
                    onClick={() => setAddFundsDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Money to Wallet
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Send className="h-4 w-4" />
                    Send Money
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Download className="h-4 w-4" />
                    Withdraw to Bank
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <RefreshCw className="h-4 w-4" />
                    Exchange Credits
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTransactions.slice(0, 4).map((transaction) => (
                      <div key={transaction.id} className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.date} • {transaction.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm ${
                            transaction.type === 'received' || transaction.type === 'credit' || transaction.type === 'equity'
                              ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'received' || transaction.type === 'credit' || transaction.type === 'equity' ? '+' : '-'}
                            {transaction.amount} {transaction.currency}
                          </p>
                          <Badge className={getStatusColor(transaction.status)} variant="secondary">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => setActiveTab('transactions')}>
                    View All Transactions
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Wallet Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Wallet Breakdown</CardTitle>
                <CardDescription>
                  How your balance is distributed across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <h4>Cash Balance</h4>
                    </div>
                    <p className="text-2xl text-green-600">{walletBalances.cash.toFixed(2)} TND</p>
                    <p className="text-sm text-muted-foreground">
                      Available for immediate use and withdrawals
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-blue-500" />
                      <h4>Skill Credits</h4>
                    </div>
                    <p className="text-2xl text-blue-600">{walletBalances.credits} Credits</p>
                    <p className="text-sm text-muted-foreground">
                      Earned through skill swaps • ≈ {(walletBalances.credits * 25).toFixed(0)} TND value
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      <h4>Investment Equity</h4>
                    </div>
                    <p className="text-2xl text-purple-600">{walletBalances.equity.toFixed(2)} TND</p>
                    <p className="text-sm text-muted-foreground">
                      Current value of your active investments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('wallet.transactionHistory')}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Filter</Button>
                    <Button variant="outline" size="sm">Export</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t('wallet.noTransactions')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <Badge className={getCategoryColor(transaction.category)} variant="secondary">
                            {transaction.category}
                          </Badge>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-sm">{transaction.description}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{transaction.date} at {transaction.time}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-sm ${
                            transaction.type === 'received' || transaction.type === 'credit' || transaction.type === 'equity'
                              ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'received' || transaction.type === 'credit' || transaction.type === 'equity' ? '+' : '-'}
                            {transaction.amount} {transaction.currency}
                          </p>
                          <Badge className={getStatusColor(transaction.status)} variant="secondary">
                            {transaction.status}
                          </Badge>
                        </div>
                        
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment Methods</CardTitle>
                  <Dialog open={addCardDialogOpen} onOpenChange={setAddCardDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t('wallet.addCard')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                          Add a new payment method for deposits and withdrawals
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Payment Type</Label>
                          <Select value={newCard.type} onValueChange={(value: any) => setNewCard({ ...newCard, type: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="card">Credit/Debit Card</SelectItem>
                              <SelectItem value="mobile">Mobile Payment</SelectItem>
                              <SelectItem value="bank">Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {newCard.type === 'card' && (
                          <>
                            <div>
                              <Label htmlFor="card-name">Card Name</Label>
                              <Input
                                id="card-name"
                                placeholder="My VISA Card"
                                value={newCard.name}
                                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="card-number">{t('wallet.cardNumber')}</Label>
                              <Input
                                id="card-number"
                                placeholder="1234 5678 9012 3456"
                                value={formatCardNumber(newCard.cardNumber)}
                                onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value.replace(/\s/g, '') })}
                                maxLength={19}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="expiry">{t('wallet.expiryDate')}</Label>
                                <Input
                                  id="expiry"
                                  placeholder="MM/YY"
                                  value={formatExpiryDate(newCard.expiryDate)}
                                  onChange={(e) => setNewCard({ ...newCard, expiryDate: e.target.value.replace('/', '') })}
                                  maxLength={5}
                                />
                              </div>
                              <div>
                                <Label htmlFor="cvv">{t('wallet.cvv')}</Label>
                                <Input
                                  id="cvv"
                                  placeholder="123"
                                  type="password"
                                  value={newCard.cvv}
                                  onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                                  maxLength={4}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="cardholder">{t('wallet.cardholderName')}</Label>
                              <Input
                                id="cardholder"
                                placeholder="JOHN DOE"
                                value={newCard.cardholderName}
                                onChange={(e) => setNewCard({ ...newCard, cardholderName: e.target.value.toUpperCase() })}
                              />
                            </div>
                          </>
                        )}

                        {newCard.type === 'mobile' && (
                          <>
                            <div>
                              <Label htmlFor="mobile-name">Service Name</Label>
                              <Input
                                id="mobile-name"
                                placeholder="D17, Flouci, etc."
                                value={newCard.name}
                                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="mobile-number">Mobile Number</Label>
                              <Input
                                id="mobile-number"
                                placeholder="+216 XX XXX XXX"
                                value={newCard.mobileNumber}
                                onChange={(e) => setNewCard({ ...newCard, mobileNumber: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        {newCard.type === 'bank' && (
                          <>
                            <div>
                              <Label htmlFor="bank-name">Bank Name</Label>
                              <Input
                                id="bank-name"
                                placeholder="BIAT, BNA, etc."
                                value={newCard.name}
                                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="account-number">Account Number</Label>
                              <Input
                                id="account-number"
                                placeholder="Account number"
                                value={newCard.bankAccount}
                                onChange={(e) => setNewCard({ ...newCard, bankAccount: e.target.value })}
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAddCardDialogOpen(false)}>
                          {t('common.cancel')}
                        </Button>
                        <Button onClick={handleAddCard}>
                          Add Payment Method
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>
                  Manage your payment methods for deposits and withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getPaymentMethodIcon(method.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm">{method.name}</h4>
                            {method.isDefault && (
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{method.number}</p>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                          {method.verified ? (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!method.isDefault && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetDefault(method.id)}
                          >
                            {t('wallet.setDefault')}
                          </Button>
                        )}
                        {!method.isDefault && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setRemoveCardDialog(method.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="text-sm">Secure Payments</h4>
                    <p className="text-xs text-muted-foreground">
                      All payment methods are encrypted and secured with bank-level security.
                      We never store your complete payment information. PCI-DSS compliant.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Remove Card Confirmation Dialog */}
      <AlertDialog open={removeCardDialog !== null} onOpenChange={() => setRemoveCardDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => removeCardDialog && handleRemoveCard(removeCardDialog)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
