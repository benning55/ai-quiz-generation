# User Management Guide

## Overview
The User Management tab in the Admin Dashboard allows you to view and manually manage user accounts, including payment status, membership tiers, and expiration dates.

## Features

### 🔍 View All Users
- See complete list of all registered users
- View user details: email, name, Clerk ID, join date
- Real-time statistics: Total users, Paid users, Free users

### 🔎 Search & Filter
- **Search by**: Email, name, or Clerk ID
- **Filter by tier**: 
  - All Users
  - Paid Users Only
  - Free Users Only

### ✏️ Manual User Management
Perfect for when users pay you directly (e.g., e-transfer, cash, etc.)

**Editable Fields:**
1. **Payment Status**: Active / Inactive
2. **Member Tier**: 
   - `free` - Regular free user
   - `7_day_trial` - 7-day trial access (full premium features)
   - `7_days` - 7-day paid plan
   - `30_days` - 30-day paid plan
   - `premium` - Full paid membership (1 year)
3. **Expires At**: Set custom expiration date

### 📊 User Information Displayed
- **User Info**: Name, email, Clerk ID
- **Status**: Active (paid) or Inactive badge
- **Tier**: Current membership level
- **Expires At**: Subscription expiration date (with expired warning)
- **Joined**: Account creation date

## Common Use Cases

### 1. Manual Payment Entry
**Scenario**: User pays you $10 via e-transfer for 1 year access.

**Steps:**
1. Go to Admin → Users tab
2. Search for user by email
3. Click "Edit" button
4. Set:
   - **Status**: Active
   - **Tier**: premium
   - **Expires At**: Set to 1 year from now
5. Click "Save"

### 2. Grant Free Trial
**Scenario**: Give a user free 7-day access as a promotion.

**Steps:**
1. Find user in Users tab
2. Click "Edit"
3. Set:
   - **Status**: Active
   - **Tier**: 7_day_trial
   - **Expires At**: Set to 7 days from now
4. Click "Save"

### 2b. Grant 7-Day Paid Plan
**Scenario**: User pays for 7-day access.

**Steps:**
1. Find user in Users tab
2. Click "Edit"
3. Set:
   - **Status**: Active
   - **Tier**: 7_days
   - **Expires At**: Set to 7 days from now
4. Click "Save"

### 2c. Grant 30-Day Paid Plan
**Scenario**: User pays for 30-day access.

**Steps:**
1. Find user in Users tab
2. Click "Edit"
3. Set:
   - **Status**: Active
   - **Tier**: 30_days
   - **Expires At**: Set to 30 days from now
4. Click "Save"

### 3. Extend Subscription
**Scenario**: User asks for 1 month extension as a favor.

**Steps:**
1. Find user
2. Click "Edit"
3. Update **Expires At** to new date (e.g., add 1 month)
4. Click "Save"

### 4. Cancel Subscription
**Scenario**: User requests refund/cancellation.

**Steps:**
1. Find user
2. Click "Edit"
3. Set:
   - **Status**: Inactive
   - **Tier**: free
   - **Expires At**: Clear or set to past date
4. Click "Save"

## Member Tiers Explained

### Free Tier
```
Questions: 5 per test
Chapter Selection: ❌ No (mixed test only)
Test Limit: 5 total tests (localStorage)
Duration: Forever
```

### 7-Day Trial
```
Questions: 20 per test
Chapter Selection: ✅ Yes (all 10 chapters)
Test Limit: ✅ Unlimited
Duration: 7 days
Access: Full premium features
```

### 7-Day Paid Plan
```
Questions: 20 per test
Chapter Selection: ✅ Yes (all 10 chapters)
Test Limit: ✅ Unlimited
Duration: 7 days
Access: Full premium features
```

### 30-Day Paid Plan
```
Questions: 20 per test
Chapter Selection: ✅ Yes (all 10 chapters)
Test Limit: ✅ Unlimited
Duration: 30 days
Access: Full premium features
```

### Premium Tier
```
Questions: 20 per test
Chapter Selection: ✅ Yes (all 10 chapters)
Test Limit: ✅ Unlimited
Duration: Based on payment (1 month, 1 year, etc.)
Access: Full premium features + progress tracking
```

## Important Notes

### ⚠️ Security Considerations
- Currently, ANY authenticated user can access `/api/users/` endpoint
- **For production**: Add admin role check before going live
- See `backend/app/routes/api.py` lines 201-228 for where to add admin check

### 🔒 Recommended: Add Admin Role Check
```python
# In service.py, add:
def require_admin(current_user: db_models.User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(401, "Authentication required")
    if not current_user.is_admin:  # Add is_admin field to User model
        raise HTTPException(403, "Admin access required")
    return current_user

# Then in api.py:
@router.get("/users/")
def get_all_users_endpoint(
    admin: db_models.User = Depends(require_admin),  # ← Admin check
    db: Session = Depends(get_db)
):
    users = db.query(db_models.User).all()
    return users
```

### 💡 Best Practices

1. **Always set expiration date** when activating payment
2. **Use 7_day_trial tier** for trial users (clearer analytics)
3. **Document manual changes** - keep a spreadsheet of manual payments
4. **Check expired users weekly** - follow up with renewal reminders
5. **Validate email** before granting paid access

### 📧 Manual Payment Workflow

**Recommended process:**
1. User contacts you for direct payment
2. User sends payment (e-transfer/PayPal/etc.)
3. **Confirm payment received** ← Critical!
4. Note user's email address
5. Go to Admin → Users
6. Search for user by email
7. Activate their account with appropriate tier & expiration
8. Send confirmation email to user
9. **Log the transaction** in a spreadsheet for your records

### 🗓️ Expiration Management

**Expired Status Indicator:**
- Users with `expires_at` in the past show red "Expired" warning
- Their `has_active_payment` should be set to `false`
- System will automatically restrict them to free tier

**Renewal Process:**
1. User contacts for renewal
2. Confirm payment
3. Find user in Users tab
4. Click "Edit"
5. Update `expires_at` to new date
6. Ensure `has_active_payment` is `true`
7. Save changes

## API Endpoints

### Get All Users
```
GET /api/users/
Response: Array of user objects
```

### Update User
```
PUT /api/users/{user_id}
Body: {
  "has_active_payment": true,
  "member_tier": "premium",
  "expires_at": "2026-12-31T23:59:59Z"
}
Response: Updated user object
```

## UI Features

### Pagination
- Shows 20 users per page
- Navigate with Previous/Next buttons
- Shows current page and total pages

### Real-time Stats
- Total Users count
- Paid Users count
- Free Users count
- Updates immediately after changes

### Inline Editing
- Click "Edit" to modify user
- All fields become editable
- "Save" commits changes to database
- "Cancel" discards changes

### Visual Indicators
- 🟢 Green badge for Active paid users
- ⚫ Gray badge for Inactive/free users
- 👑 Crown icon for premium users
- ⚠️ Red warning for expired subscriptions

## Troubleshooting

### User not showing up
- Check if they've actually signed up (created account)
- Search by Clerk ID instead of email
- Try "All Users" filter

### Can't save changes
- Check browser console for errors
- Verify backend is running
- Check network tab for failed requests
- Ensure date format is valid

### Changes not reflecting
- Click "Refresh" button to reload data
- Check if save was successful (look for success message)
- Verify database was actually updated

## Future Enhancements

Potential additions:
- [ ] Bulk user operations (activate multiple users)
- [ ] Export user list to CSV
- [ ] Email notification on status change
- [ ] Payment history log
- [ ] Usage analytics per user
- [ ] Admin activity audit log

---

**Created**: January 2025  
**Last Updated**: January 2025  
**Version**: 1.0
