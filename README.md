# 🚗 Car Rental API

### CAR RENTAL SYSTEM - BACKEND 

#### Tech Stack: Node.js | BetterAuth + polar-sh | TypeScript | SQLite | Prisma ORM


## 🔐 Auth

### Register
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}

### Login
POST /auth/login
{
  "email": "john@example.com",
  "password": "123456"
}

---

## 🚘 Cars

### Get All Cars
GET /cars
Query:
- type
- PricePerDay
- isAvailable

### Get Car
GET /cars/:id

### Create Car (Admin)
POST /cars
{
  "brand": "Toyota",
  "model": "CHR",
  "type": "suv",
  "pricePerDay": 1800,
  "available": true
}

### Update Car (Admin)
PUT /cars/:id

### Delete Car (Admin)
DELETE /cars/:id

---

## 📅 Bookings

### Create Booking
POST /bookings
{
  "carId": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD"
}

### My Bookings
GET /bookings/my

### Cancel Booking
DELETE /bookings/:id

---

## 💳 Payments

Payments creation done by using better-auth + polat-sh combo. it makes the payment process very easy. but you can add any better improvment on it.

### Make Payment
POST /payments
{
  "bookingId": "string",
  "method": "card"
}

---

## 🔑 Auth Header
Authorization: Bearer <token>

---

## ⚠️ Rules
- No double booking
- Admin-only routes require role
- Booking must be paid to confirm

---

## ❌ Errors
{
  "error": "Message"
}

## contribution? wellcome.
- fork this repo 
- create a branch with your feature name
- write a test and test your feature 
- commit to your branch
- open a pull-request 
* DONE!