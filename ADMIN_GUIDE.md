# Medisow Admin Guide for Voucher Management

## Database Structure

The voucher system uses the following Firestore collections:

1. **vouchers** - Stores available vouchers that users can purchase
2. **users/{userId}/vouchers** - Subcollection that stores vouchers purchased by each user

### Voucher Collection Structure

Each document in the `vouchers` collection should have the following fields:

```typescript
{
  "title": "Gift Card Voucher",        // Display name of the voucher
  "description": "Redeem at any store", // Description text
  "imageUrl": "https://example.com/image.jpg", // Image URL or asset path
  "creditCost": 1000,                  // Cost in credits
  "code": "GIFT12345",                 // Voucher redemption code
  "isActive": true,                    // Whether voucher is available
  "createdAt": timestamp,              // Creation date
  "expiresAt": timestamp (optional)    // Expiration date (if any)
}
```

### User Vouchers Subcollection Structure

When a user purchases a voucher, a document is created in that user's vouchers subcollection:

```typescript
// Path: users/{userId}/vouchers/{voucherId}
{
  "voucherId": "abc123",               // Reference to original voucher
  "userId": "user123",                 // User who purchased
  "title": "Gift Card Voucher",        // Copy of voucher title
  "description": "Redeem at any store", // Copy of description
  "imageUrl": "https://example.com/image.jpg", // Copy of image
  "code": "GIFT12345",                 // Redemption code
  "purchasedAt": timestamp,            // Purchase date
  "usedAt": timestamp (optional),      // When it was used
  "isUsed": false                      // Whether it's been used
}
```

## Admin Panel Implementation

For your admin panel, you'll need to implement the following functionality:

### 1. Voucher Management

- View all vouchers (active and inactive)
- Create new vouchers
- Edit existing vouchers
- Activate/deactivate vouchers
- Delete vouchers

### 2. User Voucher Management

- View all purchased vouchers by users
- Search vouchers by user
- See voucher usage statistics

### 3. Example Admin Voucher Creation Form

Your admin form should include fields for:

- Title
- Description
- Image upload
- Credit cost
- Voucher code (can be auto-generated or manually entered)
- Active status
- Expiration date (optional)

## Code Integration

The app is already set up to fetch and display vouchers from Firestore. When you implement the admin side, make sure to:

1. Follow the exact database structure outlined above
2. Upload images to Firebase Storage and use their URLs, or use asset paths
3. Set the `isActive` flag to control which vouchers are visible to users
4. Generate unique codes for each voucher


