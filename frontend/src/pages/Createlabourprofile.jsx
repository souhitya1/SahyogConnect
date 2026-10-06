import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/Authcontext";
import { useState } from "react";
function Createlabourprofile(){
    const {user } = useAuth();
    const navigate = useNavigate();
    const[form,setform]= useState({
        category: "",
        skills: "",
        hourlyRate: "",
        bio: "",
        lat: "",
        lng: ""
    })
    const [error,seterror] = useState("");
    const[loading,setloading] = useState(false);
    const [success,setsuccess] = useState("");
    const detectLocation = () => {
        seterror("");
        if (!navigator.geolocation) {
            seterror("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setform((f)=>({
                    ...f,
                  lat: pos.coords.latitude.toString(),
                  lng: pos.coords.longitude.toString(),
                }));
            },
            () => {
                seterror("Could not get your location. Please allow location access.");
            }
        );
    };

    const handleChange = (e)=>{
        setform({...form,[e.target.name]: e.target.value});
    }
    const handlesubmit = async(e)=>{
     e.preventDefault();
     seterror("");
     setsuccess("");
     setloading(true);
      if (!form.lng || !form.lat) {
            seterror("Please set your location before submitting.");
            return;
        }
     try{
       await api.post("/labour",{
        category: form.category,
        skills: form.skills,
        hourlyRate: form.hourlyRate,
        bio: form.bio,
        lat: form.lat,
        lng: form.lng
       })
       setsuccess("Profile saved! You're now visible in search.")
     }catch(err){
      seterror(err.response?.data?.error || "Cannot get profile");
     }finally{
        setloading(false)
     }
    }
    if(!user){
        return(
            <div style={{ maxWidth: 500, margin: "40px auto" }}>
                <p>Please log in to create a laborer profile.</p>
            </div>
        );
    }
    return (
        <div style={{ maxWidth: 500, margin: "40px auto" }}>
            <h1>Create / Update Laborer Profile</h1>

            <form onSubmit={handlesubmit}>
                <label>Category:</label>
                <br />
                <select name="category" value={form.category} onChange={handleChange}>
                    <option value="electrician">Electrician</option>
                    <option value="plumber">Plumber</option>
                    <option value="carpenter">Carpenter</option>
                    <option value="painter">Painter</option>
                </select>
                <br /><br />

                <label>Bio:</label>
                <br />
                <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Describe your experience"
                    rows={3}
                    required
                />
                <br /><br />

                <label>Hourly Rate (₹):</label>
                <br />
                <input
                    type="number"
                    name="hourlyRate"
                    value={form.hourlyRate}
                    onChange={handleChange}
                    required
                />
                <br /><br />

                <label>Skills (comma separated):</label>
                <br />
                <input
                    type="text"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="wiring, repair, installation"
                />
                <br /><br />

                <label>Longitude:</label>
                <br />
                <input
                    type="text"
                    name="lng"
                    value={form.lng}
                    onChange={handleChange}
                    required
                />
                <br />
                <label>Latitude:</label>
                <br />
                <input
                    type="text"
                    name="lat"
                    value={form.lat}
                    onChange={handleChange}
                    required
                />
                <br /><br />

                <button type="button" onClick={detectLocation}>
                    Detect my location
                </button>
                <br /><br />

                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Profile"}
                </button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
        </div>
    );
}
export default Createlabourprofile;