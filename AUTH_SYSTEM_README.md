# React Auth System with Clerk Integration

This is a complete React solution that implements user authentication, admin functionality, and payment status management using Clerk authentication, React Context, and localStorage persistence.

## Features

### 🔐 Authentication System
- **Clerk Integration**: Seamless user authentication with Clerk
- **Custom AuthContext**: React Context for state management
- **localStorage Persistence**: User data persists across sessions
- **useAuth Hook**: Easy access to user data and functions

### 👑 Admin System
- **Admin Email List**: Predefined list of admin emails
- **Conditional Admin Menu**: Admin menu only shows for admin users
- **Admin Dashboard**: Dedicated admin page with user management
- **Access Control**: Non-admin users redirected from admin pages

### 💳 Payment System
- **Payment Status Tracking**: `has_active_payment` field in user data
- **Conditional Quiz Access**: Quiz content based on payment status
- **Paywall System**: Non-paying users see upgrade prompts
- **Testing Tools**: Toggle payment status for testing

### 📊 Data Management
- **React Context**: Centralized state management
- **localStorage Sync**: Automatic data persistence
- **Loading States**: Proper loading and error handling
- **Type Safety**: TypeScript interfaces for user data

## File Structure

```
frontend/src/
├── contexts/
│   └── AuthContext.tsx          # Main auth context and provider
├── app/
│   ├── layout.tsx               # Root layout with AuthProvider
│   ├── page.tsx                 # Home page with demo link
│   ├── quiz/
│   │   └── page.tsx             # Quiz page with payment checks
│   ├── admin/
│   │   └── page.tsx             # Admin dashboard
│   └── demo/
│       └── page.tsx             # Demo page for testing
└── sections/
    └── Header.tsx               # Navbar with conditional admin menu
```

## Key Components

### AuthContext.tsx
The core of the authentication system:

```typescript
// Admin emails list
export const ADMIN_EMAILS = ['bmaisonti@gmail.com'];

// User data interface
export interface UserData {
  userId: string;
  email: string;
  has_active_payment: boolean;
}

// Context interface
interface AuthContextType {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  isAdmin: boolean;
  isLoading: boolean;
}
```

**Features:**
- Syncs with Clerk user data on login/logout
- Persists user data in localStorage
- Provides `isAdmin` boolean based on email list
- Handles loading states safely

### useAuth Hook
Easy access to authentication data:

```typescript
const { userData, setUserData, isAdmin, isLoading } = useAuth();
```

**Usage:**
- `userData`: Current user data (null if not signed in)
- `setUserData()`: Update user data (syncs to localStorage)
- `isAdmin`: Boolean indicating admin status
- `isLoading`: Loading state for auth operations

## Admin System

### Admin Email List
```typescript
const ADMIN_EMAILS = ['bmaisonti@gmail.com'];
```

### Conditional Admin Menu
The Header component conditionally renders the admin menu:

```typescript
const { isAdmin } = useAuth();

// In the navbar
{isAdmin && (
  <Link href="/admin">Admin</Link>
)}
```

### Admin Dashboard
- Accessible only to admin users
- Shows user statistics and management tools
- Includes payment status toggle for testing
- Redirects non-admin users to home page

## Payment System

### Payment Status Check
The quiz page checks payment status before rendering content:

```typescript
// Payment check - render paywall for non-paying users
if (userData && !userData.has_active_payment) {
  return <PaywallComponent />;
}
```

### Payment Status Toggle
For testing purposes, you can toggle payment status:

```typescript
const togglePaymentStatus = () => {
  if (userData) {
    const updatedUserData = {
      ...userData,
      has_active_payment: !userData.has_active_payment
    };
    setUserData(updatedUserData);
  }
};
```

## Usage Examples

### 1. Check if User is Admin
```typescript
const { isAdmin } = useAuth();

if (isAdmin) {
  // Show admin features
}
```

### 2. Update User Data
```typescript
const { userData, setUserData } = useAuth();

const updatePaymentStatus = (hasPayment: boolean) => {
  if (userData) {
    setUserData({
      ...userData,
      has_active_payment: hasPayment
    });
  }
};
```

### 3. Conditional Rendering Based on Payment
```typescript
const { userData } = useAuth();

if (userData?.has_active_payment) {
  return <FullContent />;
} else {
  return <Paywall />;
}
```

### 4. Access User Information
```typescript
const { userData } = useAuth();

console.log(userData?.email);        // User's email
console.log(userData?.userId);       // Clerk user ID
console.log(userData?.has_active_payment); // Payment status
```

## Testing the System

### 1. Demo Page
Visit `/demo` to test all features:
- Authentication status
- Admin privileges
- Payment status toggle
- localStorage data inspection

### 2. Admin Access
1. Sign in with email `bmaisonti@gmail.com`
2. Check navbar for "Admin" menu item
3. Visit `/admin` for admin dashboard

### 3. Payment Testing
1. Sign in with any account
2. Toggle payment status in demo page
3. Visit `/quiz` to see different content based on payment status

### 4. localStorage Testing
1. Use demo page to view localStorage data
2. Toggle payment status and see data update
3. Clear localStorage to reset state

## Security Considerations

### Admin Access
- Admin status is determined by email list
- Non-admin users are redirected from admin pages
- Admin menu is conditionally rendered

### Data Persistence
- User data is stored in localStorage
- Sensitive data should be handled server-side
- Payment status should be validated server-side in production

### Authentication
- Clerk handles secure authentication
- User sessions are managed by Clerk
- Token-based API authentication

## Production Considerations

### Server-Side Validation
In production, always validate:
- Admin status on the server
- Payment status with your payment provider
- User permissions for protected routes

### Environment Variables
Ensure proper Clerk configuration:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_secret_here
```

### Error Handling
The system includes:
- Loading states for auth operations
- Error handling for localStorage operations
- Graceful fallbacks for missing data

## Troubleshooting

### Admin Menu Not Showing
1. Check if user email is in `ADMIN_EMAILS` array
2. Verify user is signed in
3. Check browser console for errors

### Payment Status Not Updating
1. Check localStorage for data persistence
2. Verify `setUserData` is being called
3. Ensure user is signed in

### Quiz Page Access Issues
1. Check payment status in user data
2. Verify payment check logic
3. Test with payment status toggle

## Dependencies

- **React**: Core framework
- **Next.js**: React framework
- **Clerk**: Authentication provider
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations

This system provides a solid foundation for user authentication, admin functionality, and payment-based access control in a React application. 