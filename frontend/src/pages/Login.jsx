import { useState} from "react";
import { useNavigate,Link } from "react-router-dom";
import api from "../api/axios";
function Login(){
     const navigate = useNavigate();
     const [form,setform] = useState({
        email: "",
        password: ""
     })
     const [loading,setloading] = useState(false);
     const [error,seterror] = useState("");
     const handleform = (e) =>{
        setform({...form,[e.target.name]: e.target.value});
     }
     const handlechange = async(e) =>{
        e.preventDefault();
        seterror("");
        setloading(true);
        try{
            await api.post("/auth/login",form);
            navigate("/");
        }catch(err){
         seterror(err.response?.data?.error || "Signup failed");
        }finally{
            setloading(false);
        }  
     }
     return(
        <div style={{ maxWidth: 400, margin: "40px auto" }}>
          <h2>Login</h2>
          <br/>
          <form onSubmit={handlechange}>
          <input
          placeholder="Enter password"
          onChange={handleform}
          name="password"
          value={form.password}
          type="password"
          />
          <br/>
          <input
          placeholder="Enter email"
          onChange={handleform}
          name="email"
          value={form.email}
          type="text"
          />
           <br />
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
          </form>
           {error && <p style={{ color: "red" }}>{error}</p>}
            <p>
                Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
        </div>
     )
}
export default Login;