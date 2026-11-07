import {Routes,Route} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/Authcontext";
import LabourDetail from "./pages/labourDetail";
import Createlabourprofile from "./pages/createlabourprofile";
import Mybooking from "./pages/Mybooking";
import Labourdashboard from "./pages/Labourdashboard";
import Labourverification from "./pages/Labourverification";
import Adminverification from "./pages/Adminverification";
import Adminlogin from "./pages/Adminlogin";

function App(){
  const {user} = useAuth();
  return(
    <>
     <Navbar/>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/labour/:id" element={<LabourDetail/>}/>
      <Route path="/labour" element={<Createlabourprofile/>}/>
      <Route path="/bookings" element= {<Mybooking/>}/>
      <Route path="/labour-dashboard" element= {<Labourdashboard/>}/>
      <Route path="/labour-verification" element= {<Labourverification/>}/>
      <Route path="/admin/verification" element= {<Adminverification/>}/>
      <Route path="/admin-login" element= {<Adminlogin/>}/>
    </Routes>
    </>
  )
}
export default App;