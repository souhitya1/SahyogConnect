import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import api from "../api/axios";
function Signup(){
    const navigate = useNavigate();
    const [form,setform] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "user" 
    });
    const [error,seterror] = useState("");
    const [loading,setloading] = useState(false);
    const handlechange = (e) =>{
        setform({...form, [e.target.name]: e.target.value});
    }
    const handleform = async(e) =>{
        e.preventDefault();
        seterror("");
        setloading(true);
        try{
           await api.post("/auth/signup",form);
           navigate("/");
        }catch(err){
        seterror(err.response?.data?.error || "Signup failed");
        }finally{
            setloading(false);
        }
    }
    return(
        <div style={{ maxWidth: 400, margin: "40px auto" }}>
        <h2>Signup</h2>
        <form onSubmit={handleform}>
           <input
           placeholder="Enter your name"
        name="name"
        type="text"
        onChange={handlechange}
        value={form.name}
        required
           />
           <br/>
           <input
           placeholder="Enter your email"
        name="email"
        type="text"
        onChange={handlechange}
        value={form.email}
        required
           />
           <br/>
            <input
           placeholder="Enter your password"
        name="password"
        type="password"
        onChange={handlechange}
        value={form.password}
        required
           />
           <br/>
            <input
           placeholder="Enter your number"
        name="phone"
        type="Number"
        onChange={handlechange}
        value={form.phone}
        required
           />
           <br/>
           <select onChange={handlechange} value={form.role} name="role">
            <option value="user">Customer</option>
          <option value="laborer">Laborer</option>
           </select>
           <br/>
            <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
        </div>
    );
}
export default Signup;