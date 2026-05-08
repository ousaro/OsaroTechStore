Feature: Customer authentication journey
  Customers should be able to create an account, sign in, and access their protected
  account area. Until the frontend journey is wired into Playwright, these scenarios
  keep a thin API backstop for the same user outcomes.

  Scenario: Customer creates an account and signs in
    # Frontend journey to enable when the storefront auth screens are ready:
    # Given Alice opens the storefront
    # When Alice creates an account from the sign-up form
    # Then Alice should land in her account area
    # When Alice signs out
    # And Alice signs in from the login form
    # Then Alice should see her account profile
    Given a visitor named Alice
    When Alice registers for an account
    Then the response status should be 201
    And Alice should receive a JWT token
    When Alice logs in with valid credentials
    Then the response status should be 200
    And Alice should receive a JWT token
    When Alice opens their account profile
    Then the response status should be 200
    And the profile should belong to Alice

  Scenario: Admin can reach the user management journey
    # Frontend journey to enable when the admin screens are ready:
    # Given Bob is signed in as a customer
    # When Bob opens the admin users page
    # Then Bob should see an access denied state
    # Given Admin is signed in as an administrator
    # When Admin opens the admin users page
    # Then Admin should see the managed user list
    Given a registered customer named Bob
    And an admin user named Admin
    When Bob requests the managed user list
    Then the response status should be 403
    When Admin requests the managed user list
    Then the response status should be 200
