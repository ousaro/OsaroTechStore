Feature: Authentication and access control
  The API must protect customer and admin workflows with JWT authentication.

  Scenario: User registration and login
    Given a visitor named Alice
    When Alice registers for an account
    Then the response status should be 201
    And Alice should receive a JWT token
    When Alice logs in with valid credentials
    Then the response status should be 200
    And Alice should receive a JWT token

  Scenario: Admin access control
    Given a registered customer named Bob
    And an admin user named Admin
    When Bob requests the managed user list
    Then the response status should be 403
    When Admin requests the managed user list
    Then the response status should be 200

  Scenario: Protected routes reject expired tokens
    Given a registered customer named Carol
    When Carol places an order with an expired token
    Then the response status should be 401
