# LUXE Fashion — Database Schema

## Collections

### users
```
_id           ObjectId
name          String (required, max 80)
email         String (required, unique, lowercase)
phone         String (optional, Indian format)
password      String (hashed, select: false)
role          String (enum: customer|admin, default: customer)
avatar        { public_id: String, url: String }
addresses     [{ name, phone, line1, line2, city, state, pincode, country, isDefault }]
isEmailVerified Boolean (default: false)
resetPasswordToken String (hashed)
resetPasswordExpiry Date
isActive      Boolean (default: true)
lastLogin     Date
wishlist      [ObjectId -> Product]
timestamps    createdAt, updatedAt
```

### products
```
_id           ObjectId
name          String (required, max 200)
slug          String (unique, auto-generated)
description   String (required, max 5000)
shortDescription String (max 500)
price         Number (required)
comparePrice  Number (optional, original price)
costPrice     Number (internal)
category      ObjectId -> Category
brand         String (default: LUXE)
tags          [String]
images        [{ public_id, url, alt, isDefault }]
variants      [{ size, color, colorHex, stock, sku, additionalPrice }]
sizes         [String] (auto-populated from variants)
colors        [String] (auto-populated from variants)
material      String
careInstructions [String]
specifications [{ key, value }]
gender        String (enum: men|women|unisex|kids)
isFeatured    Boolean
isNewArrival  Boolean
isBestSeller  Boolean
isTrending    Boolean
isLimitedEdition Boolean
isOnSale      Boolean
flashSalePrice Number
stock         Number (total stock)
soldCount     Number (default: 0)
ratings       { average: Number, count: Number }
isActive      Boolean (default: true)
metaTitle     String
metaDescription String
timestamps    createdAt, updatedAt

INDEXES: text(name,description,tags), category+isActive, price, ratings.average, createdAt, soldCount, slug, gender, isFeatured, isNewArrival
```

### categories
```
_id           ObjectId
name          String (required, unique)
slug          String (unique, auto-generated)
description   String
image         { public_id, url }
parent        ObjectId -> Category (null for top-level)
level         Number (0=top, 1=sub)
gender        String (enum: men|women|unisex|kids|all)
order         Number
isActive      Boolean
isFeatured    Boolean
metaTitle     String
metaDescription String
timestamps    createdAt, updatedAt

VIRTUALS: children (subcategories), productCount
```

### orders
```
_id           ObjectId
orderNumber   String (unique, auto-generated: LUXE-000001-ABC123)
user          ObjectId -> User (optional for guests)
guestEmail    String
guestName     String
items         [{ product, name, image, price, quantity, size, color, sku }]
shippingAddress { name, phone, line1, line2, city, state, pincode, country }
pricing       { subtotal, shipping, tax, discount, total }
coupon        { code, discount }
payment       { method, status, razorpayOrderId, razorpayPaymentId, razorpaySignature, paidAt, refundId, refundedAt, refundAmount }
status        String (enum: pending|confirmed|processing|shipped|out_for_delivery|delivered|cancelled|return_requested|returned|refunded)
statusHistory [{ status, note, timestamp, updatedBy }]
tracking      { carrier, trackingNumber, trackingUrl, estimatedDelivery }
returnRequest { requested, reason, requestedAt, status, processedAt }
notes         String (admin)
customerNote  String
invoiceUrl    String
isGift        Boolean
giftMessage   String
timestamps    createdAt, updatedAt

INDEXES: user+createdAt, orderNumber, status, payment.status
```

### reviews
```
_id           ObjectId
product       ObjectId -> Product
user          ObjectId -> User
rating        Number (1-5, required)
title         String (required, max 100)
body          String (required, max 2000)
images        [{ public_id, url }]
size          String
color         String
fit           String (enum: runs_small|true_to_size|runs_large)
isVerifiedPurchase Boolean
helpfulVotes  Number
helpfulVoters [ObjectId -> User]
isApproved    Boolean
adminReply    String
timestamps    createdAt, updatedAt

INDEXES: product+user (unique), product+isApproved, rating
POST-SAVE HOOK: updates product.ratings.average and ratings.count
```

### carts
```
_id           ObjectId
user          ObjectId -> User (unique)
items         [{ product, quantity, size, color, sku, price, savedForLater }]
coupon        { code, discount, discountType }
timestamps    createdAt, updatedAt

VIRTUAL: subtotal
```

### coupons
```
_id           ObjectId
code          String (unique, uppercase)
description   String
discountType  String (enum: percentage|fixed)
discountValue Number
maxDiscount   Number (cap for percentage)
minOrderAmount Number
usageLimit    Number (null = unlimited)
usagePerUser  Number (default: 1)
usedCount     Number
usedBy        [ObjectId -> User]
validFrom     Date
validUntil    Date
applicableCategories [ObjectId -> Category]
applicableProducts   [ObjectId -> Product]
isFirstOrderOnly     Boolean
isActive      Boolean

METHODS: isValid(userId, orderAmount), calculateDiscount(subtotal)
```

### banners
```
_id           ObjectId
title         String (required)
subtitle      String
cta           { label, link }
image         { public_id, url }
mobileImage   { public_id, url }
position      String (enum: hero|category|promo|sidebar)
order         Number
isActive      Boolean
validFrom     Date
validUntil    Date
timestamps    createdAt, updatedAt
```

### newsletters
```
_id           ObjectId
email         String (unique, lowercase)
isSubscribed  Boolean
subscribedAt  Date
unsubscribedAt Date
timestamps    createdAt, updatedAt
```

---

## Relationships

```
User 1──* Order
User 1──1 Cart
User *──* Product (wishlist)
User 1──* Review

Product *──1 Category
Product 1──* Review
Product 1──* CartItem

Order *──* Product (via items)
Order *──1 User

Category *──1 Category (parent/children tree)

Coupon *──* User (usedBy)
```

---

## Indexing Strategy

- **Text indexes** on products for full-text search
- **Compound indexes** on category+isActive for shop queries
- **Single field indexes** on price, soldCount, createdAt for sorting
- **Unique indexes** on user+product in reviews (one review per product per user)
- **TTL indexes** can be added for resetPasswordExpiry cleanup
