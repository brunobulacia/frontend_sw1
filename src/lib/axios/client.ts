import axios from "axios";

export const api = axios.create({
  baseURL: "/api", // llamar a tus rutas API internas de Next
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 60000, // 60 segundos para Claude API
});

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);
