import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
const Authcontext = createContext();

export function Authprovider({children}){
    const [user,setuser] = useState(null);
    const [loading,setloading] = useState(true);

    const checkauth = async()=>{
        try{
            const res= await api.get("/auth/me");
            setuser(res.data.user);
        }catch{
            setuser(null);
        }finally{
            setloading(false)
        }
    }
    useEffect(()=>{
        checkauth();
    },[]);
    const logout = async() =>{
        await api.post("/auth/logout");
        setuser(null);
    }
    return (
        <Authcontext.Provider value={{ user, setuser, loading, logout, checkauth }}>
            {children}
        </Authcontext.Provider>
    );
}
export function useAuth() {
    return useContext(Authcontext);
}