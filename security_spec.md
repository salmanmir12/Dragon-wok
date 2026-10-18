# Dragon Wok Security Specification & Rule Audit

## 1. Data Invariants
- Admin operations require existence in `/admins/{uid}` or verification as the configured owner (`dragonwok74@gmail.com` with `email_verified == true`).
- Staff members can only view incoming orders and update preparation status (`['status', 'updatedAt']`).
- Customers can only read and manage their own profile `/users/{uid}` and their own orders `/orders/{orderId}` where `resource.data.userId == request.auth.uid`.
- Guest orders require strict payload structure, bounded item counts (<=50), and can only be queried by exact order ID.
- Dynamic menu items (`/menu_items`) and restaurant settings (`/restaurant_settings`) are publicly readable but strictly writable only by verified administrators.

## 2. Dirty Dozen Payload Matrix
1. **Ghost Field Privilege Escalation**: User registers with `{ role: 'admin' }` in their user profile -> REJECTED.
2. **Order Tampering by Customer**: Customer attempts to change status from 'Pending' to 'Completed' -> REJECTED.
3. **Cross-Customer Order Read**: Customer A attempts to query Customer B's orders -> REJECTED by Query Enforcer.
4. **Staff Menu Overwrite**: Staff member attempts to alter menu prices -> REJECTED (only admins allowed).
5. **ID Poisoning Attack**: Submitting order with 2KB junk document ID -> REJECTED by `isValidId`.
6. **Denial of Wallet Flooding**: Submitting 1000 items in single order -> REJECTED (max 50 items).
7. **Email Spoofing Attack**: Registering unverified email with admin string -> REJECTED (`email_verified == true` required).
8. **PII Scraping**: Public user queries `/users` list -> REJECTED (isolated to owner/admin).
9. **Public Menu Mutation**: Unauthenticated request modifying item price -> REJECTED.
10. **Status Regression by Staff**: Staff sets invalid status -> REJECTED (enum validation enforced).
11. **Negative Order Total**: Submitting order with negative price -> REJECTED (`total >= 0`).
12. **Orphaned User Profile**: Authenticated user trying to create `/users/{someoneElseId}` -> REJECTED (`incoming().userId == userId && request.auth.uid == userId`).
