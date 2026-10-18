const https = require('https');

const API_BASE = 'https://mkprinting-api-751b093a60df.herokuapp.com';

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  const login = await request('POST', '/api/v1/auth/login', {
    email: 'admin@mkprinting.com',
    password: 'Admin@123!'
  });
  console.log('Login:', login.status);
  const token = login.data.accessToken || login.data.token;

  const ordersRes = await request('GET', '/api/v1/orders', null, token);
  console.log('Orders status:', ordersRes.status);
  console.log('Orders data:', JSON.stringify(ordersRes.data, null, 2));

  // Find ORD-2026-7585
  const orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.data || [];
  const target = orders.find(o => o.orderNumber === 'ORD-2026-7585');
  if (target) {
    console.log('\n--- TARGET ORDER DETAILS ---');
    console.log(JSON.stringify(target, null, 2));

    // Try status update
    console.log('\n--- ATTEMPT 1: PATCH /api/v1/orders/' + target.id + '/status with { status: "Approved" } ---');
    const patchRes = await request('PATCH', `/api/v1/orders/${target.id}/status`, { status: 'Approved' }, token);
    console.log('Patch status result:', patchRes.status, patchRes.data);

    // Try approve endpoint
    console.log('\n--- ATTEMPT 2: POST /api/v1/orders/' + target.id + '/approve ---');
    const approveRes = await request('POST', `/api/v1/orders/${target.id}/approve`, {}, token);
    console.log('Approve result:', approveRes.status, approveRes.data);
  }
}

main().catch(console.error);
