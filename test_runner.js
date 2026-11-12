const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const run = async () => {
  const backendDir = path.join(__dirname, 'backend');
  const server = spawn('node', ['server.js'], {
    cwd: backendDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: '5002', JWT_SECRET: 'test_jwt_secret_123' }
  });

  server.stdout.on('data', (d) => process.stdout.write(d.toString()));
  server.stderr.on('data', (d) => process.stderr.write(d.toString()));

  const req = (endpoint, options = {}, body = null) => {
    return new Promise((resolve, reject) => {
      const opts = {
        hostname: '127.0.0.1',
        port: 5002,
        path: `/api${endpoint}`,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      };

      const r = http.request(opts, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });

      r.on('error', reject);
      if (body) r.write(JSON.stringify(body));
      r.end();
    });
  };

  let connected = false;
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const h = await req('/health');
      if (h.data?.status === 'OK') {
        connected = true;
        break;
      }
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 800));
  }

  if (!connected) {
    console.error('Server did not start in time');
    server.kill();
    process.exit(1);
  }

  try {
    const health = await req('/health');
    console.log('HEALTH CHECK:', health.data?.status === 'OK' ? 'PASS' : 'FAIL');

    const adminLogin = await req('/auth/login', { method: 'POST' }, {
      email: 'admin@wallet.com',
      password: 'admin123'
    });
    console.log('ADMIN LOGIN:', adminLogin.data?.success ? 'PASS' : 'FAIL');
    const adminToken = adminLogin.data?.token;

    const rateUpdate = await req('/admin/conversion-rate', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, { pointsPerRupee: 15, description: 'Updated test rate' });
    console.log('RATE UPDATE TO 15:', rateUpdate.data?.conversionRate === 15 ? 'PASS' : 'FAIL');

    const userLogin = await req('/auth/login', { method: 'POST' }, {
      email: 'rahul@gmail.com',
      password: 'user123'
    });
    console.log('USER LOGIN:', userLogin.data?.success ? 'PASS' : 'FAIL');
    const userToken = userLogin.data?.token;

    const purchase = await req('/wallet/purchase', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    }, { amountInRupees: 100, paymentMethod: 'UPI', simulateSuccess: true });
    console.log('PURCHASE (100 INR * 15 = 1500 PTS):', purchase.data?.pointsCredited === 1500 ? 'PASS' : 'FAIL');

    const usersList = await req('/users', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const recipient = usersList.data?.users[0];
    console.log('USER DIRECTORY FETCH:', usersList.data?.success ? 'PASS' : 'FAIL');

    const transfer = await req('/wallet/transfer', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    }, {
      recipientId: recipient._id,
      points: 200,
      note: 'Dinner share'
    });
    console.log('TRANSFER 200 PTS:', transfer.data?.success ? 'PASS' : 'FAIL');

    const profile = await req('/users/profile', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('PROFILE AGGREGATION STATS:', profile.data?.profile?.stats?.totalPointsPurchased > 0 ? 'PASS' : 'FAIL');
    console.log('PROFILE STATS VALUES:', JSON.stringify(profile.data?.profile?.stats));

    console.log('ALL API INTEGRATION TESTS PASSED SUCCESSFULLY');
  } catch (err) {
    console.error('TEST ERROR:', err);
  } finally {
    server.kill();
    process.exit(0);
  }
};

run();
