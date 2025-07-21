import axios from 'axios';
import { getToken } from './auth';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

export default instance;