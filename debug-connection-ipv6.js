const https = require('https');
const http = require('http');

// Explicit IPv6 loopback
const keycloakUrl = 'http://[::1]:8080/realms/eshop-admin/.well-known/openid-configuration';

console.log(`Testing connection to: ${keycloakUrl}`);

const req = http.get(keycloakUrl, (res) => {
  console.log(`StatusCode: ${res.statusCode}`);
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Body snippet:', data.substring(0, 200));
    console.log('IPv6 Connection Successful!');
  });
});

req.on('error', (e) => {
  console.error(`IPv6 Connection Failed: ${e.message}`);
});

req.setTimeout(5000, () => {
    console.log('Request Timed Out (5s limit)');
    req.destroy();
});
