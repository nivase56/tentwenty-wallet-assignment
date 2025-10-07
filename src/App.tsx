import { WagmiProvider } from "wagmi";
import "./App.css";
import Dashboard from "./components/home/Dashboard";
import { config } from "../config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./store/store";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <PersistGate loading={"loading"} persistor={persistor}>
          <Dashboard />
        </PersistGate>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
