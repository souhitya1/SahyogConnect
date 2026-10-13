import { Link } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav style={{ display: "flex", gap: "16px", padding: "16px", borderBottom: "1px solid #ccc" }}>
            <Link to="/">SahyogConnect</Link>
            {user? (
                <>
                    <span>Welcome, {user.name}</span>
                    {user.role === "user" &&(
                    <>
                    <Link to="/bookings">My booking</Link>
                    </>
                    )}
                    {user.role === "laborer" &&(
                    <>
                    <Link to="/labour">Become a labour</Link>
                    <Link to="/labour-dashboard">My dashboard</Link>
                    </>
                    )}
                    <button onClick={logout}>Logout</button>
                    </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/signup">Signup</Link>
                    
                </>
            )}
        </nav>
    );
}

export default Navbar;