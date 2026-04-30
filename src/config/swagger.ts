import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Car Rental System API",
      version: "1.0.0",
      description:
        "API documentation for the Car Rental System with Better Auth, agent fleet management, booking, and payments.",
    },
    servers: [
      {
        url: "/",
        description: "Base server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
        },
      },
      schemas: {
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            total: { type: "integer", example: 35 },
            totalPages: { type: "integer", example: 4 },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["USER", "AGENT", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        AgentProfile: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            businessName: { type: "string" },
            businessPhone: { type: "string", nullable: true },
            officeAddress: { type: "string", nullable: true },
          },
        },
        Car: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            brand: { type: "string" },
            model: { type: "string" },
            type: { type: "string" },
            fuelType: {
              type: "string",
              nullable: true,
              enum: ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"],
            },
            transmission: {
              type: "string",
              nullable: true,
              enum: ["MANUAL", "AUTOMATIC"],
            },
            description: { type: "string", nullable: true },
            seats: { type: "integer", nullable: true },
            doors: { type: "integer", nullable: true },
            color: { type: "string", nullable: true },
            ownerId: { type: "string", format: "uuid", nullable: true },
            pricePerDay: { type: "number" },
            available: { type: "boolean" },
            images: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  url: { type: "string" },
                },
              },
            },
          },
        },
        Booking: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            carId: { type: "string", format: "uuid" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            status: { type: "string", enum: ["PENDING", "CONFIRMED", "CANCELLED"] },
          },
        },
        Payment: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            bookingId: { type: "string", format: "uuid" },
            amount: { type: "number" },
            status: { type: "string", enum: ["PENDING", "SUCCESS", "FAILED"] },
            method: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        PaymentResponse: {
          type: "object",
          properties: {
            result: {
              type: "object",
              properties: {
                id: { type: "string" },
                url: { type: "string" },
              }
            }
          },
        },
      },
    },
    paths: {
      "/api/auth/sign-up/email": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8 },
                  },
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
      "/api/auth/sign-in/email": {
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
          summary: "Get fleet with filters and pagination",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 100 } },
            { name: "brand", in: "query", schema: { type: "string" } },
            { name: "model", in: "query", schema: { type: "string" } },
            { name: "type", in: "query", schema: { type: "string" } },
            { name: "fuelType", in: "query", schema: { type: "string", enum: ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"] } },
            { name: "transmission", in: "query", schema: { type: "string", enum: ["MANUAL", "AUTOMATIC"] } },
            { name: "minPrice", in: "query", schema: { type: "number" } },
            { name: "maxPrice", in: "query", schema: { type: "number" } },
            { name: "seats", in: "query", schema: { type: "integer" } },
            { name: "available", in: "query", schema: { type: "boolean" } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "sortBy", in: "query", schema: { type: "string", enum: ["pricePerDay", "createdAt"], default: "createdAt" } },
            { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
          ],
          responses: {
            200: {
              description: "Paginated list of cars",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      cars: { type: "array", items: { $ref: "#/components/schemas/Car" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Cars"],
          summary: "Create a car (Agent/Admin)",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["brand", "model", "type", "pricePerDay"],
                  properties: {
                    brand: { type: "string" },
                    model: { type: "string" },
                    type: { type: "string" },
                    fuelType: { type: "string", enum: ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"] },
                    transmission: { type: "string", enum: ["MANUAL", "AUTOMATIC"] },
                    description: { type: "string" },
                    seats: { type: "integer" },
                    doors: { type: "integer" },
                    color: { type: "string" },
                    pricePerDay: { type: "number" },
                    available: { type: "boolean" },
                    ownerId: {
                      type: "string",
                      format: "uuid",
                      description: "Optional for admin. Ignored for agents (auto set to current agent).",
                    },
                    images: {
                      type: "array",
                      items: { type: "string", format: "binary" },
                    },
                  },
                },
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
      "/api/cars/my": {
        get: {
          tags: ["Cars"],
          summary: "Get cars owned by current agent/admin",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 100 } },
            { name: "sortBy", in: "query", schema: { type: "string", enum: ["pricePerDay", "createdAt"], default: "createdAt" } },
            { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
          ],
          responses: {
            200: {
              description: "Paginated list of owned cars",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      cars: { type: "array", items: { $ref: "#/components/schemas/Car" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
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
          summary: "Update car details (Agent/Admin)",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    brand: { type: "string" },
                    model: { type: "string" },
                    type: { type: "string" },
                    fuelType: { type: "string", enum: ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"] },
                    transmission: { type: "string", enum: ["MANUAL", "AUTOMATIC"] },
                    description: { type: "string" },
                    seats: { type: "integer" },
                    doors: { type: "integer" },
                    color: { type: "string" },
                    pricePerDay: { type: "number" },
                    available: { type: "boolean" },
                    ownerId: { type: "string", format: "uuid" },
                    images: {
                      type: "array",
                      items: { type: "string", format: "binary" },
                    },
                  },
                },
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
          summary: "Delete car (Agent/Admin)",
          security: [{ cookieAuth: [] }],
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
          security: [{ cookieAuth: [] }],
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
            201: { 
              description: "Booking created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      booking: { $ref: "#/components/schemas/Booking" }
                    }
                  }
                }
              }
            },
            400: { description: "Invalid dates" },
            404: { description: "Car not available" },
            409: { description: "Car already booked" },
          },
        },
      },
      "/api/bookings/my": {
        get: {
          tags: ["Bookings"],
          summary: "Get my bookings (paginated)",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 100 } },
          ],
          responses: {
            200: { 
              description: "List of my bookings",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      bookings: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Booking" }
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    }
                  }
                }
              }
             },
          },
        },
      },
      "/api/bookings/agent": {
        get: {
          tags: ["Bookings"],
          summary: "Get bookings for my cars (Agent/Admin)",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 100 } },
          ],
          responses: {
            200: {
              description: "Paginated list of bookings for owned cars",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      bookings: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Booking" },
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/bookings/{id}": {
        delete: {
          tags: ["Bookings"],
          summary: "Cancel booking",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { 
              description: "Booking cancelled",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      booking: { $ref: "#/components/schemas/Booking" }
                    }
                  }
                }
              }
            },
            400: { description: "Booking already cancelled" },
            403: { description: "Cannot cancel other user's booking" },
            404: { description: "Booking not found" },
          },
        },
      },
      "/api/payments": {
        get: {
          tags: ["Payments"],
          summary: "List payments (role-scoped, paginated)",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 100 } },
          ],
          responses: {
            200: {
              description: "Paginated payments list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      payments: { type: "array", items: { $ref: "#/components/schemas/Payment" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
        post: {
          tags: ["Payments"],
          summary: "Initiate payment for a booking using Polar checkout",
          security: [{ cookieAuth: [] }],
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
            201: { 
              description: "Payment initiated and checkout URL generated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PaymentResponse" }
                }
              }
            },
            400: { description: "Invalid booking or not pending" },
            403: { description: "Cannot pay for other user's booking" },
            404: { description: "Booking not found" },
          },
        },
      },
      "/api/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get current authenticated user",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Current user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/users/register-agent": {
        post: {
          tags: ["Users"],
          summary: "Register the current user as an agent",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["businessName"],
                  properties: {
                    businessName: { type: "string" },
                    businessPhone: { type: "string" },
                    officeAddress: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Agent registration successful" },
            400: { description: "Invalid request" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/users": {
        get: {
          tags: ["Users"],
          summary: "List users (Admin all users; Agent booking-related users)",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Users list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      users: { type: "array", items: { $ref: "#/components/schemas/User" } },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
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
