// Quick test script to POST /approveProduct using Node fetch
const url = process.env.URL || 'http://localhost:4000/approveProduct';

async function main() {
	const id = Number(process.env.ID || '1');
	const payload = { id };
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


