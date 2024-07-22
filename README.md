# Should I ?
A web application built in ReactJS designed to pull weather data for the user based on their location & notify the user if they should bring a coat today (or not).<br>

## User Features

- Live display of weather information based on location
- Map display of user's location
- Comment system to write & display comments from users
- Thumbs up or down other users' comments
- View nearby comments submitted by other users based on location
- Loading animations for components while fetching weather data

## Codebase Features

- openweathermap API to pull live weather data
- Google Maps API to pull live map data
- Pre-commit hook using husky with ESLint & Prettier
- .env environment variables for API keys
- Query DynamoDB to grab nearby user comments using Geohash
- Local AWS setup including:
    - API Gateway
    - lambdas
    - DynamoDB to store comments
    - DynamoDB to retrieve nearby comments based on location
    - Lambda body / query string parameters validation including:
    - Missing / null
    - Invalid / out of bounds

## Planned Features

- AWS backend:
    - Lambda error handling including:
        - Curseword detection + filter
    - API Gateway rate limiting
    - Terraform to control & manage deployment of AWS resources
    - Add or remove to thumbs up / thumbs down ratings in DynamoDB
- Unit & integration tests
- Pre-commit hook to run integration & unit tests
- New updated UI
- Set loading animations when changing location via drop down component 
- Move 'Is this information accurate' feedback option into 'Should you wear a coat' component
- Background footage changing based on weather data
- Mobile support / support for different screen sizes
- Watchman for hot reloading/deployment of local aws services


## How to run the app?

- Run `./deploy-local-aws.sh` in `backend/` to deploy AWS backend
- Run `npm start` in `frontend/` to deploy ReactJS web app frontend
- Startup local dynamoDB server by running `./deploy-local-dynamodb.sh && ./deploy-local-dynamodb-tables` (assuming you have a local instance of dynamoDB downloaded in that directory in a folder named dynamodb_local_latest)

## App Screenshots

![Main App Page / Dashboard](app-screenshots/dashboard-08-07-2024.png)
