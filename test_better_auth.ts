import { auth } from "./src/modules/auth/auth";

async function test() {
  try {
    const req = new Request("http://localhost/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: `test_${Date.now()}@example.com`,
        password: "password123"
      })
    });
    const result = await auth.handler(req);
    console.log("Status:", result.status);
    console.log("Body:", await result.text());
  } catch (e: any) {
    console.error("Detailed Error:", e);
    if (e.cause) console.error("Cause:", e.cause);
  }
}
test();
