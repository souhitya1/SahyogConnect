import { useState } from "react";
import { useAuth } from "../context/Authcontext";
import api from "../api/axios";
function Labourverification(){
    const {user} = useAuth();
    const [form,setform] = useState({
         address: "",
        experience: "",
        idType: "",
        idNumber: ""
    })
    const [loading,setloading] = useState(false);
    const [message,setmessage] = useState("");
    const [error,seterror] = useState("");

    const handlechange = (e)=>{
        const {name,value} = e.target;
        setform(prev=>({
            ...prev,
            [name]: value,
            ...(name == "idType"?{idNumber: ""}:{})
        }));
    }
    const handlesubmit = async(e)=>{
        e.preventDefault();
        setloading(true);
        setmessage("");
        seterror("");
        try{
            if (form.idType === "Aadhaar" &&
          !/^\d{4}$/.test(form.idNumber)) {
            alert("Enter the last 4 digits of your Aadhaar number.");
        return;
}

       if (form.idType === "Voter ID" &&
           !/^[A-Za-z0-9]{10}$/.test(form.idNumber)) {
            alert("Enter a valid 10-character Voter ID number.");
           return;
}
          const response = await api.post("/verification/submit",
          {
            ...form,
            experience: Number(form.experience)
          }
        )
        setmessage(response.data.message);
        }catch(err){
            seterror(
                err.response?.data?.error ||
                "Could not submit your application."
            );
        }finally{
            setloading(false);
        }
    }
    if(!user){
        return <p>Please log in first</p>
    }
    if(user.role != "laborer"){
        return <p>You have to be a labour first</p>
    }
    if(user.verificationStatus == "approved" && user.isVerified == true){
        return(
            <div>
                <h2>Verification complete</h2>
                <p>Your verification is approved</p>
            </div>
        )
    }
    if(user.verificationStatus == "pending"){
        return(
            <div>
                <h2>Verification pending</h2>
                <p>Your verification application has been submitted.
                      Please wait until the admin approves it.</p>
            </div>
        )
    }
    return(
      <main style={styles.container}>
            <h1>Labourer Verification</h1>

            <p>
                Complete this form to submit your verification
                application to the SahyogConnect admin.
            </p>

            {message && (
                <p style={{ color: "green" }}>{message}</p>
            )}

            {error && (
                <p style={{ color: "red" }}>{error}</p>
            )}

            <form onSubmit={handlesubmit}>
                <label htmlFor="address">
                    Residential address
                </label>

                <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handlechange}
                    required
                    maxLength={300}
                    placeholder="Enter your residential address"
                    style={styles.input}
                />

                <label htmlFor="experience">
                    Years of work experience
                </label>

                <input
                    id="experience"
                    type="number"
                    name="experience"
                    min="0"
                    max="70"
                    step="1"
                    value={form.experience}
                    onChange={handlechange}
                    required
                    style={styles.input}
                />

                <label htmlFor="idType">
                    Identity document type
                </label>

                <select
                    id="idType"
                    name="idType"
                    value={form.idType}
                    onChange={handlechange}
                    required
                    style={styles.input}
                >
                    <option value="">
                        Select document type
                    </option>
                    <option value="Aadhaar">
                        Aadhaar
                    </option>
                    <option value="Voter ID">
                        Voter ID
                    </option>
                </select>
            {
                form.idType &&(
                    <div>
                        <label>
                            {form.idType == "Aadhaar"
                            ? " Last 4 digits"
                            : "Voter ID number"
                            }
                        </label>
                        <input
                         type="text"
                         name= "idNumber"
                         value={form.idNumber}
                         onChange={handlechange}
                         placeholder={
                            form.idType == "Aadhaar"
                            ? "Enter last 4 digits"
                            : "Enter Voter ID number"
                         }
                          maxLength={form.idType === "Aadhaar" ? 4 : 10}
                          required
                        />
                    </div>
                )
            }
                <button
                    type="submit"
                    disabled={loading}
                    style={styles.button}
                >
                    {loading
                        ? "Submitting..."
                        : "Submit for Verification"}
                </button>
            </form>
            </main>
            )
            }
            const styles = {
    container: {
        maxWidth: "550px",
        margin: "40px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        border: "1px solid #e5e7eb",
        borderRadius: "12px"
    },
    input: {
        display: "block",
        width: "100%",
        boxSizing: "border-box",
        padding: "12px",
        marginTop: "8px",
        marginBottom: "18px",
        border: "1px solid #d1d5db",
        borderRadius: "8px"
    },
    button: {
        padding: "12px 18px",
        background: "#15803d",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
    }
};
export default Labourverification;