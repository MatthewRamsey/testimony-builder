# Test Implementation Plan

## Overview
This document outlines the test implementation strategy for the Testimony Builder application using Test-Driven Development (TDD) principles.

## Testing Stack
- **Jest**: Unit and integration testing framework
- **React Testing Library**: Component testing
- **Supertest**: API endpoint testing
- **MSW (Mock Service Worker)**: API mocking
- **@testing-library/user-event**: User interaction testing

## Test Coverage Goals
- Domain layer: 90%+
- Infrastructure layer: 80%+
- API routes: 80%+
- Components: 70%+

## Test Structure

```
testimony-builder/
├── __tests__/
│   ├── setup.ts                    # Jest configuration
│   ├── fixtures/                   # Test data
│   │   ├── testimonies.ts
│   │   ├── users.ts
│   │   └── subscriptions.ts
│   └── mocks/                      # Mock implementations
│       ├── supabase.ts
│       ├── stripe.ts
│       └── ai.ts
```

## Implementation Order

### Phase 1: Test Infrastructure (Priority: HIGH)
**Status**: Pending

**Tasks**:
1. Configure Jest and testing libraries
2. Create test setup file with global mocks
3. Create test fixtures (users, testimonies, subscriptions)
4. Create mock implementations (Supabase, Stripe, AI)
5. Add test scripts to package.json

**Files to Create**:
- `__tests__/setup.ts`
- `__tests__/fixtures/testimonies.ts`
- `__tests__/fixtures/users.ts`
- `__tests__/fixtures/subscriptions.ts`
- `__tests__/mocks/supabase.ts`
- `__tests__/mocks/stripe.ts`
- `__tests__/mocks/ai.ts`
- `jest.config.js` (update)

---

### Phase 2: Domain Layer Tests (Priority: HIGH)
**Status**: Pending

#### 2.1 UserService Tests
**File**: `domain/user/__tests__/UserService.test.ts`

**Test Cases**:
- ✓ `sendMagicLink()` sends email with valid input
- ✓ `sendMagicLink()` throws error for invalid email
- ✓ `sendMagicLink()` throws error for empty email
- ✓ `sendMagicLink()` respects rate limiting
- ✓ `verifyMagicLinkToken()` authenticates valid token
- ✓ `verifyMagicLinkToken()` rejects invalid token
- ✓ `verifyMagicLinkToken()` rejects expired token
- ✓ `getCurrentUser()` returns authenticated user
- ✓ `getCurrentUser()` returns null for unauthenticated

#### 2.2 TestimonyService Tests
**File**: `domain/testimony/__tests__/TestimonyService.test.ts`

**Test Cases**:
- ✓ `create()` creates testimony with valid data
- ✓ `create()` throws error for empty title
- ✓ `create()` throws error for invalid framework
- ✓ `create()` validates content structure matches framework
- ✓ `getById()` returns testimony when user owns it
- ✓ `getById()` throws error when user doesn't own it
- ✓ `getById()` throws error when testimony doesn't exist
- ✓ `update()` updates testimony when user owns it
- ✓ `update()` throws error when user doesn't own it
- ✓ `delete()` deletes testimony when user owns it
- ✓ `delete()` throws error when user doesn't own it
- ✓ `listByUser()` returns only user's testimonies
- ✓ `listByUser()` returns empty array when user has none

#### 2.3 SubscriptionService Tests
**File**: `domain/subscription/__tests__/SubscriptionService.test.ts`

**Test Cases**:
- ✓ `hasActiveSubscription()` returns true for active sub
- ✓ `hasActiveSubscription()` returns false for no sub
- ✓ `hasActiveSubscription()` returns false for canceled sub
- ✓ `create()` creates new subscription
- ✓ `cancel()` cancels subscription
- ✓ `getByUserId()` returns user's subscription

---

### Phase 3: Infrastructure Layer Tests (Priority: HIGH)
**Status**: Pending

#### 3.1 SupabaseTestimonyRepository Tests
**File**: `infrastructure/database/__tests__/SupabaseTestimonyRepository.test.ts`

**Test Cases**:
- ✓ `create()` persists testimony to database
- ✓ `findById()` returns testimony from database
- ✓ `findById()` returns null when not found
- ✓ `update()` updates testimony in database
- ✓ `delete()` deletes testimony from database
- ✓ `findByUserId()` returns all user's testimonies

#### 3.2 PDFProvider Tests
**File**: `infrastructure/export/__tests__/providers/PDFProvider.test.ts`

**Test Cases**:
- ✓ `generate()` generates PDF Buffer
- ✓ `generate()` formats content correctly
- ✓ `generate()` handles all framework types
- ✓ `generate()` sanitizes HTML content

#### 3.3 ExportService Tests
**File**: `infrastructure/export/__tests__/ExportService.test.ts`

**Test Cases**:
- ✓ `exportToPDF()` generates PDF from testimony
- ✓ `exportToPDF()` sanitizes content before generation
- ✓ `exportToPDF()` handles all frameworks

#### 3.4 VercelAIProvider Tests
**File**: `infrastructure/ai/__tests__/providers/VercelAIProvider.test.ts`

**Test Cases**:
- ✓ `generateSuggestions()` returns AI suggestions
- ✓ `generateSuggestions()` sanitizes input before sending
- ✓ `generateSuggestions()` respects rate limits
- ✓ `generateSuggestions()` handles API errors

#### 3.5 AiService Tests
**File**: `infrastructure/ai/__tests__/AiService.test.ts`

**Test Cases**:
- ✓ `generateEditingSuggestions()` returns suggestions
- ✓ `generateEditingSuggestions()` requires premium subscription
- ✓ `generateEditingSuggestions()` enforces rate limits
- ✓ `generateEditingSuggestions()` sanitizes input

#### 3.6 StripeProvider Tests
**File**: `infrastructure/payment/__tests__/providers/StripeProvider.test.ts`

**Test Cases**:
- ✓ `createCheckoutSession()` creates Stripe session
- ✓ `verifyWebhookSignature()` validates signatures
- ✓ `constructEvent()` constructs webhook event

#### 3.7 PaymentService Tests
**File**: `infrastructure/payment/__tests__/PaymentService.test.ts`

**Test Cases**:
- ✓ `createCheckoutSession()` creates checkout
- ✓ `handleWebhook()` processes subscription created
- ✓ `handleWebhook()` processes subscription canceled
- ✓ `handleWebhook()` verifies signature
- ✓ `handleWebhook()` handles idempotency

---

### Phase 4: API Route Tests (Priority: HIGH)
**Status**: Pending

#### 4.1 Auth Routes Tests
**File**: `app/api/__tests__/auth/send-magic-link.test.ts`

**Test Cases**:
- ✓ POST returns 200 for valid email
- ✓ POST returns 400 for invalid email
- ✓ POST returns 429 for rate limit exceeded

**File**: `app/api/__tests__/auth/callback.test.ts`

**Test Cases**:
- ✓ GET exchanges code for session
- ✓ GET redirects to dashboard on success
- ✓ GET redirects to login on error

#### 4.2 Testimonies Routes Tests
**File**: `app/api/__tests__/testimonies/route.test.ts`

**Test Cases**:
- ✓ POST creates testimony for authenticated user
- ✓ POST returns 401 for unauthenticated
- ✓ POST returns 400 for invalid data
- ✓ GET returns user's testimonies

**File**: `app/api/__tests__/testimonies/[id].test.ts`

**Test Cases**:
- ✓ GET returns testimony when user owns it
- ✓ GET returns 403 when user doesn't own it
- ✓ GET returns 404 when not found
- ✓ PUT updates testimony when user owns it
- ✓ PUT returns 403 when user doesn't own it
- ✓ DELETE deletes testimony when user owns it
- ✓ DELETE returns 403 when user doesn't own it

#### 4.3 Export Routes Tests
**File**: `app/api/__tests__/export/pdf.test.ts`

**Test Cases**:
- ✓ POST returns PDF when user owns testimony
- ✓ POST returns 403 when user doesn't own testimony
- ✓ POST returns 401 for unauthenticated
- ✓ POST returns 429 for rate limit exceeded

#### 4.4 AI Routes Tests
**File**: `app/api/__tests__/ai/edit.test.ts`

**Test Cases**:
- ✓ POST returns suggestions for premium users
- ✓ POST returns 402 for non-premium users
- ✓ POST returns 403 when user doesn't own testimony
- ✓ POST returns 429 for rate limit exceeded

#### 4.5 Payment Routes Tests
**File**: `app/api/__tests__/payments/checkout.test.ts`

**Test Cases**:
- ✓ POST creates checkout session
- ✓ POST returns 401 for unauthenticated

**File**: `app/api/__tests__/payments/webhook.test.ts`

**Test Cases**:
- ✓ POST processes valid webhook event
- ✓ POST returns 400 for invalid signature
- ✓ POST handles idempotency

#### 4.6 Gallery Routes Tests
**File**: `app/api/__tests__/gallery/publish.test.ts`

**Test Cases**:
- ✓ POST publishes testimony to gallery
- ✓ POST returns 403 when user doesn't own testimony
- ✓ POST returns 429 for rate limit exceeded

**File**: `app/api/__tests__/gallery/route.test.ts`

**Test Cases**:
- ✓ GET returns public gallery entries
- ✓ GET paginates results

---

### Phase 5: Component Tests (Priority: MEDIUM)
**Status**: Pending

#### 5.1 Framework Components
**Files**:
- `components/__tests__/frameworks/BeforeEncounterAfter.test.tsx`
- `components/__tests__/frameworks/LifeTimeline.test.tsx`
- `components/__tests__/frameworks/SeasonsOfGrowth.test.tsx`
- `components/__tests__/frameworks/FreeFormNarrative.test.tsx`

**Test Cases** (per component):
- ✓ Renders all input fields
- ✓ Calls onChange when user types
- ✓ Displays existing values
- ✓ Validates required fields

#### 5.2 TestimonyEditor Tests
**File**: `components/__tests__/TestimonyEditor.test.tsx`

**Test Cases**:
- ✓ Renders framework selector
- ✓ Renders selected framework component
- ✓ Calls onSave with testimony data
- ✓ Shows validation errors
- ✓ Disables save button when invalid

#### 5.3 TestimonyPreview Tests
**File**: `components/__tests__/TestimonyPreview.test.tsx`

**Test Cases**:
- ✓ Displays testimony title
- ✓ Displays content based on framework
- ✓ Shows export button
- ✓ Shows AI edit button for premium users

---

### Phase 6: Integration & Coverage (Priority: MEDIUM)
**Status**: Pending

**Tasks**:
1. Run full test suite
2. Generate coverage report
3. Identify gaps in coverage
4. Add missing tests for edge cases
5. Set up CI/CD test pipeline
6. Add pre-commit hooks for testing

---

## Test Utilities

### Authentication Helper
```typescript
// __tests__/utils/auth.ts
export function createAuthenticatedRequest(userId: string) {
  // Returns supertest request with auth headers
}
```

### Fixture Builder
```typescript
// __tests__/fixtures/testimonies.ts
export function createTestimony(overrides?: Partial<Testimony>) {
  return {
    id: 'testimony-123',
    user_id: 'user-123',
    title: 'Test Testimony',
    framework_type: 'before_encounter_after',
    content: { before: 'Before', encounter: 'Encounter', after: 'After' },
    is_public: false,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides
  }
}
```

### Mock Factory
```typescript
// __tests__/mocks/supabase.ts
export function createMockSupabaseClient() {
  return {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    }),
    auth: {
      signInWithOtp: jest.fn(),
      exchangeCodeForSession: jest.fn(),
      getUser: jest.fn(),
    }
  }
}
```

## Success Criteria
- ✓ All tests pass
- ✓ Coverage >= 80% overall
- ✓ Domain layer >= 90% coverage
- ✓ No critical bugs found
- ✓ All features work as expected
- ✓ Tests run in CI/CD pipeline

## Next Steps
1. Start with Phase 1 (Test Infrastructure)
2. Implement tests in order of priority
3. Run tests frequently during development
4. Refactor code to improve testability
5. Document any testing patterns discovered
