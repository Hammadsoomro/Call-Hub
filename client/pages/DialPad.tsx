import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownLeft, ArrowUpRight, Phone, Delete, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Call {
  id: string;
  contactName: string;
  phoneNumber: string;
  duration: number; // in seconds
  timestamp: Date;
  type: 'incoming' | 'outgoing';
}

export default function DialPad() {
  const [dialValue, setDialValue] = useState('');
  const [selectedNumber, setSelectedNumber] = useState('');
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callTimer, setCallTimer] = useState(0);
  const [calls, setCalls] = useState<Call[]>([
    {
      id: '1',
      contactName: 'John Doe',
      phoneNumber: '+1 (555) 123-4567',
      duration: 245,
      timestamp: new Date(Date.now() - 3600000),
      type: 'incoming',
    },
    {
      id: '2',
      contactName: 'Jane Smith',
      phoneNumber: '+1 (555) 987-6543',
      duration: 512,
      timestamp: new Date(Date.now() - 7200000),
      type: 'outgoing',
    },
    {
      id: '3',
      contactName: 'Mike Johnson',
      phoneNumber: '+1 (555) 456-7890',
      duration: 125,
      timestamp: new Date(Date.now() - 10800000),
      type: 'incoming',
    },
  ]);

  // Simulate call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCall) {
      interval = setInterval(() => {
        setCallTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  const dialPadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  const handleDialPadClick = (digit: string) => {
    setDialValue((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setDialValue((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (!dialValue.trim()) return;
    
    const newCall: Call = {
      id: Date.now().toString(),
      contactName: 'Unknown',
      phoneNumber: dialValue,
      duration: 0,
      timestamp: new Date(),
      type: 'outgoing',
    };
    
    setActiveCall(newCall);
    setCallTimer(0);
    setDialValue('');
  };

  const handleEndCall = () => {
    if (activeCall) {
      setCalls((prev) => [
        {
          ...activeCall,
          duration: callTimer,
        },
        ...prev,
      ]);
      setActiveCall(null);
      setCallTimer(0);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const incomingCalls = calls.filter((c) => c.type === 'incoming');
  const outgoingCalls = calls.filter((c) => c.type === 'outgoing');

  return (
    <DashboardLayout>
      <div className="flex h-screen">
        {/* Left Side - Contact List */}
        <div className="w-80 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Call History</h2>
          </div>

          <Tabs defaultValue="incoming" className="flex-1 flex flex-col">
            <TabsList className="m-3 grid w-auto grid-cols-2 bg-muted">
              <TabsTrigger value="incoming" className="flex-1">
                Incoming
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="flex-1">
                Outgoing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incoming" className="flex-1 overflow-auto mt-0 px-3 py-2">
              {incomingCalls.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No incoming calls
                </div>
              ) : (
                <div className="space-y-2">
                  {incomingCalls.map((call) => (
                    <div key={call.id} className="p-3 bg-background rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <ArrowDownLeft className="w-4 h-4 text-green-500" />
                            <p className="font-semibold text-foreground">{call.contactName}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{call.phoneNumber}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{formatDuration(call.duration)}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="outgoing" className="flex-1 overflow-auto mt-0 px-3 py-2">
              {outgoingCalls.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No outgoing calls
                </div>
              ) : (
                <div className="space-y-2">
                  {outgoingCalls.map((call) => (
                    <div key={call.id} className="p-3 bg-background rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4 text-blue-500" />
                            <p className="font-semibold text-foreground">{call.contactName}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{call.phoneNumber}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{formatDuration(call.duration)}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - Dialpad */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-background">
          <div className="w-full max-w-sm">
            {/* Active Call Display */}
            {activeCall ? (
              <div className="mb-8 text-center">
                <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 mb-6">
                  <p className="text-sm text-green-600 mb-2">Call in Progress</p>
                  <p className="text-2xl font-bold text-foreground mb-4">{activeCall.phoneNumber}</p>
                  <p className="text-4xl font-mono font-bold text-primary mb-6">{formatDuration(callTimer)}</p>
                  <Button
                    onClick={handleEndCall}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    End Call
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Dial Display */}
                <div className="mb-8 text-center">
                  <div className="bg-white rounded-2xl p-6 border border-border shadow-sm mb-4">
                    <input
                      type="text"
                      value={dialValue}
                      readOnly
                      className="w-full text-4xl font-mono font-bold text-center text-primary bg-transparent focus:outline-none"
                      placeholder="Enter number"
                    />
                  </div>

                  {/* Number Selection */}
                  <div className="mb-6">
                    <label className="text-sm text-muted-foreground block mb-2">Select Number</label>
                    <select
                      value={selectedNumber}
                      onChange={(e) => setSelectedNumber(e.target.value)}
                      className="w-full p-2 border border-border rounded-lg bg-white text-foreground"
                    >
                      <option value="">Your Telnyx Numbers</option>
                      <option value="+1 (555) 000-0001">+1 (555) 000-0001</option>
                      <option value="+1 (555) 000-0002">+1 (555) 000-0002</option>
                    </select>
                  </div>
                </div>

                {/* Dialpad Grid */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {dialPadButtons.map((row, rowIdx) => (
                    <div key={rowIdx} className="contents">
                      {row.map((digit) => (
                        <Button
                          key={digit}
                          onClick={() => handleDialPadClick(digit)}
                          className="h-16 text-xl font-semibold bg-white hover:bg-muted text-foreground border border-border rounded-lg transition-all"
                        >
                          {digit}
                        </Button>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <Button
                    onClick={handleBackspace}
                    variant="outline"
                    className="h-12 rounded-lg"
                  >
                    <Delete className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleCall}
                    disabled={!dialValue.trim()}
                    className="h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg col-span-2 transition-all"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call
                  </Button>
                </div>

                {/* Copy to Clipboard */}
                {dialValue && (
                  <Button
                    variant="outline"
                    className="w-full py-2 rounded-lg"
                    onClick={() => {
                      navigator.clipboard.writeText(dialValue);
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Number
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
