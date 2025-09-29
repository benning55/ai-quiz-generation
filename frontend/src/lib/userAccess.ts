/**
 * User access level utilities
 * Determines what features a user can access based on their subscription status
 */

export type UserAccessLevel = 'guest' | 'free' | 'paid';

export interface UserSubscription {
  has_active_payment: boolean;
  member_tier?: string;
  expires_at?: string;
}

/**
 * Determine user's access level based on their subscription status
 */
export function getUserAccessLevel(userData: UserSubscription | null, isSignedIn: boolean): UserAccessLevel {
  // Not signed in = guest access
  if (!isSignedIn || !userData) {
    return 'guest';
  }

  // Has active payment = paid access
  if (userData.has_active_payment) {
    return 'paid';
  }

  // Signed in but no active payment = free access
  return 'free';
}

/**
 * Check if user has paid access
 */
export function hasPaidAccess(userData: UserSubscription | null): boolean {
  return userData?.has_active_payment === true;
}

/**
 * Get user's subscription tier display name
 */
export function getSubscriptionTierName(memberTier?: string): string {
  if (!memberTier) return 'Free';

  switch (memberTier.toLowerCase()) {
    case '7days':
      return '7-Day Premium';
    case '1month':
      return '1-Month Premium';
    default:
      return 'Premium';
  }
}

/**
 * Check if subscription is expired
 */
export function isSubscriptionExpired(expiresAt?: string): boolean {
  if (!expiresAt) return true;

  try {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    return expiryDate <= now;
  } catch {
    return true;
  }
}

/**
 * Get subscription status message
 */
export function getSubscriptionStatus(userData: UserSubscription | null): {
  status: 'active' | 'expired' | 'none';
  message: string;
  tier?: string;
} {
  if (!userData || !userData.has_active_payment) {
    return {
      status: 'none',
      message: 'No active subscription'
    };
  }

  if (isSubscriptionExpired(userData.expires_at)) {
    return {
      status: 'expired',
      message: 'Subscription expired',
      tier: userData.member_tier
    };
  }

  return {
    status: 'active',
    message: `${getSubscriptionTierName(userData.member_tier)} active`,
    tier: userData.member_tier
  };
}

/**
 * Get quiz limits based on access level
 */
export function getQuizLimits(accessLevel: UserAccessLevel): {
  questionsPerQuiz: number;
  unlimited: boolean;
  description: string;
} {
  switch (accessLevel) {
    case 'paid':
      return {
        questionsPerQuiz: 20,
        unlimited: true,
        description: 'Full access to all questions'
      };
    case 'free':
      return {
        questionsPerQuiz: 3,
        unlimited: false,
        description: 'Limited to 3 questions per quiz'
      };
    case 'guest':
      return {
        questionsPerQuiz: 3,
        unlimited: false,
        description: 'Limited to 3 questions per quiz'
      };
  }
}