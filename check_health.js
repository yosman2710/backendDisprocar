async function checkBackend() {
    const endpoints = [
        '/',
        '/orden-compra',
        '/orden-compra/pendientes-caliente',
        '/orden-compra/pendientes-frio'
    ];

    console.log("Checking backend connection (http://localhost:3001)...");

    for (const endpoint of endpoints) {
        try {
            console.log(`\nTesting ${endpoint}...`);
            const response = await fetch(`http://localhost:3001${endpoint}`);
            console.log(`Status: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                console.log(`Data (truncated):`, JSON.stringify(data).substring(0, 100));
            } else {
                const text = await response.text();
                console.log(`Response body:`, text.substring(0, 100));
            }
        } catch (err) {
            console.error(`FAILED to connect to ${endpoint}:`, err.message);
        }
    }
}

checkBackend();
