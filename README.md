# Nectar Backend Live Coding Exercise

## Enhanced Matchmaking Endpoint

## Objective

Create an API endpoint that matches users based on their interests, relationship readiness score, gender, and sexual orientation.

## Requirements

1. Check out this repo and create a branch for your work
2. Implement an endpoint GET /matches that takes a user's ID and returns a list of matched users.
3. The endpoint should accept the user ID as a query parameter.
4. Use the mock database of users with interests, relationship readiness score, gender, and sexual orientation to perform the matching.
5. Ensure User is only matched with other sexually compatible Users (e.g. heterosexual men are only matched with heterosexual women)
6. Users whose relationship readiness score is closer should be prioritized ahead of Users in the matches list than those whose relationship readiness score is farther.
7. Users who have more shared interests should be be prioritized ahead in the matches list than Users have fewer shared interests.
