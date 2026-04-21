// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    telnyxApiKey?: string;
  };
  token: string;
}

// Call History Types
export interface Call {
  id: string;
  contactName: string;
  phoneNumber: string;
  duration: number; // in seconds
  timestamp: Date;
  type: 'incoming' | 'outgoing';
}

export interface CallHistoryResponse {
  calls: Call[];
  total: number;
}

// Phone Numbers Types
export interface PhoneNumber {
  id: string;
  number: string;
  country: string;
  areaCode: string;
  purchasedDate: Date;
  renewalDate: Date;
}

export interface BoughtNumbersResponse {
  numbers: PhoneNumber[];
  total: number;
}

// Available Numbers Types
export interface AvailableNumber {
  id: string;
  number: string;
  country: string;
  areaCode: string;
  type: 'local' | 'tollfree';
  monthlyPrice: number;
}

export interface SearchNumbersRequest {
  country: string;
  areaCode?: string;
  city?: string;
  type?: 'local' | 'tollfree';
}

export interface SearchNumbersResponse {
  numbers: AvailableNumber[];
  total: number;
}

// Purchase Number Types
export interface PurchaseNumberRequest {
  numberId: string;
  number: string;
}

export interface PurchaseNumberResponse {
  success: boolean;
  number: PhoneNumber;
  message: string;
}

// Telnyx API Types
export interface SetTelnyxApiRequest {
  apiKey: string;
  sipUsername?: string;
  sipPassword?: string;
}

export interface SetTelnyxApiResponse {
  success: boolean;
  message: string;
}
