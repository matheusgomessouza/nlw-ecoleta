import axios from 'axios';

const api = axios.create({
	baseURL: 'http://localhost:3333' 
	// Caso fazer deploy mudar essa baseURL para o domain , on deploy..change URL
});

export default api;