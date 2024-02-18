import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import BatchPreferenceChart from "./pages/BatchPreferenceChart";
function App() {
  return (
    <BrowserRouter>
 
    <Header />
 
    <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/batchpreference" element={<BatchPreferenceChart />} />
      
    </Routes>
   
  </BrowserRouter>
  );
}

export default App;
