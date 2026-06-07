workspace "OsaroTechStore" "E-commerce platform architecture" {

  model {
    customer = person "Customer" "Shopper browsing and purchasing products"
    admin = person "Admin" "Manages products, categories, users, and orders"
    google = softwareSystem "Google OAuth" "Provides OAuth 2.0 authentication"
    stripe = softwareSystem "Stripe" "Payment processing and webhook events"

    spa = softwareSystem "React SPA" "Customer-facing single-page application" {
      tags "Frontend"
    }

    api = softwareSystem "Express API" "Backend REST API handling business logic" {
      tags "Backend"

      auth = container "Auth Module" "Registration, login, Google OAuth, user management" "Node.js/Express"
      users = container "Users Module" "Profile, cart, favorites, password management" "Node.js/Express"
      products = container "Products Module" "CRUD, reviews, image uploads" "Node.js/Express"
      categories = container "Categories Module" "CRUD with soft-delete" "Node.js/Express"
      orders = container "Orders Module" "CRUD, ownership enforcement" "Node.js/Express"
      payments = container "Payments Module" "Stripe intents, webhooks, CQRS" "Node.js/Express"
    }

    mongo = softwareSystem "MongoDB" "Primary data store with schema validation" {
      tags "Database"
    }
    redis = softwareSystem "Redis" "Session store and cache" {
      tags "Cache"
    }

    customer -> spa "Browses products, manages cart, checks out" "HTTPS"
    customer -> api "Authenticates, views orders" "HTTPS"
    admin -> spa "Manages catalog, users, orders" "HTTPS"
    admin -> api "CRUD operations" "HTTPS"
    spa -> api "All API calls" "HTTPS"
    spa -> google "Social login redirect" "HTTPS"

    api -> mongo "Read/write data" "Mongoose"
    api -> redis "Session lookups" "ioredis"
    api -> stripe "Create checkout sessions" "HTTPS"
    stripe -> api "Webhook events" "HTTPS"
    api -> google "Verify tokens" "HTTPS"
  }

  views {
    systemContext api "SystemContext" {
      include *
      autoLayout
    }

    container api "Containers" {
      include customer
      include admin
      include google
      include stripe
      include spa
      include api
      include mongo
      include redis
      autoLayout
    }

    styles {
      element "Person" {
        shape person
        background #08427b
        color #ffffff
      }
      element "Frontend" {
        background #85bbf0
        color #000000
      }
      element "Backend" {
        background #438dd5
        color #ffffff
      }
      element "Database" {
        background #6cb133
        color #ffffff
        shape cylinder
      }
      element "Cache" {
        background #f4b400
        color #000000
        shape roundedbox
      }
      element "Container" {
        shape roundedbox
        background #6a9fd8
        color #ffffff
      }
    }
  }
}
