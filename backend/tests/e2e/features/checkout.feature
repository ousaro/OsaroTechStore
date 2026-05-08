Feature: Customer checkout journey
  Customers should be able to place an order, start checkout, and see the payment
  outcome reflected on their order. Until the frontend journey is wired into
  Playwright, these scenarios keep a thin API backstop for the same user outcomes.

  Scenario: Customer starts checkout and receives a payment session
    # Frontend journey to enable when product and cart screens are ready:
    # Given Casey is signed in on the storefront
    # And Casey opens the "Osaro Phone" product page
    # When Casey adds "Osaro Phone" to the cart
    # And Casey completes the checkout form
    # Then Casey should be redirected to Stripe checkout
    Given a registered customer named Casey
    And a product named "Osaro Phone" exists
    When Casey places an order for "Osaro Phone"
    Then the response status should be 201
    And the order should belong to Casey
    When Casey starts checkout for the latest order
    Then the response status should be 201
    And a Stripe checkout session should be returned

  Scenario: Successful payment confirms the order
    # Frontend journey to enable when order status screens are ready:
    # Given Dana has started checkout for "Osaro Tablet" in the browser
    # When Stripe redirects Dana back after a successful payment
    # Then Dana should see the order marked as paid
    Given a registered customer named Dana
    And a product named "Osaro Tablet" exists
    And Dana has started checkout for "Osaro Tablet"
    When Stripe sends a successful checkout webhook
    Then the response status should be 200
    And the latest payment should be marked "paid"
    And the latest order payment should be marked "paid"

  Scenario: Failed payment is visible to the customer
    # Frontend journey to enable when failed-payment handling is ready:
    # Given Evan has started checkout for "Osaro Watch" in the browser
    # When Stripe redirects Evan back after a failed payment
    # Then Evan should see that payment failed and the order needs attention
    Given a registered customer named Evan
    And a product named "Osaro Watch" exists
    And Evan has started checkout for "Osaro Watch"
    When Stripe sends a failed checkout webhook
    Then the response status should be 200
    And the latest payment should be marked "failed"
