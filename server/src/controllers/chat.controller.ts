import { Request, Response } from "express";
import chatService from "../services/chat.service";

class ChatController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { message, history } = req.body;
      const ownerId = (req.headers["x-owner-id"] as string) || "global";

      if (!message) {
        return res.status(400).json({ status: "fault", message: "Message is required." });
      }

      const response = await chatService.handleMessage(message, history || [], ownerId);
      
      return res.status(200).json({
        status: "success",
        data: response,
      });
    } catch (error: any) {
      console.error("[CHAT CONTROLLER FAULT]:", error);
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }
}

export default new ChatController();
