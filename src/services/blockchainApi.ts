const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';

export async function apiCreateProduct(payload: {
	name: string;
	category: string;
	quantity: number;
	urgency: string;
	section: string;
	budget: number;
	requiredBy: string;
	justification: string;
}) {
	const res = await fetch(`${API_BASE}/createProduct`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	return res.json();
}

export async function apiUpdateProduct(payload: { id: number; status: string }) {
	const res = await fetch(`${API_BASE}/updateProduct`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	return res.json();
}

export async function apiApproveProduct(payload: { id: number }) {
	const res = await fetch(`${API_BASE}/approveProduct`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	return res.json();
}

export async function apiGetProducts() {
	const res = await fetch(`${API_BASE}/getProducts`);
	return res.json();
}


