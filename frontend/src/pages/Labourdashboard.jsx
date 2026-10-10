import { useState } from "react";
import api from "../api/axios";
import { useCallback } from "react";
import { useEffect } from "react";
import { useAuth } from "../context/Authcontext";
function Labourdashboard(){
    const {user} = useAuth();
    const [loading,setloading] = useState(true);
    const [error,seterror] = useState("");
    const [bookings,setbookings] = useState([]);
    const [updatingId,setupdatingId] = useState("");
    const [message,setmessage] = useState("");
    const fetchbooking = useCallback(async()=>{
      setloading(true);
      seterror("");
      try{
        const response = await api.get(`/bookings/labourer/my`)
        setbookings(response.data);
      }catch(err){
        seterror(err.response?.data?.error || "Failed to fetch labour data");
      }finally{
        setloading(false)
      }
    },[]);
    useEffect(()=>{
        if(user){
            fetchbooking();
        }else{
            setloading(false);
        }
    },[user,fetchbooking])
    const handlebooking = async(bookingId,action)=>{
      const actions = {
        accept : "accept",
        reject: "reject",
        complete : "mark as complete"
      }
      if(!window.confirm(`Are you sure you want to ${actions[action]} this booking`)){
        return
      }
      try{
        setupdatingId(bookingId);
        seterror("");
        setmessage("");
        await api.patch(`/bookings/${bookingId}/${action}`);
        const successmessage = {
            accept: "Booking accepted",
            reject: "Booking rejected",
            complete: "Booking completed"
        }
        setmessage(successmessage[action]);
        await fetchbooking();
      }catch(err){
        seterror(
        err.response?.data?.error || "Failed to update booking"
      );
    }finally{
        setupdatingId("");
    }
    }
     const getStatusStyle = (status) => {
    const colors = {
      pending: "#b45309",
      accepted: "#15803d",
      rejected: "#b91c1c",
      completed: "#1d4ed8",
      cancelled: "#6b7280",
    };

    return {
      color: colors[status?.toLowerCase()] || "#374151",
      fontWeight: "bold",
      textTransform: "capitalize",
    };
  };
  if(loading){
    return <main style={styles.container}>Loading dashboard...</main>;
  }

  if (!user) {
    return (
      <main style={styles.container}>
        <h1>Labourer Dashboard</h1>
        <p>Please log in to continue.</p>
      </main>
    );
  }
  const pending = bookings.filter(
    (b)=>b.status == 'pending'
  ).length;
  const accepted = bookings.filter(
    (b)=>b.status == 'accepted'
  ).length;
  const completed = bookings.filter(
    (b)=>b.status == 'completed'
  ).length;
  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1>Labourer Dashboard</h1>
          <p>Welcome, {user.name || "Labourer"}</p>
        </div>

        <button
          onClick={fetchbooking}
          disabled={loading}
          style={styles.refreshButton}
        >
          Refresh
        </button>
      </header>

      <section style={styles.stats}>
        <StatCard title="Pending" count={pending} />
        <StatCard title="Accepted" count={accepted} />
        <StatCard title="Completed" count={completed} />
      </section>

      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <h2>Booking Requests</h2>

      {bookings.length === 0 ? (
        <div style={styles.empty}>
          <h3>No bookings yet</h3>
          <p>Customer booking requests will appear here.</p>
        </div>
      ) : (
        bookings.map((booking) => (
          <article key={booking._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3>{booking.category || "Service Booking"}</h3>

              <span style={getStatusStyle(booking.status)}>
                {booking.status || "pending"}
              </span>
            </div>

            <p>
              <strong>Customer:</strong>{" "}
              {booking.userId?.name || "N/A"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {booking.userId?.email || "N/A"}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {booking.userId?.phone || "N/A"}
            </p>

            <p>
              <strong>Scheduled:</strong>{" "}
              {booking.scheduledAt
                ? new Date(booking.scheduledAt).toLocaleString()
                : "Not specified"}
            </p>

            {booking.status === "pending" && (
              <div style={styles.actions}>
                <button
                  style={styles.acceptButton}
                  disabled={updatingId === booking._id}
                  onClick={() =>
                    handlebooking(booking._id, "accept")
                  }
                >
                  {updatingId === booking._id ? "Updating..." : "Accept"}
                </button>

                <button
                  style={styles.rejectButton}
                  disabled={updatingId === booking._id}
                  onClick={() =>
                    handlebooking(booking._id, "reject")
                  }
                >
                  Reject
                </button>
              </div>
            )}

            {booking.status === "accepted" && (
              <button
                style={styles.completeButton}
                disabled={updatingId === booking._id}
                onClick={() =>
                  handlebooking(booking._id, "complete")
                }
              >
                Mark as Completed
              </button>
            )}
          </article>
        ))
      )}
    </main>
  );
}

function StatCard({ title, count }) {
  return (
    <div style={styles.statCard}>
      <p>{title}</p>
      <h2>{count}</h2>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "Arial, sans-serif",
    color: "#111827",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "24px",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
    marginBottom: "30px",
  },
  statCard: {
    background: "#f3f4f6",
    padding: "16px",
    borderRadius: "10px",
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
  },
  refreshButton: {
    padding: "10px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "white",
    cursor: "pointer",
  },
  acceptButton: {
    padding: "10px 18px",
    background: "#15803d",
    color: "white",
    border: 0,
    borderRadius: "8px",
    cursor: "pointer",
  },
  rejectButton: {
    padding: "10px 18px",
    background: "#b91c1c",
    color: "white",
    border: 0,
    borderRadius: "8px",
    cursor: "pointer",
  },
  completeButton: {
    padding: "10px 18px",
    background: "#1d4ed8",
    color: "white",
    border: 0,
    borderRadius: "8px",
    cursor: "pointer",
  },
  empty: {
    textAlign: "center",
    padding: "30px",
    border: "1px dashed #d1d5db",
    borderRadius: "12px",
  },
  success: { color: "#15803d" },
  error: { color: "#b91c1c" },
};
export default Labourdashboard;