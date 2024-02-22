import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser"; // Import PublicClientApplication
import Home from "./pages/Home";
import Booking from './pages/Booking';
import Header from "./components/Header";
import BatchPreferenceChart from "./pages/BatchPreferenceChart";


const msalConfig = {
  auth: {
    clientId: '7a0d8f1c-e9d7-4156-9152-72a97a6242dd',
    authority: 'https://login.microsoftonline.com/nsbm.ac.lk',
    redirectUri: window.location.origin,
  },
};

const msalInstance = new PublicClientApplication(msalConfig); // Create MSAL instance

function App() {
  return (
    <MsalProvider instance={msalInstance}> {/* Pass msalInstance instead of msalConfig */}
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/batchpreference" element={<BatchPreferenceChart />} />
          <Route path="/Booking" element={<Booking />} />
        </Routes>
      </BrowserRouter>
    </MsalProvider>
  );
}

export default App;
