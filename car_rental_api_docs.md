# 🚗 Car Rental System API Documentation

## Base URL
```
https://api.carrental.com/v1
```

## Authentication
All protected routes require JWT token:

```
Authorization: Bearer <token>
```

---

## 🔐 Auth

### Register
POST /auth/register

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

### Login
POST /auth/login

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

---

## 🚘 Cars

### Get All Cars
GET /cars

Query:
- type
- minPrice
- maxPrice
- available

### Get Car By ID
GET /cars/:id

### Create Car (Admin)
POST /cars

### Update Car (Admin)
PUT /cars/:id

### Delete Car (Admin)
DELETE /cars/:id

---

## 📅 Bookings

### Create Booking
POST /bookings

```json
{
  "carId": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD"
}
```

### Get My Bookings
GET /bookings/my

### Cancel Booking
DELETE /bookings/:id

---

## 💳 Payments

### Make Payment
POST /payments

```json
{
  "bookingId": "string",
  "method": "card"
}
```

---

## ⚠️ Errors

```json
{
  "error": "Message here"
}
```

Status Codes:
- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 500 Server Error

---

## 📌 Notes
- No double booking allowed
- Admin-only endpoints require role check
- Booking must be paid to confirm
