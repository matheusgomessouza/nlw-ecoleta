import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3333' //caso fazer deploy mudar essa baseURL para o domain 
});

export default api;