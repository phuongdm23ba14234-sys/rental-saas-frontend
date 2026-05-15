const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://rental-saas-backend.onrender.com";

export const ROOMS_API_URL = `${API_BASE_URL.replace(/\/$/, "")}/rooms`;
