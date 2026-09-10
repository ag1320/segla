import "./App.css";
import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Retirement from './components/retirement/Retirement.js'
import Reserve from './components/reserve/Reserve.js'
import Home from './components/Home.js'
import Investments from './components/investmentsNew/Investments.js'
import Loans from './components/loans/Loans.js'
import Budget from './components/budget/Budget.js'
import AppSnackbar from './components/AppSnackbar'
import GetCryptoData from "./components/investmentsNew/crypto/GetCryptoData.js";
import Login from "./components/Login.js";
import RequireAuth from "./components/RequireAuth.js";

function App() {

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <>
              <Navbar />
              <GetCryptoData/>
              <AppSnackbar/>
              <div className="content">
                <Routes>
                  <Route path="/budget" element = {<Budget />}/>
                  <Route path="/retirement" element={<Retirement className = 'page'/>} />
                  <Route path="/investments" element = {<Investments className = 'page'/>}/>
                  <Route path="/reserve" element = {<Reserve className = 'page'/>}/>
                  <Route path="/loans" element = {<Loans className = 'page'/>}/>
                  <Route path="/" element = {<Home className = 'page'/>}/>
                </Routes>
              </div>
            </>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
