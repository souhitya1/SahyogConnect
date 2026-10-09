import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/Authcontext";
function Mybooking(){
    const user = useAuth();
   const [error,seterror] = useState("");
   const [bookings,setbookings] = useState("");
   const[loading,setloading] = useState(true);
   const fetchbooking = async()=>{
    if (!user) return;
    try{
        seterror("");
        setloading(true);
        const response = await api.get(`/bookings/my`);
        setbookings(response.data)
    }catch(err){
        seterror(err.response?.data?.error || "Failed to load booking");
    }finally{
        setloading(false);
    }
   }
   useEffect(()=>{
    fetchbooking()
   },[]);
   const getstatus = (status)=>{
    switch(status?.toLowerCase()){
        case "pending":
        return {color: "orange"};
        case "accepted":
        return {color: "green"};
        case "completed":
        return {color: "blue"};
        case "cancelled":
        return {color: "red"}
        default:
        return {color: "black"}
    }
   }
   if(loading){
    return(
        <div style={{ maxWidth: 800, margin: "40px auto" }}>
        <h1>My bookings</h1>
        <p>Loading booking ...</p>
        </div>
    );
   }
   if(error){
    return(
        <div style={{ maxWidth: 800, margin: "40px auto" }}>
          <h1>My bookings</h1>
          <p style={{color: "red"}}>{error}</p>
        </div>
    );
   }
   return(
    <div  style={{ maxWidth: 800, margin: "40px auto" }}>
      <h1>My bookings</h1>
      {bookings.length == 0 ? (
        <p>You donot have any bookings</p>
      ):(
        bookings.map((booking)=>(
            <div 
            key={booking._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px",
            }}
            >
            <h2>{booking. category}</h2>
            <p>
                <strong>Provider</strong>{" "}
                {booking.labourId?.userId?.name || "N/A"}
            </p>
            <p>
               <strong>Status</strong>
               <span style={getstatus(booking.status)}>
                {booking.status || "pending"}
               </span>
            </p>
            {booking.status.toLowerCase() == "pending" && (
                <button>
                    cancel booking
                </button>
            )}
            </div>
        ))
      )}
    </div>
   );
}
export default Mybooking;