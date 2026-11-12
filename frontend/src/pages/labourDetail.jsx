import { useParams } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import { useEffect, useState } from "react";
import api from "../api/axios";
function LabourDetail(){
  const {id} = useParams();
  const {user} = useAuth();
  const [loading,setloading] = useState(false);
  const [booking,setbooking] = useState("");
  const [error,seterror] = useState("");
  const [labour,setlabour] = useState(null);
  const [reviews,setreviews] = useState([]);
  const [bookingloading,setbookingloading] = useState(false);
  const [bookingmsg,setbookingmsg] = useState("");
  const [ scheduledAt, setscheduledAt] = useState("");
  const fetchdata = async()=>{
  setloading(true);
  seterror("");
  try{
    const [labourres,reviewres] = await Promise.all([
      api.get(`/labour/${id}`),
      api.get(`/reviews/labour/${id}`)
    ])
   setlabour(labourres.data);
   setreviews(reviewres.data)
  }catch(err){
   seterror(err.response?.data?.error || "Failed to load labour");
  }finally{
    setloading(false)
  }
  }
  useEffect(()=>{
    fetchdata()
  },[id]);
  const handlebooking = async(e)=>{
    e.preventDefault();
    setbookingmsg("");
    if(!user){
      setbookingmsg("Please login first");
      return;
    }
    setbookingloading(true);
    try{
      await api.post("/bookings",{
        labourId: id,
        category: labour.category,
        scheduledAt,
      });
      setbookingmsg("Booking requested");
      setscheduledAt("");
    }catch(err){
    setbookingmsg(err.response?.data?.error || "Booking failed");
    }finally{
      setbookingloading(false)
    }

  }
  if (loading) return <p style={{ maxWidth: 700, margin: "40px auto" }}>Loading...</p>;
  if (error) return <p style={{ maxWidth: 700, margin: "40px auto", color: "red" }}>{error}</p>;
   if (!labour) return null;
  return(
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
    <img
        src={labour.photoUrl || "/default-profile.png"}
        alt={labour.userId?.name || "Labourer"}
        onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/default-profile.png";
        }}
        style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid #e5e7eb"
        }}
    />

    <div>
        <h1>{labour.userId?.name || "N/A"}</h1>
        <p>{labour.category}</p>
    </div>
</div>
            <p><strong>Bio:</strong> {labour.bio}</p>
            <p><strong>Rate:</strong> ₹{labour.hourlyRate}/hr</p>
            <p><strong>Skills:</strong> {labour.skills?.join(", ") || "Not listed"}</p>
            <p>
                <strong>Rating:</strong>{" "}
                {labour.avgRating ? `${labour.avgRating.toFixed(1)} / 5` : "No ratings yet"}{" "}
                ({labour.ratingCount} reviews)
            </p>
            <p><strong>Availability:</strong> {labour.availability ? "Available" : "Not available"}</p>

            <hr style={{ margin: "24px 0" }} />

            <h2>Book this laborer</h2>
            <form onSubmit={handlebooking}>
                <label>Preferred date/time: </label>
                <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setscheduledAt(e.target.value)}
                    required
                />
                <br /><br />
                <button type="submit" disabled={bookingloading}>
                    {bookingloading ? "Booking..." : "Request Booking"}
                </button>
            </form>
            {bookingmsg && <p>{bookingmsg}</p>}

            <hr style={{ margin: "24px 0" }} />
            

            <h2>Reviews</h2>
            {reviews.length === 0 && <p>No reviews yet.</p>}
            {reviews.map((review) => (
                <div
                    key={review._id}
                    style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}
                >
                    <p>
                        <strong>{review.userId?.name || "Anonymous"}</strong> — {review.rating} / 5
                    </p>
                    {review.comment && <p>{review.comment}</p>}
                </div>
            ))}
        </div>
    );
}
export default LabourDetail;