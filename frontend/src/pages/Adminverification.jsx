import { useEffect, useState } from "react";
import { useAuth } from "../context/Authcontext";
import api from "../api/axios";
function Adminverification(){
 const {user} = useAuth();
 const[applications,setapplications]= useState([]);
 const[loading,setloading] = useState(true);
 const[error,seterror] = useState("");
 const[message,setmessage] = useState("");
 const[processing,setprocessing] = useState("");
 const fetchapplications = async(e)=>{
    try{
        setloading(true);
        seterror("")
        const response = await api.get("/verification/pending");
        setapplications(response.data)
    }catch(err){
        seterror(
            err.response?.data?.error ||
            "Could not fetch verification applications."
        );
    }finally{
        setloading(false)
    }
 }
 useEffect(()=>{
    if(user?.isAdmin == true){
      fetchapplications()
    }else{
        setloading(false)
    }
 },[user]);
 const handlereview = async(id,status)=>{
    try{
         setloading(false);
         seterror("");
         setprocessing(id);
         const response = await api.patch(
            `/verification/${id}/review`,
            {
                status,
                note: status === "approved"
                    ? "Verification approved."
                    : "Verification rejected."
            }
         )
         setmessage(response.data.message);
         setapplications((previous) =>
            previous.filter((application) => application._id !== id)
        );
    }catch(err){
        seterror(
            err.response?.data?.error ||
            "Could not update verification status."
        );
    }finally{
        setprocessing("");
    }
}
    if (!user) {
    return <p>Please log in first.</p>;
}

if (user.isAdmin !== true) {
    return <p>Access denied. Admin only.</p>;
}

if (loading) {
    return <p>Loading applications...</p>;
}

return (
    <div style={styles.container}>
        <h1>Admin Verification Dashboard</h1>

        <button onClick={fetchapplications}>
            Refresh Applications
        </button>

        {message && (
            <p style={{ color: "green" }}>{message}</p>
        )}

        {error && (
            <p style={{ color: "red" }}>{error}</p>
        )}

        <h2>Pending Applications ({applications.length})</h2>

        {applications.length === 0 ? (
            <p>No pending verification applications.</p>
        ) : (
            applications.map((application) => (
                <div key={application._id} style={styles.card}>
                    <h3>{application.name}</h3>

                    <p><strong>Email:</strong> {application.email}</p>
                    <p><strong>Phone:</strong> {application.phone}</p>
                    <p>
                        <strong>Address:</strong>{" "}
                        {application.verificationAddress}
                    </p>
                    <p>
                        <strong>Experience:</strong>{" "}
                        {application.verificationExperience} years
                    </p>
                    <p>
                        <strong>ID Type:</strong>{" "}
                        {application.verificationIdType}
                    </p>
                    <p>
                    <strong>ID Number:</strong>{" "}
                        {application.verificationIdNumber}
                      </p>
                    <p>
                        <strong>Submitted:</strong>{" "}
                        {application.verificationSubmittedAt
                            ? new Date(
                                application.verificationSubmittedAt
                            ).toLocaleString()
                            : "Not available"}
                    </p>

                    <button
                        disabled={processing === application._id}
                        onClick={() =>
                            handlereview(application._id, "approved")
                        }
                        style={styles.approve}
                    >
                        {processing === application._id
                            ? "Processing..."
                            : "Approve"}
                    </button>

                    <button
                        disabled={processing === application._id}
                        onClick={() =>
                            handlereview(application._id, "rejected")
                        }
                        style={styles.reject}
                    >
                        Reject
                    </button>
                </div>
            ))
        )}
    </div>
);
}


const styles = {
container: {
maxWidth: "800px",
margin: "30px auto",
padding: "20px",
fontFamily: "Arial, sans-serif"
},
card: {
border: "1px solid #ddd",
borderRadius: "10px",
padding: "20px",
marginBottom: "20px"
},
approve: {
background: "green",
color: "white",
padding: "10px 18px",
border: "none",
borderRadius: "5px",
marginRight: "10px",
cursor: "pointer"
},
reject: {
background: "red",
color: "white",
padding: "10px 18px",
border: "none",
borderRadius: "5px",
cursor: "pointer"
}
};
export default Adminverification;