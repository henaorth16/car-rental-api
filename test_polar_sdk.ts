import { polarClient } from "./src/modules/auth/auth";

async function test() {
  try {
    const product = await polarClient.products.create({
      name: `Booking Test`,
      prices: [
        {
          amountType: "fixed",
          priceAmount: 2000,
          priceCurrency: "usd",
        },
      ],
    });
    console.log("Product:", product.id);

    const checkout = await polarClient.checkouts.create({
      products: [product.id],
      customerEmail: "user@example.com",
      successUrl: "http://localhost/success",
    });

    console.log("Checkout URL:", checkout.url);
  } catch (e: any) {
    console.error("Error", e?.cause || e);
  }
}
test();
