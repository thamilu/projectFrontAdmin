const https = require('https');
const http = require('http');

const keycloakUrl = 'http://127.0.0.1:8080/realms/eshop-admin/.well-known/openid-configuration';

console.log(`Testing connection to: ${keycloakUrl}`);

const req = http.get(keycloakUrl, (res) => {
  console.log(`StatusCode: ${res.statusCode}`);
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Body snippet:', data.substring(0, 200));
    console.log('Connection Successful!');
  });
});

req.on('error', (e) => {
  console.error(`Connection Failed: ${e.message}`);
  if (e.code === 'ECONNREFUSED') {
    console.log('Hint: Keycloak is not running or not listening on this port.');
  } else if (e.code === 'ETIMEDOUT') {
    console.log('Hint: Firewall or network issue blocking the connection.');
  }
});

req.setTimeout(5000, () => {
    console.log('Request Timed Out (5s limit)');
    req.destroy();
});
