import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getAlerts, createAlert, getEmergencyContacts, getRwandaLocations } from "./routes/alerts";

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

  // Emergency alerts routes
  app.get("/api/alerts", getAlerts);
  app.post("/api/alerts", createAlert);
  app.get("/api/emergency-contacts", getEmergencyContacts);
  app.get("/api/rwanda-locations", getRwandaLocations);

  return app;
}
