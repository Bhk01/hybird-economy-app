import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { useI18n } from '../utils/i18n';
import { useUser } from '../App';
import { 
  CreditCard, 
  Plus, 
  Trash2,
  Star,
  Coins,
  TrendingUp,
  Shield,
  CheckCircle
} from 'lucide-react';
import { PageType } from '../App';

interface WalletSimpleProps {
  onNavigate: (page: PageType) => void;
}

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'other';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
  isDefault: boolean;
}

export function WalletSimple({ onNavigate }: WalletSimpleProps) {
  const { t } = useI18n();
  const { user, wallet } = useUser();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: ''
  });

  const handleAddCard = () => {
    // Basic validation
    if (!newCard.cardNumber || !newCard.expiryMonth || !newCard.expiryYear || !newCard.cvv || !newCard.holderName) {
      toast.error('Please fill in all fields');
      return;
    }

    // Detect card type
    const firstDigit = newCard.cardNumber[0];
    let cardType: 'visa' | 'mastercard' | 'other' = 'other';
    if (firstDigit === '4') cardType = 'visa';
    else if (firstDigit === '5') cardType = 'mastercard';

    const card: PaymentMethod = {
      id: Date.now().toString(),
      type: cardType,
      last4: newCard.cardNumber.slice(-4),
      expiryMonth: newCard.expiryMonth,
      expiryYear: newCard.expiryYear,
      holderName: newCard.holderName,
      isDefault: paymentMethods.length === 0 // First card is default
    };

    setPaymentMethods([...paymentMethods, card]);
    setNewCard({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      holderName: ''
    });
    setIsAddingCard(false);
    toast.success('Card added successfully');
  };

  const handleRemoveCard = (cardId: string) => {
    setPaymentMethods(paymentMethods.filter(card => card.id !== cardId));
    toast.success('Card removed successfully');
  };

  const handleSetDefault = (cardId: string) => {
    setPaymentMethods(paymentMethods.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })));
    toast.success('Default card updated');
  };

  const getCardIcon = (type: string) => {
    return <CreditCard className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="wallet" onNavigate={onNavigate} userName={user?.name || ''} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">My Wallet</h1>
          <p className="text-muted-foreground">Manage your payment methods and balances</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Balance Cards */}
          <div className="lg:col-span-3 grid gap-4 md:grid-cols-3">
            {/* Credits */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Credits</CardTitle>
                  <div className="bg-green-100 dark:bg-green-950 p-2 rounded-lg">
                    <Coins className="h-4 w-4 text-green-600 dark:text-green-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl">{wallet?.credits || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  For skill swaps
                </p>
              </CardContent>
            </Card>

            {/* Equity */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Equity</CardTitle>
                  <div className="bg-purple-100 dark:bg-purple-950 p-2 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl">{wallet?.equity || 0} TND</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From investments
                </p>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Payment Methods</CardTitle>
                  <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded-lg">
                    <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl">{paymentMethods.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Saved cards
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Saved Payment Methods</CardTitle>
                  <CardDescription>Add and manage your credit cards</CardDescription>
                </div>
                <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Card</DialogTitle>
                      <DialogDescription>Your card information is secure and encrypted</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="holderName">Cardholder Name</Label>
                        <Input
                          id="holderName"
                          placeholder="John Doe"
                          value={newCard.holderName}
                          onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          maxLength={16}
                          value={newCard.cardNumber}
                          onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value.replace(/\s/g, '') })}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="month">Month</Label>
                          <Input
                            id="month"
                            placeholder="MM"
                            maxLength={2}
                            value={newCard.expiryMonth}
                            onChange={(e) => setNewCard({ ...newCard, expiryMonth: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="year">Year</Label>
                          <Input
                            id="year"
                            placeholder="YY"
                            maxLength={2}
                            value={newCard.expiryYear}
                            onChange={(e) => setNewCard({ ...newCard, expiryYear: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            maxLength={3}
                            value={newCard.cvv}
                            onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddCard} className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Add Card
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg mb-2">No payment methods yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add a credit card to start making payments
                  </p>
                  <Button onClick={() => setIsAddingCard(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Card
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((card) => (
                    <Card key={card.id} className="relative">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-muted p-3 rounded-lg">
                              {getCardIcon(card.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="capitalize">{card.type}</span>
                                <span className="text-muted-foreground">•••• {card.last4}</span>
                                {card.isDefault && (
                                  <Badge variant="secondary" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {card.holderName} • Expires {card.expiryMonth}/{card.expiryYear}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!card.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefault(card.id)}
                              >
                                Set as Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCard(card.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Bank-level encryption</p>
                    <p className="text-xs text-muted-foreground">
                      All data is encrypted with 256-bit SSL
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">PCI DSS Compliant</p>
                    <p className="text-xs text-muted-foreground">
                      We meet all security standards
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">CVV never stored</p>
                    <p className="text-xs text-muted-foreground">
                      Your CVV is never saved on our servers
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
