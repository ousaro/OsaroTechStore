Feature: Checkout and payments
  Checkout coordinates authenticated order creation, payment sessions, and Stripe webhooks.

  Scenario: Customer creates an order and starts checkout
    Given a registered customer named Casey
    And a product named "Osaro Phone" exists
    When Casey places an order for "Osaro Phone"
    Then the response status should be 201
    And the order should belong to Casey
    When Casey starts checkout for the latest order
    Then the response status should be 201
    And a Stripe checkout session should be returned

  Scenario: Successful Stripe webhook confirms the order payment
    Given a registered customer named Dana
    And a product named "Osaro Tablet" exists
    And Dana has started checkout for "Osaro Tablet"
    When Stripe sends a successful checkout webhook
    Then the response status should be 200
    And the latest payment should be marked "paid"
    And the latest order payment should be marked "paid"

  Scenario: Failed Stripe webhook marks the payment as failed
    Given a registered customer named Evan
    And a product named "Osaro Watch" exists
    And Evan has started checkout for "Osaro Watch"
    When Stripe sends a failed checkout webhook
    Then the response status should be 200
    And the latest payment should be marked "failed"
