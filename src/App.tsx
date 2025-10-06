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
        <PersistGate loading={null} persistor={persistor}>
          <Dashboard />
        </PersistGate>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;

{
  /* <TitleBar
  title="Watchlist"
  icon={<span className="text-lime-400"><Star fill="#A9E851"/></span>}
  actions={[
    {
      label: "Refresh Prices",
      icon: <RefreshCcw size={14} />,
    },
    {
      label: "Add Token",
      icon: <Plus size={14} />,
      className: "bg-lime-500 hover:bg-lime-600 text-black",
    },
  ]}
/> */
}
