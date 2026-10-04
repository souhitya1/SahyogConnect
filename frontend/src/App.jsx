import {Routes,Route} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/Authcontext";
import labourDetail from "./pages/labourDetail";

function App(){
  const {user} = useAuth();
  return(
    <>
    {user && <Navbar/>}
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/labour/:id" element={<labourDetail/>}/>
    </Routes>
    </>
  )
}
export default App;