import axios from "axios";
const API_BASE_URL = "http://localhost:8001";
const FLASK_API_BASE_URL = "http://127.0.0.1:5000";
const api = axios.create({
  baseURL: API_BASE_URL || "/",
});
export const flaskServerAPI = axios.create({
  baseURL: FLASK_API_BASE_URL || "http://127.0.0.1:5000",
});
export default api;
