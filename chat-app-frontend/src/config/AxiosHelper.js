import axios from "axios";
// configures backend base url
export const baseURL = "http://localhost:8081";
export const httpClient = axios.create({
  baseURL: baseURL,
});
