# Should I ?
A web application built in ReactJS designed to pull weather data for the user based on their location & notify the user if they should bring a coat today (or not).<br>

## User Features

- Live display of weather information based on location
- Map display of user's location
- Comment system to write & display comments from users
- Thumbs up or down other users' comments

## Codebase Features

- openweathermap API to pull live weather data
- Google Maps API to pull live map data
- Pre-commit hook using husky with ESLint & Prettier
- .env environment variables for API keys
- Local AWS setup including:
    - API Gateway
    - lambdas

## Planned Features

- AWS backend:
    - DynamoDB to store & maintain users' comments & ratings
    - Terraform to control & manage deployment of AWS resources
- Unit & integration tests
- Pre-commit hook to run integration & unit tests


## How to run the app?

- Run `./deploy-local-aws.sh` in `backend/` to deploy AWS backend
- Run `npm start` in `frontend/` to deploy ReactJS web app frontend

## App Screenshots

![Main App Page / Dashboard](app-screenshots/dashboard-08-07-2024.png)
