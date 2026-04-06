import { prisma } from "./src/config/prisma";
import fetch from "node-fetch";

const API_URL = "http://localhost:5000";

async function testPaymentAndRentingLogic() {
  console.log("Starting Payment & Renting Logic Integration Test...");
  
  const userEmail = `paytest_${Date.now()}@example.com`;
  
  // 1. Create a user via API
  const regRes = await fetch(`${API_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Pay Test", email: userEmail, password: "password123" }),
  });
  
  const cookies = regRes.headers.raw()['set-cookie'];
  const cookieHeader = cookies ? cookies.map((c: string) => c.split(';')[0]).join('; ') : "";
  
  // 2. Create a car directly using Prisma for the test
  const car = await prisma.car.create({
    data: {
      brand: "TestBrand",
      model: "TestModel",
      type: "SUV",
      pricePerDay: 100,
      available: true
    }
  });
  console.log(`✅ Created test car: ${car.id}`);

  // 3. Create a Booking via API
  const startDate = new Date();
  const endDate = new Date(Date.now() + 86400000 * 2); // 2 days
  
  const bookRes = await fetch(`${API_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
    body: JSON.stringify({
      carId: car.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })
  });
  
  const bookData = await bookRes.json();
  if (!bookRes.ok) throw new Error("Booking failed: " + JSON.stringify(bookData));
  
  const bookingId = bookData.booking.id;
  console.log(`✅ Created booking (PENDING): ${bookingId}`);

  // 4. Initiate Payment
  const payRes = await fetch(`${API_URL}/api/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
    body: JSON.stringify({ bookingId, method: "card" })
  });
  
  const payData = await payRes.json();
  if (!payRes.ok) throw new Error("Payment init failed: " + JSON.stringify(payData));
  
  console.log(`✅ Payment checkout initiated successfully: ${payData.result?.url}`);

  // 5. Simulate Webhook (Updating DB directly since Polar signature is required for the real API)
  await prisma.payment.create({
    data: {
      bookingId: bookingId,
      amount: 200,
      method: "polar",
      status: "SUCCESS"
    }
  });
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" }
  });
  console.log(`✅ Simulated Webhook updating booking status to CONFIRMED.`);

  // 6. Test Renting Logic (Overlap Prevention)
  // Attempt to book the same car for overlapping dates
  const overlapBookRes = await fetch(`${API_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
    body: JSON.stringify({
      carId: car.id,
      startDate: new Date(Date.now() + 86400000).toISOString(), // Starts tomorrow (overlaps)
      endDate: new Date(Date.now() + 86400000 * 3).toISOString() // Ends in 3 days
    })
  });

  if (overlapBookRes.status === 409) {
    console.log(`✅ Renting logic validated: Overlapping booking correctly rejected (409).`);
  } else {
    throw new Error(`Expected 409 Conflict for overlap, got ${overlapBookRes.status}`);
  }

  // Cleanup
  console.log("\nCleaning up test data...");
  await prisma.car.delete({ where: { id: car.id } });
  
  console.log("🎉 All Payment Integration tests completed successfully!");
}

testPaymentAndRentingLogic().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
