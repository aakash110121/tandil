# Create Order & Payment – API Spec for Backend Developer

This document describes **how payment works on Place Order** for the mobile app and **exactly what APIs and parameters** the backend must support for each payment option.

**App flow:** User completes Address (step 1) → Payment (step 2) → Review (step 3) → taps **Place Order**. The app then calls **one Create Order API** with different parameters depending on the selected payment method.

---

## 1. Summary: Three Payment Cases

| User selects in app | What app sends on Place Order | What backend must do | What backend returns |
|----------------------|-------------------------------|----------------------|------------------------|
| **Cash on Delivery (COD)** | `payment_method: "cod"` + address + notes | Create order, no payment call. Set `payment_status: "pending"` or `"cod"`. | Order data (id, order_number, status, etc.) |
| **Login with PayPal** | `payment_method: "paypal_login"` + `paypal_order_id` + `paypal_payer_id` + address + notes | Create PayPal order (if not done earlier), **capture** PayPal payment with order ID + payer ID, then create order. | Order data on success; error + message if capture fails. |
| **Pay with Debit/Credit Card** | `payment_method: "paypal_guest_card"` + **payment_token** (from PayPal/Stripe SDK; app does **not** send raw card number) + address + notes | **Charge** the token with your payment provider (e.g. PayPal Guest Checkout, Stripe). On success, create order. | Order data on success; error + message if charge fails. |

---

## 2. Create Order API (Single Endpoint)

- **Method:** `POST`
- **URL:** `{{base_url}}/api/shop/orders` (or `{{base_url}}/api/customer/orders`)
- **Headers:** `Authorization: Bearer <customer_token>`, `Accept: application/json`, `Content-Type: application/json`

**Common request parameters (all cases):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `payment_method` | string | Yes | One of: `"cod"` \| `"paypal_login"` \| `"paypal_guest_card"` |
| `shipping_address_id` | number | Optional* | ID of saved shipping address. |
| `shipping_address` | object | Optional* | If no saved address: `{ fullName, phone, street, city, state, zipCode, country }`. |
| `notes` | string | No | Customer notes. |

\*Backend can require either `shipping_address_id` or `shipping_address` (or both supported).

---

## 3. Case 1: Cash on Delivery (COD)

### 3.1 App steps (no extra API before Place Order)

1. User selects **Cash on Delivery** on Payment step.
2. User fills Address (step 1) and reviews (step 3), then taps **Place Order**.

### 3.2 What app sends on Place Order

```json
{
  "payment_method": "cod",
  "shipping_address_id": 1,
  "notes": "Optional notes"
}
```

Or with inline address:

```json
{
  "payment_method": "cod",
  "shipping_address": {
    "fullName": "Ahmed Hassan",
    "phone": "+971501234567",
    "street": "Sheikh Zayed Road",
    "city": "Dubai",
    "state": "Dubai",
    "zipCode": "12345",
    "country": "UAE"
  },
  "notes": ""
}
```

### 3.3 What backend must do

1. Validate Bearer token and get customer id.
2. Validate cart (e.g. from session/DB for this customer).
3. **Do not call any payment provider.**
4. Create order in DB with status e.g. `pending` or `confirmed`, `payment_status`: `"cod"` or `"pending"`.
5. Clear or update cart as per your business logic.
6. Return order data.

### 3.4 What backend must return (success)

- **HTTP:** `200` or `201`
- **Body (example):**

```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "id": 123,
    "order_number": "ORD-2026-00123",
    "status": "confirmed",
    "payment_status": "cod",
    "total": 130.00,
    "currency": "AED",
    "created_at": "2026-02-20T10:30:00+00:00",
    "items": []
  }
}
```

---

## 4. Case 2: Login with PayPal

### 4.1 App steps (before Place Order)

1. User selects **PayPal** → **Login to PayPal** on Payment step.
2. App calls backend: **Create PayPal order** (see section 4.2).
3. Backend returns `paypal_order_id` and `approval_url`.
4. App opens `approval_url` in browser/WebView. User **logs in to PayPal** and approves payment.
5. PayPal redirects back to app (or SDK returns) with **paypal_order_id** and **paypal_payer_id** (or equivalent).
6. On Review step user taps **Place Order**. App sends these to **Create Order** API.

### 4.2 API backend must provide: Create PayPal order (for “Login with PayPal”)

- **Method:** `POST`
- **URL:** e.g. `{{base_url}}/api/shop/payment/paypal/create`
- **Headers:** `Authorization: Bearer <customer_token>`, `Accept: application/json`, `Content-Type: application/json`

**Request body (example):**

```json
{
  "amount": 130.00,
  "currency": "AED"
}
```

(Amount can come from cart total; app may send it when user proceeds to payment.)

**Response (success):**

```json
{
  "success": true,
  "data": {
    "paypal_order_id": "xxxxx",
    "approval_url": "https://www.sandbox.paypal.com/checkoutnow?token=xxxxx"
  }
}
```

Backend creates the order with PayPal’s API (server-side) and returns the approval URL so the user can complete payment on PayPal.

### 4.3 What app sends on Place Order (Login with PayPal)

```json
{
  "payment_method": "paypal_login",
  "paypal_order_id": "xxxxx",
  "paypal_payer_id": "yyyyy",
  "shipping_address_id": 1,
  "notes": ""
}
```

### 4.4 What backend must do

1. Validate Bearer token and cart.
2. Call **PayPal API to capture** the payment using `paypal_order_id` and `paypal_payer_id`.
3. If capture **succeeds** → create order in DB, set `payment_status`: `"paid"`, clear/update cart, return order data.
4. If capture **fails** → do **not** create order; return error (e.g. 402) with message.

### 4.5 What backend must return

**Success (200/201):**

```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "id": 123,
    "order_number": "ORD-2026-00123",
    "status": "confirmed",
    "payment_status": "paid",
    "total": 130.00,
    "currency": "AED",
    "created_at": "2026-02-20T10:30:00+00:00",
    "items": []
  }
}
```

**Payment failed (e.g. 402):**

```json
{
  "success": false,
  "message": "PayPal payment failed. Please try again."
}
```

---

## 5. Case 3: Pay with Debit or Credit Card (no PayPal account)

In the app, user selects **PayPal** → **Pay with Debit or Credit Card**. The app will **not** send raw card number, expiry, or CVV. It will use a **payment SDK** (e.g. PayPal Guest Checkout, Stripe) to get a **token**, and send only that token to the backend.

### 5.1 App steps (before Place Order)

1. User selects **Pay with Debit or Credit Card** and enters card number, expiry, CVV in the app (via SDK secure fields or hosted page).
2. App gets a **payment_token** (or nonce / PaymentMethod ID) from the SDK.
3. On Review step user taps **Place Order**. App sends **payment_token** + `payment_method: "paypal_guest_card"` to Create Order.

### 5.2 API backend must provide (for card token)

- Option A: Backend returns a **client token** or **publishable key** so the app can initialize the SDK and get a token. Then app sends that token in **Create Order**.
- Option B: Backend exposes a **hosted payment page URL**; user enters card there; provider sends webhook/callback to backend; backend creates order when payment succeeds. (App would need a way to poll or deep-link back to get order status.)

For **Create Order**, backend only needs to accept a **token** and charge it; no raw card data.

### 5.3 What app sends on Place Order (card)

```json
{
  "payment_method": "paypal_guest_card",
  "payment_token": "TOKEN_FROM_PAYPAL_OR_STRIPE_SDK",
  "shipping_address_id": 1,
  "notes": ""
}
```

**Important:** App will **never** send `card_number`, `cvv`, or `expiry` in the API. Only `payment_token`.

### 5.4 What backend must do

1. Validate Bearer token and cart.
2. Call your **payment provider** (e.g. PayPal, Stripe) to **charge** the `payment_token` for the order amount.
3. If charge **succeeds** → create order in DB, set `payment_status`: `"paid"`, return order data.
4. If charge **fails** → do **not** create order; return error (e.g. 402) with message.

### 5.5 What backend must return

Same as **Login with PayPal**: success → order object with `payment_status: "paid"`; failure → `success: false` + message and appropriate HTTP status.

---

## 6. Create Order – Request body summary (all cases)

Backend should accept **one** `POST` endpoint and branch on `payment_method`:

| payment_method | Extra parameters required | Backend action |
|----------------|---------------------------|----------------|
| `cod` | None | Create order, no payment. |
| `paypal_login` | `paypal_order_id`, `paypal_payer_id` | Capture PayPal payment, then create order. |
| `paypal_guest_card` | `payment_token` | Charge token, then create order. |

**Common:** `shipping_address_id` or `shipping_address`, `notes` (optional).

---

## 7. Response shape (unified)

Backend should return the **same success structure** for all three cases so the app can show “Order placed successfully” and order details:

```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "id": 123,
    "order_number": "ORD-2026-00123",
    "status": "confirmed",
    "payment_status": "paid | cod | pending",
    "total": 130.00,
    "currency": "AED",
    "created_at": "2026-02-20T10:30:00+00:00",
    "items": []
  }
}
```

On failure (validation or payment): `success: false`, `message: "..."`, and HTTP status 400/402/422 as appropriate.

---

*Document for backend developer – Create Order and payment flows. App: React Native. Backend: Laravel.*
