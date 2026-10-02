import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8080/sahyog",
  withCredentials: true, // required so the session cookie is sent/stored
});

export default api;