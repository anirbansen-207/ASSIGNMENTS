import {
  createRoot,
} from "react-dom/client";

import "./index.css";

import App from "./App.jsx";

import {
  AuthProvider,
} from "./context/AuthContext.jsx";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import NotificationSocket from "./components/NotificationSocket.jsx";

/*
 * Create one React Query client for the
 * entire frontend application.
 */
const queryClient =
  new QueryClient();

createRoot(
  document.getElementById("root"),
).render(
  <QueryClientProvider
    client={queryClient}
  >
    <AuthProvider>
      <NotificationSocket />

      <App />
    </AuthProvider>
  </QueryClientProvider>,
);