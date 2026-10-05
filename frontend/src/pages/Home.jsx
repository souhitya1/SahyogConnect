import { useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
function Home(){
   const [catagory,setcatagory] = useState("electrician")
   const [error,seterror] = useState("");
   const [lng,setlng] = useState("88.36");
const [lat,setlat] = useState("22.57");
   const [location,setlocation] = useState("");
   const [loading,setloading] = useState(false)
   const [results, setresults] = useState([]);
   const detectLocation = () => {
        seterror("");
        if (!navigator.geolocation) {
            seterror("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                    setlat(pos.coords.latitude.toString());
                    setlng(pos.coords.longitude.toString());
            },
            () => {
                seterror("Could not get your location. Please allow location access.");
            }
        );
    };
    const handlesearch = async(e)=>{
       e.preventDefault();
       seterror("");
       setloading(true)
       try{
         const res = await api.get("/labour/search",{
          params:{
            lng,
            lat,
            category: catagory,
            radius: 10000
          }
         })
         setresults(res.data)
       }catch(err){
        seterror(err.response?.data?.error || "Search failed");
       }finally{
        setloading(false);
       }
    }
    return(
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
            <h1>Find a Laborer Near You</h1>

            <form onSubmit={handlesearch}>
                <select value={catagory} onChange={(e) =>  setcatagory(e.target.value)}>
                    <option value="electrician">Electrician</option>
                    <option value="plumber">Plumber</option>
                    <option value="carpenter">Carpenter</option>
                    <option value="painter">Painter</option>
                </select>
                <br />
                <label>Longitude: </label>
                <input value={lng} onChange={(e) => setlng(e.target.value)} />
                <br />
                <label>Latitude: </label>
                <input value={lat} onChange={(e) => setlat(e.target.value)} />
                <br /><br />
                <br />

                <button type="button" onClick={detectLocation}>Use my real location instead</button>
                <br />
                <br />

                <button type="submit" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ marginTop: 24 }}>
                {results.length === 0 && !loading && <p>No results yet. Try searching above.</p>}

                {results.map((labourer) => (
                    <div
                        key={labourer._id}
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: 8,
                            padding: 16,
                            marginBottom: 12,
                        }}
                    >
                        <h3>{labourer.category}</h3>
                        <p>{labourer.bio}</p>
                        <p>Rate: ₹{labourer.hourlyRate}/hr</p>
                        <p>
                            Rating: {labourer.avgRating?.toFixed(1) || "No ratings yet"} (
                            {labourer.ratingCount} reviews)
                        </p>
                        <p>Distance: {(labourer.distance / 1000).toFixed(1)} km</p>
                        <Link to={`/labour/${labourer._id}`}>View Profile</Link>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Home;