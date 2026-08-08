"use client";

import { useEffect } from "react";
import axios from "axios";

/**
 * Technical Keep-Alive System
 * This component pings the backend server every 10 minutes to prevent 
 * Render's free tier from spinning down due to inactivity.
 */
export default function KeepAlive() {
  useEffect(() => {
    const PING_INTERVAL = 2 * 60 * 1000; // 2 minutes

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    // Derived health endpoint (one level up from /api)
    const HEALTH_URL = API_URL.replace(/\/api\/?$/, "/health");

    const pingServer = async () => {
      try {
        console.log("[Keep-Alive] Pinging backend to maintain warm state...");
        const response = await axios.get(HEALTH_URL);
        console.log("[Keep-Alive] Server response:", response.data.status);
      } catch (error) {
        console.warn("[Keep-Alive] Ping failed, server might be cold or unreachable.");
      }
    };

    // Immediate ping on mount
    pingServer();

    // Set up recurring interval
    const interval = setInterval(pingServer, PING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return null; // Side-effect only component
}
