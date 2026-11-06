import { useState } from "react";
import api from "../api/axios"; 
function Adminlogin(){
 const[email,setemail] = useState("");
 const[password,setpassword] = useState("");
 const[error,seterror] = useState("");
 const[loading,setloading] = useState(false);

 const handlesubmit = async(e)=>{
    e.preventDefault();
        setloading(true);
        seterror("");
        try{
         await api.post("/auth/admin-login",{
            email,
            password
        });
        window.location.href= "/admin/verification"
    }catch(err){
        seterror(
            err.response?.data?.error ||
            "Admin login failed."
        );
    }finally{
        setloading(false);
    }
 }
 return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
        <h1>Admin Login</h1>

        <form onSubmit={handlesubmit}>
            <input
                type="email"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                required
            />

            <br /><br />

            <input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                required
            />

            <br /><br />

            <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login as Admin"}
            </button>
        </form>

        {error && (
            <p style={{ color: "red" }}>{error}</p>
        )}
    </div>
 )
}