import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Call } from '@shared/api';
import { ArrowDownLeft, ArrowUpRight, Phone, Delete, Copy, AlertCircle, Loader, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playRingtone, stopRingtone, isRingtonePlaying } from '@/lib/ringtones';

export default function DialPad() {
  const { user, isTelnyxConnected } = useAuth();
  const [dialValue, setDialValue] = useState('');
  const [selectedNumber, setSelectedNumber] = useState('');
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callTimer, setCallTimer] = useState(0);
  const [calls, setCalls] = useState<Call[]>([]);
  const [purchasedNumbers, setPurchasedNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zeroTimeout, setZeroTimeout] = useState<NodeJS.Timeout | null>(null);
  const [ringtonePlayback, setRingtonePlayback] = useState(false);
  const selectedRingtone = user?.selectedRingtone || 'default';
  const [incomingCallNotification, setIncomingCallNotification] = useState(false);
  const previousIncomingCountRef = useRef(0);

  // Fetch call history and bought numbers
  useEffect(() => {
    const fetchData = async () => {
      if (!isTelnyxConnected()) {
        setLoading(false);
        return;
      }

      try {
        setError(null);

        // Fetch call history
        const callsResponse = await fetch('/api/calls', {
          headers: {
            Authorization: `Bearer ${user?.telnyxApiKey}`,
          },
        });

        if (callsResponse.ok) {
          const callsData = await callsResponse.json();
          setCalls(callsData.calls || []);
        }

        // Fetch bought numbers
        const numbersResponse = await fetch('/api/numbers/bought', {
          headers: {
            Authorization: `Bearer ${user?.telnyxApiKey}`,
          },
        });

        if (numbersResponse.ok) {
          const numbersData = await numbersResponse.json();
          setPurchasedNumbers(numbersData.numbers.map((n: any) => n.number) || []);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh incoming calls every 3 seconds to detect new calls
    const refreshInterval = setInterval(fetchData, 3000);

    return () => clearInterval(refreshInterval);
  }, [isTelnyxConnected(), user?.telnyxApiKey]);

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

  // Handle incoming call detection and notification
  useEffect(() => {
    const incomingCalls = calls.filter((c) => c.type === 'incoming');
    const currentIncomingCount = incomingCalls.length;

    // Detect new incoming call
    if (currentIncomingCount > previousIncomingCountRef.current) {
      setIncomingCallNotification(true);
      // Auto-hide notification after 5 seconds
      const timer = setTimeout(() => setIncomingCallNotification(false), 5000);
      return () => clearTimeout(timer);
    }

    previousIncomingCountRef.current = currentIncomingCount;
  }, [calls.filter((c) => c.type === 'incoming').length]);

  // Handle ringtone playback for incoming calls - play when new incoming call detected
  useEffect(() => {
    const incomingCalls = calls.filter((c) => c.type === 'incoming');
    // Only play if there are incoming calls and we're not already playing and no active call
    if (incomingCalls.length > 0 && !activeCall && !ringtonePlayback) {
      // Small delay to ensure user interaction context
      setTimeout(() => {
        setRingtonePlayback(true);
        playRingtone(selectedRingtone).then(() => {
          setRingtonePlayback(false);
        }).catch((e) => {
          console.error('Error playing ringtone:', e);
          setRingtonePlayback(false);
        });
      }, 100);
    }
  }, [calls.length, activeCall, selectedRingtone]);

  const dialPadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  const handleDialPadClick = (digit: string) => {
    if (digit === '0') {
      // Long press logic for 0 button
      if (zeroTimeout) clearTimeout(zeroTimeout);
      const timeout = setTimeout(() => {
        setDialValue((prev) => prev + '+');
        setZeroTimeout(null);
      }, 500); // 500ms long press
      setZeroTimeout(timeout);
    } else {
      setDialValue((prev) => prev + digit);
    }
  };

  const handleZeroMouseUp = () => {
    if (zeroTimeout) {
      clearTimeout(zeroTimeout);
      setDialValue((prev) => prev + '0');
      setZeroTimeout(null);
    }
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
      {/* Incoming Call Notification */}
      {incomingCallNotification && (
        <div className="fixed top-0 left-0 right-0 bg-green-50 border-b border-green-300 p-4 z-50 shadow-md">
          <div className="flex items-center justify-center gap-2 text-green-800">
            <Phone className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">Incoming call received!</span>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Left Side - Contact List */}
        <div className="w-80 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Call History</h2>
          </div>

          {!isTelnyxConnected() ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Connect Telnyx API in Settings to see call history
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="incoming" className="flex-1 flex flex-col">
              <TabsList className="m-3 grid w-auto grid-cols-2 bg-muted">
                <TabsTrigger value="incoming" className="flex-1">
                  Incoming ({incomingCalls.length})
                </TabsTrigger>
                <TabsTrigger value="outgoing" className="flex-1">
                  Outgoing ({outgoingCalls.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="incoming" className="flex-1 overflow-auto mt-0 px-3 py-2 flex flex-col">
                {incomingCalls.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    No incoming calls
                  </div>
                ) : (
                  <>
                    <div className="mb-3 p-2 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-amber-600" />
                      <span className="text-xs text-amber-700 flex-1">Ringtone: {selectedRingtone}</span>
                      <Button
                        onClick={() => {
                          setRingtonePlayback(true);
                          playRingtone(selectedRingtone).then(() => {
                            setRingtonePlayback(false);
                          }).catch((e) => {
                            console.error('Error:', e);
                            setRingtonePlayback(false);
                          });
                        }}
                        disabled={ringtonePlayback}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        {ringtonePlayback ? 'Playing...' : 'Test'}
                      </Button>
                      {ringtonePlayback && (
                        <Button
                          onClick={() => {
                            stopRingtone();
                            setRingtonePlayback(false);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <VolumeX className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2 flex-1 overflow-auto">
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
                  </>
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
          )}
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
                      disabled={!isTelnyxConnected() || purchasedNumbers.length === 0}
                    >
                      <option value="">
                        {purchasedNumbers.length === 0
                          ? 'No numbers available'
                          : 'Select a number'}
                      </option>
                      {purchasedNumbers.map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
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
                          onClick={() => digit !== '0' && handleDialPadClick(digit)}
                          onMouseDown={() => digit === '0' && handleDialPadClick(digit)}
                          onMouseUp={() => digit === '0' && handleZeroMouseUp()}
                          onTouchStart={() => digit === '0' && handleDialPadClick(digit)}
                          onTouchEnd={() => digit === '0' && handleZeroMouseUp()}
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
