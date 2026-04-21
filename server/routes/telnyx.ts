import { RequestHandler } from 'express';
import {
  CallHistoryResponse,
  BoughtNumbersResponse,
  SearchNumbersResponse,
  PurchaseNumberResponse,
  SearchNumbersRequest,
  PurchaseNumberRequest,
  SetTelnyxApiResponse,
} from '@shared/api';

// Helper to get Telnyx API key from request headers
function getTelnyxApiKey(req: any): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  return parts.length === 2 ? parts[1] : null;
}

// Helper to make Telnyx API calls
async function telnyxFetch(
  endpoint: string,
  apiKey: string,
  options: RequestInit = {}
) {
  const url = `https://api.telnyx.com/v2${endpoint}`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Telnyx API error: ${response.statusText}`);
  }

  return response.json();
}

// Get call history
export const getCallHistory: RequestHandler = async (req, res) => {
  try {
    const apiKey = getTelnyxApiKey(req);
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing Telnyx API key' });
    }

    // Fetch call logs from Telnyx
    const data = await telnyxFetch('/call_control/calls', apiKey, {
      method: 'GET',
    });

    const calls = (data.data || []).map((call: any) => ({
      id: call.id,
      contactName: call.to || call.from || 'Unknown',
      phoneNumber: call.to || call.from || '',
      duration: call.duration || 0,
      timestamp: new Date(call.created_at || Date.now()),
      type: call.direction || 'incoming',
    }));

    res.json({
      calls,
      total: calls.length,
    } as CallHistoryResponse);
  } catch (error: any) {
    console.error('Error fetching call history:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get bought numbers
export const getBoughtNumbers: RequestHandler = async (req, res) => {
  try {
    const apiKey = getTelnyxApiKey(req);
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing Telnyx API key' });
    }

    // Fetch phone numbers from Telnyx
    const data = await telnyxFetch('/phone_numbers', apiKey, {
      method: 'GET',
    });

    const numbers = (data.data || []).map((num: any) => ({
      id: num.id,
      number: num.phone_number,
      country: num.country_code || 'US',
      areaCode: num.phone_number?.split('-')[0] || '',
      purchasedDate: new Date(num.created_at || Date.now()),
      renewalDate: new Date(
        new Date(num.created_at || Date.now()).getTime() + 365 * 24 * 60 * 60 * 1000
      ),
    }));

    res.json({
      numbers,
      total: numbers.length,
    } as BoughtNumbersResponse);
  } catch (error: any) {
    console.error('Error fetching bought numbers:', error);
    res.status(500).json({ error: error.message });
  }
};

// Search available numbers
export const searchNumbers: RequestHandler = async (req, res) => {
  try {
    const apiKey = getTelnyxApiKey(req);
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing Telnyx API key' });
    }

    const { country = 'US', areaCode, city, type } = req.body as SearchNumbersRequest;

    let query = `?country_code=${country}`;
    if (areaCode) query += `&area_code=${areaCode}`;
    if (city) query += `&city=${city}`;
    if (type === 'tollfree') query += `&number_type=toll-free`;

    // Search for available numbers
    const data = await telnyxFetch(`/available_phone_numbers${query}`, apiKey, {
      method: 'GET',
    });

    const numbers = (data.data || []).slice(0, 10).map((num: any) => ({
      id: num.phone_number,
      number: num.phone_number,
      country: country,
      areaCode: num.phone_number?.split('-')[0] || '',
      type: num.number_type === 'toll-free' ? 'tollfree' : 'local',
      monthlyPrice: type === 'tollfree' ? 9.99 : 3.99,
    }));

    res.json({
      numbers,
      total: numbers.length,
    } as SearchNumbersResponse);
  } catch (error: any) {
    console.error('Error searching numbers:', error);
    res.status(500).json({ error: error.message });
  }
};

// Purchase a number
export const purchaseNumber: RequestHandler = async (req, res) => {
  try {
    const apiKey = getTelnyxApiKey(req);
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing Telnyx API key' });
    }

    const { numberId, number } = req.body as PurchaseNumberRequest;

    // Purchase the number through Telnyx
    const data = await telnyxFetch('/phone_numbers', apiKey, {
      method: 'POST',
      body: JSON.stringify({
        phone_number: number,
      }),
    });

    const purchased = data.data;
    const phoneNumber = {
      id: purchased.id,
      number: purchased.phone_number,
      country: purchased.country_code || 'US',
      areaCode: purchased.phone_number?.split('-')[0] || '',
      purchasedDate: new Date(purchased.created_at || Date.now()),
      renewalDate: new Date(
        new Date(purchased.created_at || Date.now()).getTime() + 365 * 24 * 60 * 60 * 1000
      ),
    };

    res.json({
      success: true,
      number: phoneNumber,
      message: 'Number purchased successfully',
    } as PurchaseNumberResponse);
  } catch (error: any) {
    console.error('Error purchasing number:', error);
    res.status(500).json({ error: error.message });
  }
};

// Store Telnyx API key for user
export const setTelnyxApi: RequestHandler = async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Validate the API key by making a test request
    try {
      await telnyxFetch('/phone_numbers?page[size]=1', apiKey, {
        method: 'GET',
      });
    } catch {
      return res.status(401).json({ error: 'Invalid Telnyx API key' });
    }

    // In production, store this securely in the database associated with the user
    res.json({
      success: true,
      message: 'Telnyx API key has been set',
    } as SetTelnyxApiResponse);
  } catch (error: any) {
    console.error('Error setting Telnyx API:', error);
    res.status(500).json({ error: error.message });
  }
};
