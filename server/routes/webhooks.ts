import { RequestHandler } from 'express';
import { connectDB, createCall, updateUser, getUserById } from '../db';

// Handle Telnyx webhook events for call-related events (incoming calls)
export const handleIncomingCall: RequestHandler = async (req, res) => {
  try {
    const event = req.body;

    // Log the event for debugging
    console.log('Telnyx Incoming Call Event:', event.data?.event_type);

    if (!event.data?.event_type) {
      return res.status(400).json({ error: 'Invalid webhook event' });
    }

    await connectDB();

    // Handle incoming call related events
    switch (event.data.event_type) {
      case 'call.initiated':
        await handleCallInitiated(event.data);
        break;
      case 'call.answered':
        await handleCallAnswered(event.data);
        break;
      case 'call.hangup':
        await handleCallHangup(event.data);
        break;
      default:
        console.log('Unhandled event type:', event.data.event_type);
    }

    // Always return 200 to acknowledge receipt
    res.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent Telnyx from retrying
    res.json({ success: true, error: error.message });
  }
};

// Handle Telnyx webhook events - failover endpoint
export const handleIncomingCallFailover: RequestHandler = async (req, res) => {
  try {
    const event = req.body;

    console.log('Telnyx Failover Webhook Event:', event.data?.event_type);

    if (!event.data?.event_type) {
      return res.status(400).json({ error: 'Invalid webhook event' });
    }

    await connectDB();

    // Handle the same events as primary endpoint
    switch (event.data.event_type) {
      case 'call.initiated':
        await handleCallInitiated(event.data);
        break;
      case 'call.answered':
        await handleCallAnswered(event.data);
        break;
      case 'call.hangup':
        await handleCallHangup(event.data);
        break;
      default:
        console.log('Unhandled failover event type:', event.data.event_type);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Failover webhook error:', error);
    res.json({ success: true, error: error.message });
  }
};

// Legacy - handle all Telnyx webhook events
export const handleTelnyxWebhook: RequestHandler = async (req, res) => {
  try {
    const event = req.body;

    // Log the event for debugging
    console.log('Telnyx Webhook Event:', event.data?.event_type);

    if (!event.data?.event_type) {
      return res.status(400).json({ error: 'Invalid webhook event' });
    }

    await connectDB();

    // Handle different event types
    switch (event.data.event_type) {
      case 'call.bridged':
        await handleCallBridged(event.data);
        break;
      case 'call.hangup':
        await handleCallHangup(event.data);
        break;
      case 'call.answered':
        await handleCallAnswered(event.data);
        break;
      case 'call.initiated':
        await handleCallInitiated(event.data);
        break;
      default:
        console.log('Unhandled event type:', event.data.event_type);
    }

    // Always return 200 to acknowledge receipt
    res.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent Telnyx from retrying
    res.json({ success: true, error: error.message });
  }
};

async function handleCallInitiated(data: any) {
  try {
    // Placeholder for call.initiated event
    console.log('Call initiated:', data.call_session_id);
  } catch (error) {
    console.error('Error handling call initiated:', error);
  }
}

async function handleCallAnswered(data: any) {
  try {
    // Placeholder for call.answered event
    console.log('Call answered:', data.call_session_id);
  } catch (error) {
    console.error('Error handling call answered:', error);
  }
}

async function handleCallBridged(data: any) {
  try {
    // Placeholder for call.bridged event - calls are now connected
    console.log('Call bridged:', data.call_session_id);
  } catch (error) {
    console.error('Error handling call bridged:', error);
  }
}

async function handleCallHangup(data: any) {
  try {
    const callData = data.payload;
    
    if (!callData) {
      console.log('No payload in hangup event');
      return;
    }

    // Extract call details from Telnyx webhook payload
    const fromNumber = callData.from?.phone_number || callData.from;
    const toNumber = callData.to?.phone_number || callData.to;
    const duration = callData.duration || 0;
    const callDirection = callData.direction || (callData.answered ? 'incoming' : 'outgoing');
    const startTime = callData.start_time ? new Date(callData.start_time) : new Date();

    // Note: Telnyx webhooks don't include userId directly
    // You'll need to identify the user from the phone number or via request header
    // For now, we'll log this and the frontend should send the userId when initiating calls

    console.log('Call hangup recorded:', {
      from: fromNumber,
      to: toNumber,
      duration: duration,
      direction: callDirection,
      startTime: startTime,
    });

    // The call will be saved when the client sends the call data
    // Or we can enhance this to look up the user by their phone number
  } catch (error) {
    console.error('Error handling call hangup:', error);
  }
}

// Save call record from client - called after call ends
export const saveCallRecord: RequestHandler = async (req, res) => {
  try {
    const { userId, from, to, duration, type, timestamp } = req.body;

    if (!userId || !from || !to || duration === undefined || !type) {
      return res.status(400).json({
        error: 'Missing required fields: userId, from, to, duration, type',
      });
    }

    await connectDB();

    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Save the call record
    const call = await createCall({
      userId,
      contactName: type === 'incoming' ? from : to,
      phoneNumber: type === 'incoming' ? from : to,
      from,
      to,
      duration,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      type,
      selectedNumber: type === 'outgoing' ? from : undefined,
      status: 'completed',
    });

    res.json({
      success: true,
      call,
      message: 'Call record saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving call record:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get call history for a user
export const getUserCallHistory: RequestHandler = async (req, res) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await connectDB();

    const { getCallsByUserId } = await import('../db');
    const calls = await getCallsByUserId(userId);

    res.json({
      success: true,
      calls,
      total: calls.length,
    });
  } catch (error: any) {
    console.error('Error fetching call history:', error);
    res.status(500).json({ error: error.message });
  }
};
