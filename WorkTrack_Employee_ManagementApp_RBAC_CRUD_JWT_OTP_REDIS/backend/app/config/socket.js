import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin:
        process.env.FRONTEND_URL ||
        "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(
      `Socket connected: ${socket.id}`,
    );

    socket.on(
      "join-user-room",
      (userId) => {
        socket.join(userId.toString());

        console.log(
          `User ${userId} joined notification room`,
        );
      },
    );

    socket.on("disconnect", () => {
      console.log(
        `Socket disconnected: ${socket.id}`,
      );
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized",
    );
  }

  return io;
};