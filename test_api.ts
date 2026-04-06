import fetch from "node-fetch";

const API_URL = "http://localhost:5000";
let sessionCookies: { admin?: string; user?: string } = {};

function getCookie(res: any) {
  const cookies = res.headers.raw()['set-cookie'];
  return cookies ? cookies.map((c: string) => c.split(';')[0]).join('; ') : "";
}

async function testApi() {
  console.log("Starting API tests...");
  let user1Email = `user1_${Date.now()}@example.com`;
  let adminEmail = `admin_${Date.now()}@example.com`;

  // 1. Register User
  console.log("\n--- Testing Auth ---");
  const regUser = await fetch(`${API_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "User 1", email: user1Email, password: "password123" }),
  });
  const regUserJson = await regUser.json();
  if (regUser.ok) {
    console.log("✅ Register User OK");
    sessionCookies.user = getCookie(regUser) || sessionCookies.user;
  } else {
    console.error("❌ Register User Failed", regUserJson);
  }

  // Register Admin
  const regAdmin = await fetch(`${API_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Admin", email: adminEmail, password: "password123" }),
  });
  const regAdminJson = await regAdmin.json();
  if (regAdmin.ok) {
    sessionCookies.admin = getCookie(regAdmin) || sessionCookies.admin;
  }

  // 2. Login User
  const loginRes = await fetch(`${API_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user1Email, password: "password123" }),
  });
  if (loginRes.ok) {
    console.log("✅ Login User OK");
    sessionCookies.user = getCookie(loginRes) || sessionCookies.user;
  } else {
    console.error("❌ Login User Failed", await loginRes.json());
  }
  
  // 3. Test Cars Get
  console.log("\n--- Testing Cars ---");
  const getCars = await fetch(`${API_URL}/api/cars`);
  if (getCars.ok) console.log("✅ Get Cars OK");
  else console.error("❌ Get Cars Failed", await getCars.json());

  // 4. Test Cars Create (Assuming any logged-in user can create a car for now because roleMiddleware is not strictly applied or wait, let's test if it works)
  const createCar = await fetch(`${API_URL}/api/cars`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": sessionCookies.admin || "" },
    body: JSON.stringify({ brand: "Tesla", model: "Model S", type: "Sedan", pricePerDay: 150.0 }),
  });
  const carJson = await createCar.json();
  let carId;
  if (createCar.ok) {
    console.log("✅ Create Car OK");
    carId = carJson.car?.id;
  } else {
    console.error("❌ Create Car Failed", carJson);
  }

  // 5. Test Bookings
  if (carId) {
    console.log("\n--- Testing Bookings ---");
    const bookRes = await fetch(`${API_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": sessionCookies.user || "" },
      body: JSON.stringify({ 
        carId, 
        startDate: new Date().toISOString(), 
        endDate: new Date(Date.now() + 86400000).toISOString() 
      }),
    });
    const bookJson = await bookRes.json();
    if (bookRes.ok) {
      console.log("✅ Create Booking OK");
      const bookingId = bookJson.booking?.id;
      
      // 6. Test Payments
      console.log("\n--- Testing Payments ---");
      const payRes = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cookie": sessionCookies.user || "" },
        body: JSON.stringify({ bookingId, method: "card" }),
      });
      if (payRes.ok) {
        const payJson = await payRes.json();
        if (payJson.url && payJson.url.includes("checkout")) {
          console.log("✅ Make Payment OK (Checkout URL generated)");
        } else {
          console.error("❌ Make Payment Failed: No checkout URL returned", payJson);
        }
      } else {
        console.error("❌ Make Payment Failed", await payRes.json());
      }
    } else {
      console.error("❌ Create Booking Failed", bookJson);
    }
  }

  console.log("\nAPI tests finished.");
}

testApi().catch(console.error);
