import http from 'node:http';

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = body ? JSON.stringify(body) : '';

    const headers = {
      'Content-Type': 'application/json'
    };

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
          resolve({ status: res.statusCode, body: parsed });
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

async function runLab03Tests() {
  console.log('--- STARTING SHOPKART LAB-03 PRODUCT API SUITE ---');

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
    // 1. Missing required field -> 400
    const res1 = await request('POST', '/products', {
      name: 'Test Product',
      price: 100
    });
    assert(res1.status === 400, 'POST /products with missing fields returns 400', JSON.stringify(res1.body));

    // 2. Invalid price (0 or negative) -> 400
    const res2 = await request('POST', '/products', {
      name: 'Bad Price Item',
      description: 'Test description',
      price: -50,
      category: 'Electronics',
      image: 'https://example.com/item.jpg',
      stock: 5
    });
    assert(res2.status === 400, 'POST /products with invalid price (<= 0) returns 400', JSON.stringify(res2.body));

    // 3. Invalid stock (< 0) -> 400
    const res3 = await request('POST', '/products', {
      name: 'Bad Stock Item',
      description: 'Test description',
      price: 150,
      category: 'Electronics',
      image: 'https://example.com/item.jpg',
      stock: -1
    });
    assert(res3.status === 400, 'POST /products with invalid stock (< 0) returns 400', JSON.stringify(res3.body));

    // 4. Valid Product Creation -> 201
    const newProductData = {
      name: `Gaming Monitor ${Date.now()}`,
      description: '27-inch 144Hz 1ms Gaming Monitor.',
      price: 18999,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      stock: 8
    };
    const res4 = await request('POST', '/products', newProductData);
    assert(res4.status === 201 && res4.body.success === true, 'POST /products with valid data returns 201 Created', JSON.stringify(res4.body));
    const createdProductId = res4.body.product?._id;

    // 5. Get All Products -> 200
    const res5 = await request('GET', '/products');
    assert(res5.status === 200 && res5.body.success === true && Array.isArray(res5.body.products), 'GET /products returns array of products', JSON.stringify(res5.body));

    // 6. Search Products -> GET /products?search=Keyboard
    const res6 = await request('GET', '/products?search=Keyboard');
    assert(res6.status === 200 && res6.body.products.every(p => p.name.toLowerCase().includes('keyboard')), 'GET /products?search=... performs case-insensitive search', JSON.stringify(res6.body));

    // 7. Category Filter -> GET /products?category=Electronics
    const res7 = await request('GET', '/products?category=Electronics');
    assert(res7.status === 200 && res7.body.products.every(p => p.category.toLowerCase() === 'electronics'), 'GET /products?category=... filters by category', JSON.stringify(res7.body));

    // 8. Combined Search + Category Filter
    const res8 = await request('GET', '/products?search=Headphones&category=Electronics');
    assert(res8.status === 200 && Array.isArray(res8.body.products), 'GET /products?search=...&category=... applies combined filters', JSON.stringify(res8.body));

    // 9. Price Sort Ascending (Bonus)
    const res9 = await request('GET', '/products?sort=price_asc');
    let isSortedAsc = true;
    for (let i = 0; i < res9.body.products.length - 1; i++) {
      if (res9.body.products[i].price > res9.body.products[i + 1].price) {
        isSortedAsc = false;
        break;
      }
    }
    assert(res9.status === 200 && isSortedAsc, 'GET /products?sort=price_asc sorts by price ascending (Bonus)', JSON.stringify(res9.body));

    // 10. Price Sort Descending (Bonus)
    const res10 = await request('GET', '/products?sort=price_desc');
    let isSortedDesc = true;
    for (let i = 0; i < res10.body.products.length - 1; i++) {
      if (res10.body.products[i].price < res10.body.products[i + 1].price) {
        isSortedDesc = false;
        break;
      }
    }
    assert(res10.status === 200 && isSortedDesc, 'GET /products?sort=price_desc sorts by price descending (Bonus)', JSON.stringify(res10.body));

    // 11. Get Single Product by ID -> 200
    const res11 = await request('GET', `/products/${createdProductId}`);
    assert(res11.status === 200 && res11.body.product?._id === createdProductId, 'GET /products/:id returns correct single product', JSON.stringify(res11.body));

    // 12. Get Single Product with Invalid ID -> 400
    const res12 = await request('GET', '/products/invalid-id-123');
    assert(res12.status === 400, 'GET /products/:id with invalid ID format returns 400 Bad Request', JSON.stringify(res12.body));

    // 13. Get Single Product Non-Existent ID -> 404
    const res13 = await request('GET', '/products/66d123abc456789012345678');
    assert(res13.status === 404, 'GET /products/:id with non-existent ID returns 404 Not Found', JSON.stringify(res13.body));

    console.log(`\n-----------------------------------`);
    console.log(`SUMMARY: ${passed}/${total} LAB-03 TESTS PASSED`);
    console.log(`-----------------------------------`);

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Lab 03 test execution error:', err);
    process.exit(1);
  }
}

runLab03Tests();
