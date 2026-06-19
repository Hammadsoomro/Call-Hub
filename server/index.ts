import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getCallHistory,
  getBoughtNumbers,
  searchNumbers,
  purchaseNumber,
  setTelnyxApi,
  getTelnyxBalance,
  saveWebhookSettings,
} from "./routes/telnyx";
import {
  handleTelnyxWebhook,
  handleIncomingCall,
  handleIncomingCallFailover,
  saveCallRecord,
  getUserCallHistory,
} from "./routes/webhooks";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Telnyx API routes
  app.get("/api/calls", getCallHistory);
  app.get("/api/numbers/bought", getBoughtNumbers);
  app.post("/api/numbers/search", searchNumbers);
  app.post("/api/numbers/purchase", purchaseNumber);
  app.post("/api/telnyx/set-api", setTelnyxApi);
  app.get("/api/telnyx/balance", getTelnyxBalance);
  app.post("/api/settings/webhooks", saveWebhookSettings);

  // Webhook routes
  // Primary incoming call webhook endpoint
  app.post("/api/webhooks/incoming-call", handleIncomingCall);

  // Failover incoming call webhook endpoint
  app.post("/api/webhooks/incoming-call-failover", handleIncomingCallFailover);

  // Legacy endpoint - for all Telnyx events
  app.post("/api/webhooks/telnyx", handleTelnyxWebhook);

  // Save call records from client
  app.post("/api/calls/save", saveCallRecord);

  // Get call history for a user
  app.get("/api/calls/history", getUserCallHistory);

  return app;
}
