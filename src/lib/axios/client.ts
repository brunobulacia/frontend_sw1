import axios from "axios";

export const api = axios.create({
  baseURL: "/api", // llamar a tus rutas API internas de Next
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);
