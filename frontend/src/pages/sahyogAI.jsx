import { useState } from "react";
import api from "../api/axios";
import { useEffect } from "react";
import { useRef } from "react";
function SahyogAI() {
    const[message,setmessage] = useState("");
    const[messages,setmessages]= useState([
        {
             role: "ai",
            text: "Hello! I'm Sahyog AI. Tell me what problem you're facing, and I'll help you find the right professional."
        }
    ])
    const[loading,setloading] = useState(false);
    const bottomref = useRef(null);
    useEffect(()=>{
        bottomref.current?.scrollIntoView({
            behavior: "smooth"
        });
    },[messages,loading]);
    const handlesend = async(e)=>{
        e.preventDefault();
        if(!message.trim() || loading) return;
       const usermessage = message.trim();
       setmessages(prev=>[
        ...prev,
        {role: "user", text: usermessage}
       ])
       setmessage("");
       setloading(true);
       try{
        const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            resolve,
            reject
        );
    });
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const conversations = [
        ...messages
        .filter(msg=> msg.role === "user")
        .map(msg => msg.text),
        usermessage
    ]
    const res = await api.post("/ai/chat",{
        message: usermessage,
        conversations,
        lat,
        lng,
        radius: 5000
    });
    console.log("Sahyog AI response:", res.data);
    setmessages(prev=>[
        ...prev,
        {
            role: "ai",
            text: res.data.reply,
            category: res.data.category,
            labourers: res.data.labourers
        }
    ])
       }catch(error){
        console.error("Sahyog AI error:", error);
        let errorMessage = "Something went wrong. Please try again.";
        if (error.response?.status === 401) {
        errorMessage = "Please login to use Sahyog AI.";
    } else if (error.response?.status === 403) {
        errorMessage = "Sahyog AI is available only for customers.";
    } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Cannot connect to the server. Please try again.";
    } else if (error.code === 1 || error.message?.includes("User denied")) {
        errorMessage = "Please allow location access to find nearby labourers.";
    }
        setmessages(prev => [
                ...prev,
                {
                    role: "ai",
                    text: errorMessage
                }
            ]);
       }finally{
        setloading(false);
       }
    }
     return (
        <div className="min-h-screen bg-slate-950 text-white p-4">
            <div className="max-w-3xl mx-auto flex flex-col h-[85vh]">

                <div className="border-b border-slate-800 pb-4">
                    <h1 className="text-2xl font-bold">
                        Sahyog AI
                    </h1>
                    <p className="text-sm text-slate-400">
                        Your intelligent labour assistance
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto py-5 space-y-4">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                msg.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                msg.role === "user"
                                    ? "bg-blue-600"
                                    : "bg-slate-800"
                            }`}>
                                {msg.text}
                                 {msg.category && (
        <p className="text-xs text-blue-300 mt-3">
            Identified category: {msg.category}
        </p>
    )}

    {msg.labourers?.length > 0 && (
        <div className="mt-4 space-y-3">
            <h3 className="font-semibold">
                Recommended professionals
            </h3>

            {msg.labourers.map((labour) => (
                <div
                    key={labour._id}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-3"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <img
                            src={labour.photoUrl || "/default-avatar.png"}
                            alt={labour.user?.name || "Labourer"}
                            className="!w-12 !h-12 !min-w-12 !max-w-none shrink-0 rounded-full object-cover"
                        />

                        <div>
                            <h4 className="font-semibold">
                                {labour.user?.name || "Professional"}
                            </h4>

                            <p className="text-sm text-slate-400">
                                {labour.category}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between text-sm mt-3">
                        <span>
                            ⭐ {labour.avgRating || 0}
                            ({labour.ratingCount || 0})
                        </span>

                        <span>
                            ₹{labour.hourlyRate}/hour
                        </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                        {(labour.distance / 1000).toFixed(2)} km away
                    </p>

                    <button
                        onClick={() =>
                            window.location.href = `/labour/${labour._id}`
                        }
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
                    >
                        View Profile
                    </button>
                </div>
            ))}
        </div>
    )}
</div>

                        </div>
                    ))}

                    {loading && (
                        <div className="text-slate-400 text-sm">
                            Sahyog AI is thinking...
                        </div>
                    )}

                    <div ref={bottomref} />
                </div>

                <form
                    onSubmit={handlesend}
                    className="flex gap-2 border-t border-slate-800 pt-4"
                >
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setmessage(e.target.value)}
                        placeholder="Describe your problem..."
                        className="flex-1 bg-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        disabled={loading || !message.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 rounded-xl"
                    >
                        Send
                    </button>
                </form>

            </div>
        </div>
    );
}

export default SahyogAI;
