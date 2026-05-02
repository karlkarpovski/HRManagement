import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // URL của Backend Flask
});

export default api;