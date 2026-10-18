import { useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
const labouricon = L.divIcon({
    className: "",
    html: `<div style="
        background:#2563eb;
        width:18px;
        height:18px;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 1px 6px #555;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
})
const usericon = L.divIcon({
     className: "",
    html: `<div style="
        background:#16a34a;
        width:18px;
        height:18px;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 1px 6px #555;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
})
function MapUpdator({center}){
    const map = useMap();
    useState(()=>{
        map.setView(center,14)
    });
    return null;
}
function Home(){
   const [catagory,setcatagory] = useState("electrician")
   const [error,seterror] = useState("");
   const [lng,setlng] = useState("88.36");
const [lat,setlat] = useState("22.57");
   const [location,setlocation] = useState("");
   const [loading,setloading] = useState(false)
   const [results, setresults] = useState([]);
   const [searched,setsearched] = useState(false);
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
            },
            {
                enableHighAccuracy: true,
                timeout: 10000
            }
        );
    };
    const handlesearch = async(e)=>{
       e.preventDefault();
       seterror("");
       setloading(true)
       const latitude = Number(lat);
       const longitude = Number(lng);
       if(
          !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
       ){
         seterror("Please enter valid latitude and longitude.");
            return;
       }
       setloading(true);
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
    const userposition = [Number(lat),Number(lng)];
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
            {searched &&(
                 <p>
                    Found {results.length} labourer(s) within 1 km.
                </p>
            )}

            <div style={{ marginTop: 24 }}>
               <h2>Nearby labourers map</h2>
               <MapContainer
               center={userposition}
               zoom={14}
                style={{
                        height: "420px",
                        width: "100%",
                        borderRadius: "12px",
                        zIndex: 0
                    }}
               >
                <MapUpdator center={userposition}/>
                 <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={userposition} icon={usericon}>
                        <Popup>Your Search location</Popup>
                    </Marker>
                    <Circle
                    center={userposition}
                    radius={1000}
                    pathOptions={{
                            color: "#16a34a",
                            fillColor: "#16a34a",
                            fillOpacity: 0.08
                        }}
                    />
                    {results.map((labourer)=>{
                        const coordinates = labourer.location?.coordinates;
                          const labourPosition =
                            coordinates?.length === 2
                                ? [coordinates[1], coordinates[0]]
                                : labourer.lat != null &&
                                  labourer.lng != null
                                ? [
                                      Number(labourer.lat),
                                      Number(labourer.lng)
                                  ]
                                : null;

                        if (
                            !labourPosition ||
                            !labourPosition.every(Number.isFinite)
                        ) {
                            return null;
                        }
                        return(
                            <Marker
                             key={labourer._id}
                                position={labourPosition}
                                icon={labouricon}
                            >
                                <Popup>
                                    <strong>
                                        {labourer.category}
                                    </strong>
                                    <br/>
                                    <br />
                                    {labourer.bio}
                                    <br />
                                    Rate: ₹{labourer.hourlyRate}/hr
                                    <br />
                                    Distance:{" "}
                                    {(
                                        labourer.distance / 1000
                                    ).toFixed(2)} km
                                    <br />
                                    <Link to={`/labour/${labourer._id}`}>
                                        View Profile
                                    </Link>
                                </Popup>
                            </Marker>
                        )
                    })}
               </MapContainer>
                <p>
                    <span style={{ color: "#16a34a" }}>●</span> Your
                    location{" "}
                    <span style={{ color: "#2563eb" }}>●</span> Labourer
                    location
                </p>
               </div>
               <div style={{ marginTop: 24 }}>
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