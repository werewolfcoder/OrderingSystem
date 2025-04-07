import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

export default function QRScanPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const hotel = params.get("hotel");
    const table = params.get("table");

    const fetchTokenAndRedirect = async () => {
      try {
        const response = await axios.post("http://localhost:5000/user/getTokenFromQR", {
          hotelName: hotel,
          tableNumber: table,
        });

        const token = response.data.token;
        localStorage.setItem("guestToken", token); // ✅ Store actual JWT token

        navigate("/"); // ✅ Redirect to menu page
      } catch (err) {
        console.error("Failed to get token from QR:", err);
        // Optional: show error or redirect to error page
      }
    };

    if (hotel && table) {
      fetchTokenAndRedirect();
    }
  }, [params, navigate]);

  return null; // No UI since it's auto-redirect
}
