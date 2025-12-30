#!/usr/bin/env node

// Test Research Scanner API
const https = require('https');

console.log('🔬 TESTING RESEARCH SCANNER API');
console.log('===============================');
console.log('');

// Test the cron endpoint with correct authorization
const testCronEndpoint = () => {
    console.log('📡 Testing Cron Endpoint...');

    const options = {
        hostname: 'cbd-portal.vercel.app',
        port: 443,
        path: '/api/cron/research-scan',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer 8ba433b9ee9dbc0c2d9c930effb9530a77003ef975c61d6175f888e94bf61369'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log('✅ Research scanner is working!');
                const result = JSON.parse(data);
                console.log(`📊 Results: Added: ${result.added}, Skipped: ${result.skipped}, Total: ${result.total}`);
            } else if (res.statusCode === 401) {
                console.log('❌ Still getting 401 - CRON_SECRET might be incorrect');
            } else {
                console.log(`Response: ${data}`);
            }
            console.log('');

            // Also test the admin trigger endpoint
            testAdminEndpoint();
        });
    });

    req.on('error', (e) => {
        console.log(`❌ Request error: ${e.message}`);
        testAdminEndpoint();
    });

    req.end();
};

// Test admin trigger endpoint structure
const testAdminEndpoint = () => {
    console.log('🔧 Testing Admin Endpoint Structure...');

    const options = {
        hostname: 'cbd-portal.vercel.app',
        port: 443,
        path: '/api/admin/trigger-scan',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`Admin Trigger Status: ${res.statusCode}`);
            if (res.statusCode === 401) {
                console.log('✅ Admin endpoint properly requires authentication');
            } else if (res.statusCode === 403) {
                console.log('✅ Admin endpoint properly requires admin privileges');
            } else {
                console.log(`Response: ${data}`);
            }

            console.log('');
            console.log('🎯 NEXT STEPS:');
            console.log('1. Log into admin interface: https://cbd-portal.vercel.app/admin/research');
            console.log('2. Click "Manual Scan" button to test the research scanner');
            console.log('3. Check if research items appear in the queue');
            console.log('');
            console.log('💡 TIP: The admin interface will show you the actual scan results!');
        });
    });

    req.on('error', (e) => {
        console.log(`❌ Request error: ${e.message}`);
    });

    req.end();
};

// Start testing
testCronEndpoint();