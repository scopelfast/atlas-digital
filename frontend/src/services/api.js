import axios from "axios";

// Em dev: REACT_APP_BACKEND_URL vazio => baseURL indefinido; paths que começam com "/" são relativos à raiz do site (ex.: :3000 + proxy → API).
// Não usar window.location.origin como baseURL: pedidos absolutos podem comportar-se de forma diferente no browser/proxy em relação a headers.
const apiBase = (process.env.REACT_APP_BACKEND_URL || "").trim();

const api = axios.create({
	baseURL: apiBase || undefined,
	withCredentials: true,
});

// Garante paths relativos sem "/" na raiz correcta (defesa em profundidade)
api.interceptors.request.use((config) => {
	const u = config.url;
	if (typeof u === "string" && u.length > 0 && !/^https?:\/\//i.test(u) && u[0] !== "/") {
		config.url = `/${u}`;
	}
	return config;
});

export const openApi = axios.create({
	baseURL: apiBase || undefined,
});

openApi.interceptors.request.use((config) => {
	const u = config.url;
	if (typeof u === "string" && u.length > 0 && !/^https?:\/\//i.test(u) && u[0] !== "/") {
		config.url = `/${u}`;
	}
	return config;
});

export default api;
