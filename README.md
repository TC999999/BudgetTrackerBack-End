# Budget Planner - Backend

## Frontend Service

[Click Here](https://github.com/TC999999/BudgetTrackerFront-End) to see frontend service

## Application Stack

This application was made using the MERN stack.

- MongoDB
- Express.js
- React.js
- Node.js

With the Back-end using Express.js, Node.js, a MongoDB connection, nodemailer, handlebars, cron, and server-side events

## Application Details

This the backend service for the budget planner app that handles saving the data from the user into the database as well as other features.

This app stores users' data on MongoDB due to its quickness and ease of use. User's data is kept safe from attacks using secure http only refresh and access JWTs to be stored in the browser's cookies. Users will only be able to make requests and recieve data if they have an access JWT, and they can only receive an access token if they have a refresh JWT.

This service connects to MongoDB upon startup and loads any income jobs from the database that it finds. When it receives a request from the frontend, it updates at least one collection in MongoDB; for example, when a user creates a new budget on the client-side, a new document is added to the budget collection and the id for that new budget is taken to be added to the corresponding user collection.

Besides basic CRUD requests, this service is also responsible for notifying users when one of their scheduled incomes is received. Cron is used to make a scheduled list of incomes from all users to automatically update a user's total savings value on their respectve collection and sends the user an email using nodemailer. Server-side events are also used to send real-time updates to update the state of the client-side using unqiue event emitters and routes for each user for when their income has been recieved.

Furthermore, this service also assists in resetting the user's password. When a user makes a request by sending their email and username, the backend creates a document that creates a hashed one-time verification code and sending an email to the user with the unhashed code. If the code the user inputs matches the hashed code stored in the database, the service will allow the user to reset their password. The document containing the code will be deleted after two minutes or if the user successfully resets their password.

Emails are send using the nodemailer library and uses handlebars to create unqiue and reusable HTML templates for each email.
