import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Car Rental System API",
      version: "1.0.0",
      description: "API documentation for the Car Rental System",
    },
    servers: [
      {
        url: "/api",
        description: "API Endpoints (/api)",
      },
      {
        url: "/auth",
        description: "Auth Endpoints (/auth)",
      },
      {
        url: "/",
        description: "Root",
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
          },
        },
        Car: {
          type: "object",
          properties: {
            brand: { type: "string" },
            model: { type: "string" },
            type: { type: "string" },
            pricePerDay: { type: "number" },
            available: { type: "boolean" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          responses: {
            201: { description: "User registered successfully" },
            400: { description: "Validation error" },
            409: { description: "Email already registered" },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful" },
            400: { description: "Invalid credentials" },
          },
        },
      },
      "/api/cars": {
        get: {
          tags: ["Cars"],
          summary: "Get all cars",
          responses: {
            200: { description: "List of cars" },
          },
        },
        post: {
          tags: ["Cars"],
          summary: "Create a new car (Admin only)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Car" },
              },
            },
          },
          responses: {
            201: { description: "Car created" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/cars/{id}": {
        get: {
          tags: ["Cars"],
          summary: "Get car by ID",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Car details" },
            404: { description: "Car not found" },
          },
        },
        put: {
          tags: ["Cars"],
          summary: "Update car details (Admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Car" },
              },
            },
          },
          responses: {
            200: { description: "Car updated" },
            401: { description: "Unauthorized" },
          },
        },
        delete: {
          tags: ["Cars"],
          summary: "Delete car (Admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            204: { description: "Car deleted" },
            404: { description: "Car not found" },
          },
        },
      },
      "/api/bookings": {
        post: {
          tags: ["Bookings"],
          summary: "Create a booking",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    carId: { type: "string", format: "uuid" },
                    startDate: { type: "string", format: "date-time" },
                    endDate: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Booking created" },
            400: { description: "Invalid dates" },
            409: { description: "Car already booked" },
          },
        },
      },
      "/api/bookings/my": {
        get: {
          tags: ["Bookings"],
          summary: "Get my bookings",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "List of my bookings" },
          },
        },
      },
      "/api/bookings/{id}": {
        delete: {
          tags: ["Bookings"],
          summary: "Cancel booking",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Booking cancelled" },
            403: { description: "Cannot cancel other user's booking" },
          },
        },
      },
      "/api/payments": {
        post: {
          tags: ["Payments"],
          summary: "Make a payment for a booking",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    bookingId: { type: "string", format: "uuid" },
                    method: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Payment successful" },
            400: { description: "Invalid booking or not pending" },
          },
        },
      },
    },
  },
  apis: [], // Defined inline above
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
