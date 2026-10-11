import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/Authcontext";
function Mybooking(){
    const {user} = useAuth();
   const [error,seterror] = useState("");
   const [bookings,setbookings] = useState([]);
   const[loading,setloading] = useState(true);
   const [cancel,setcancel] = useState(null);
   const [reviews,setreviews] = useState([]);
   const [reviewforms,setreviewforms] = useState({});
   const [reviewloading,setreviewloading] = useState({});
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
   const fetchreviews = async()=>{
    try{
        const response = await api.get("/reviews/my");
        setreviews(response.data);
    }catch(err){
     console.error("Error fetching reviews:", error);
    }
   }
   useEffect(()=>{
    fetchbooking();
    fetchreviews();
   },[]);
    const submitreviews = async(bookingId)=>{
        const form = reviewforms[bookingId];
        if(!form || !form.rating){
            alert("Please fill the rating first");
            return;
        }
        try{
            setreviewloading((prev)=>({
                ...prev,
                [bookingId]: true
            }))
            await api.post("/reviews",{
                bookingId,
                rating: Number(form.rating),
                comment: form.comment || ""
            })
            alert("Review added successfully");
            await fetchreviews();
            await fetchbooking();
            setreviewforms((prev)=>({
                ...prev,
                [bookingId]: {rating: "", comment: ""}
            }))
        }catch(err){
            alert(
      error.response?.data?.error || "Failed to submit review."
          );
        }finally{
            setreviewloading((prev)=>({
                ...prev,
                [bookingId]: false
            }))
        }
    }
   const cancelbooking = async(bookingId)=>{
     const confirm = window.confirm("Are you sure want to cancel the booking");
     if(!confirm) return;
     try{
        seterror("");
        await api.patch(`/bookings/${bookingId}/cancel`)
        await fetchbooking();
     }catch(err){
        seterror(err.response?.data?.error || "Failed to cancel booking");
     }
   }
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
                <button onClick={()=> cancelbooking(booking._id)}>
                    cancel booking
                </button>
            )}
            {booking.status === "completed" && (
      reviews.some(
    (review) =>
      review.bookingId === booking._id ||
      review.bookingId?._id === booking._id
  ) ? (
    <p className="text-green-600 font-medium mt-3">
      ✓ Review submitted
    </p>
  ) : (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-semibold mb-2">
        Rate your experience
      </h3>

      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() =>
              setreviewforms((prev) => ({
                ...prev,
                [booking._id]: {
                  ...prev[booking._id],
                  rating: star,
                },
              }))
            }
            className={`text-2xl ${
              star <= (reviewforms[booking._id]?.rating || 0)
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        placeholder="Share your experience (optional)"
        value={reviewforms[booking._id]?.comment || ""}
        onChange={(e) =>
          setreviewforms((prev) => ({
            ...prev,
            [booking._id]: {
              ...prev[booking._id],
              comment: e.target.value,
            },
          }))
        }
        maxLength={1000}
        className="w-full border rounded-lg p-3"
        rows={3}
      />

      <button
        type="button"
        onClick={() => submitreviews(booking._id)}
        disabled={reviewloading[booking._id]}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {reviewloading[booking._id]
          ? "Submitting..."
          : "Submit Review"}
      </button>
    </div>
  )
)}  
            </div>
        ))
      )}
    </div>
   );
}
export default Mybooking;