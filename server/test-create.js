// Quick test script to POST /createProduct using Node fetch
const url = process.env.URL || 'http://localhost:4000/createProduct';

async function main() {
	const payload = {
		name: 'Test Wrench',
		category: 'Tools',
		quantity: 5,
		urgency: 'High',
		section: 'Maintenance',
		budget: 100,
		requiredBy: '2025-10-01',
		justification: 'Routine maintenance'
	};
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	const text = await res.text();
	console.log('STATUS', res.status);
	console.log(text);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});


