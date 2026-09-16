import http from 'node:http';

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

let cookie = '';

function request(method, path, body = null, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = body ? JSON.stringify(body) : '';

    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    if (cookie) {
      headers['Cookie'] = cookie;
    }

    if (body) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let data = '';
        const setCookieHeader = res.headers['set-cookie'];
        if (setCookieHeader) {
          cookie = setCookieHeader[0].split(';')[0];
        }

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING SHOPKART AUTHENTICATION API SUITE ---');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`✅ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAILED: ${testName} - ${details}`);
    }
  }

  try {
    // 1. Missing fields registration
    const res1 = await request('POST', '/customers/register', {
      fullName: 'Test User'
    });
    assert(res1.status === 400, 'Register with missing fields returns 400', JSON.stringify(res1.body));

    // 2. Password too short (< 6 chars)
    const res2 = await request('POST', '/customers/register', {
      fullName: 'Test User',
      email: 'test@example.com',
      password: '123',
      phone: '9876543210'
    });
    assert(res2.status === 400, 'Register with short password (< 6 chars) returns 400', JSON.stringify(res2.body));

    // 3. Valid Registration
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const res3 = await request('POST', '/customers/register', {
      fullName: 'John Doe',
      email: uniqueEmail,
      password: 'password123',
      phone: '9876543210'
    });
    assert(res3.status === 201 && res3.body.success === true, 'Valid Customer Registration returns 201', JSON.stringify(res3.body));
    assert(res3.body.customer && !res3.body.customer.password, 'Registration response excludes password field');

    // 4. Duplicate Email Registration
    const res4 = await request('POST', '/customers/register', {
      fullName: 'John Dup',
      email: uniqueEmail,
      password: 'password123',
      phone: '9876543210'
    });
    assert(res4.status === 409, 'Duplicate email registration returns 409 Conflict', JSON.stringify(res4.body));

    // 5. Invalid Credentials Login
    const res5 = await request('POST', '/customers/login', {
      email: uniqueEmail,
      password: 'wrongpassword'
    });
    assert(res5.status === 401, 'Invalid credentials login returns 401 Unauthorized', JSON.stringify(res5.body));

    // 6. Valid Login
    const res6 = await request('POST', '/customers/login', {
      email: uniqueEmail,
      password: 'password123'
    });
    assert(res6.status === 200 && res6.body.success === true, 'Valid Login returns 200 OK', JSON.stringify(res6.body));
    assert(!!cookie, 'Login issues HttpOnly token cookie');

    // 7. Get Profile (Authenticated)
    const res7 = await request('GET', '/customers/me');
    assert(res7.status === 200 && res7.body.email === uniqueEmail, 'GET /customers/me returns authenticated customer profile', JSON.stringify(res7.body));

    // 8. Bonus: Change Password
    const res8 = await request('PATCH', '/customers/change-password', {
      oldPassword: 'password123',
      newPassword: 'newpassword123'
    });
    assert(res8.status === 200 && res8.body.success === true, 'PATCH /customers/change-password succeeds with valid old password', JSON.stringify(res8.body));

    // 9. Login with New Password
    cookie = ''; // reset cookie
    const res9 = await request('POST', '/customers/login', {
      email: uniqueEmail,
      password: 'newpassword123'
    });
    assert(res9.status === 200, 'Login with newly updated password succeeds', JSON.stringify(res9.body));

    // 10. Logout
    const res10 = await request('POST', '/customers/logout');
    assert(res10.status === 200 && res10.body.success === true, 'POST /customers/logout clears session', JSON.stringify(res10.body));

    console.log(`\n-----------------------------------`);
    console.log(`SUMMARY: ${passed}/${total} TESTS PASSED`);
    console.log(`-----------------------------------`);

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
