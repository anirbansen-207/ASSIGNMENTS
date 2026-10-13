
import { io } from "socket.io-client";

// Use the same backend URL as the Axios instance.
const socket = io(
  import.meta.env.VITE_API_URL ||
    "http://localhost:5000",
  {
    withCredentials: true,
    autoConnect: false,
  },
);

export default socket;
