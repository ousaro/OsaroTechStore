# Data Model

> Version 2.0.0 — Last updated: 2026-06-10

## Entity-Relationship Diagram

```mermaid
erDiagram
    User {
        ObjectId _id PK
        String firstName "required, trim"
        String lastName "required, trim"
        String email "required, unique, lowercase"
        String password "required, bcrypt hashed"
        Boolean admin "default: false"
        String picture "default: ''"
        String phone "default: ''"
        String address "default: ''"
        String city "default: ''"
        String country "default: ''"
        String state "default: ''"
        Number postalCode "default: 0"
        Array favorites "default: []"
        Array cart "default: []"
        Date createdAt "via timestamps"
        Date updatedAt "via timestamps"
    }

    Category {
        ObjectId _id PK
        String name "required, unique, trim"
        String description "default: ''"
        Boolean isDeleted "via softDeletePlugin"
        Date deletedAt "via softDeletePlugin"
        Date createdAt "via timestamps"
        Date updatedAt "via timestamps"
    }

    Product {
        ObjectId _id PK
        String name "required, trim"
        String description "default: ''"
        Number price "required"
        String currency "default: USD"
        ObjectId category FK "ref: Category, indexed"
        Number stock "default: 0"
        Array images "default: []"
        String status "default: 'new'"
        Array reviews "embedded ProductReview[]"
        Date createdAt "via timestamps"
        Date updatedAt "via timestamps"
    }

    ProductReview {
        String userId "required"
        String name "default: Customer"
        String firstName "default: ''"
        String lastName "default: ''"
        String picture "default: ''"
        Number rating "required, min 1 max 5"
        String comment "required, trim"
        Date createdAt "via timestamps"
    }

    Order {
        ObjectId _id PK
        ObjectId ownerId FK "ref: User, indexed"
        Array orderLines "embedded OrderLine[]"
        Object deliveryAddress "embedded Address"
        String currency "default: USD"
        String orderStatus "default: pending"
        String paymentStatus "default: pending"
        Object totalPrice "embedded Money"
        Date createdAt "via timestamps"
        Date updatedAt "via timestamps"
    }

    OrderLine {
        String productId "required"
        String name "required"
        Number quantity "required"
        Object unitPrice "embedded Money"
        Object subtotal "embedded Money"
    }

    Money {
        Number amount "required"
        String currency "required"
    }

    Address {
        String street
        String city
        String state
        String postalCode
        String country
        String phone
    }

    PaymentWorkflow {
        ObjectId _id PK
        ObjectId orderId FK "ref: Order, indexed"
        String provider "required, eg stripe"
        String workflowType "required, eg payment_intent"
        String paymentStatus "default: pending"
        String sessionId "indexed"
        String providerPaymentId
        String providerStatus
        String url
        Date occurredAt "default: Date.now"
        Date createdAt "via timestamps"
        Date updatedAt "via timestamps"
    }

    %% Relationships
    Product ||--o{ ProductReview : contains
    Product }o--|| Category : belongs_to
    Order ||--o{ OrderLine : contains
    Order ||--o{ Money : has_total_price
    OrderLine ||--o{ Money : has_unit_price
    OrderLine ||--o{ Money : has_subtotal
    PaymentWorkflow }o--|| Order : tracks
    Order }o--|| User : owned_by
```

## Collection Indexes

### Users

| Index | Fields     | Unique? |
| ----- | ---------- | ------- |
| email | `email: 1` | Yes     |

### Products

| Index            | Fields                     | Notes                                            |
| ---------------- | -------------------------- | ------------------------------------------------ |
| category         | `category: 1`              | Single-field lookup                              |
| status+createdAt | `status: 1, createdAt: -1` | Compound for listing by status sorted by recency |
| price            | `price: 1`                 | For price-range queries                          |
| createdAt        | `createdAt: -1`            | For recent-products listing                      |

### Categories

| Index               | Fields                        | Unique?                       |
| ------------------- | ----------------------------- | ----------------------------- |
| name                | `name: 1`                     | Yes                           |
| isDeleted+createdAt | `isDeleted: 1, createdAt: -1` | For active-categories listing |

### Orders

| Index                   | Fields                            | Notes                            |
| ----------------------- | --------------------------------- | -------------------------------- |
| ownerId+createdAt       | `ownerId: 1, createdAt: -1`       | User's order history             |
| orderStatus+createdAt   | `orderStatus: 1, createdAt: -1`   | Admin order management by status |
| paymentStatus+createdAt | `paymentStatus: 1, createdAt: -1` | Payment reconciliation           |
| isPaid+ownerId          | `isPaid: 1, ownerId: 1`           | Filter paid/unpaid by user       |

### PaymentWorkflows

| Index     | Fields         | Notes                   |
| --------- | -------------- | ----------------------- |
| sessionId | `sessionId: 1` | Stripe session lookup   |
| orderId   | `orderId: 1`   | Payment-by-order lookup |

### System Collections

| Collection     | Index                                    | Purpose                             |
| -------------- | ---------------------------------------- | ----------------------------------- |
| `_migrations`  | `name: 1` (unique)                       | Migration tracking                  |
| `_idempotency` | `key: 1` (unique), `expiresAt: 1` (TTL)  | Idempotency store with auto-cleanup |
| `audit_logs`   | `actor+timerange`, `timestamp`, `action` | Audit trail for product mutations   |

## Schema Validation

MongoDB `$jsonSchema` validators enforce the same constraints at the database level. Defined in `backend/migrations/001-create-initial-schema.js`.

Key validations:

- **Users**: email pattern match, password minLength 6
- **Products**: price >= 0, stock >= 0, rating 1-5
- **Orders**: non-empty orderLines, valid currency codes
- **Payments**: valid paymentStatus values

## Embedded vs Referenced

| Decision                                                             | Rationale                                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **ProductReview** embedded in Product                                | Reviews are always fetched with the product, never queried independently |
| **OrderLine** embedded in Order                                      | Lines are part of the order aggregate, never exist independently         |
| **Money** embedded inline                                            | Simple value object, no standalone queries                               |
| **Address** embedded                                                 | Always part of an order, no address book feature                         |
| **User, Category, Product, PaymentWorkflow** as separate collections | Queried independently, referenced by ObjectId                            |

---

## Related Documents

- [Functional Requirements](../functional-requirements.md) — business rules per entity
- [Configuration Reference](../configuration.md) — database connection settings
- [ADR-005: Database Provider Abstraction](../adr/005-database-abstraction.md) — Mongo/Postgres dual-provider design

## Revision History

| Date       | Change                                                   |
| ---------- | -------------------------------------------------------- |
| 2026-06-10 | Added revision history, cross-links to related documents |
| 2026-06-07 | Initial version                                          |
