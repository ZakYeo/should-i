# Should I ?
A web application built in ReactJS designed to pull weather data for the user based on their location & notify the user if they should bring a coat today (or not).<br>

## User Features

- Live display of weather information based on location
- Map display of user's location
- Comment system to write & display comments from users
- Thumbs up or down other users' comments (saves to DynamoDB)
- View nearby comments submitted by other users based on location
- Loading animations for components while fetching weather data
- Loading animation on 'Submit' button when submitting a comment
- Error messages if non-ok response when submitting a comment


## Codebase Features

- openweathermap API to pull live weather data
- Google Maps API to pull live map data
- Pre-commit hook using husky with ESLint & Prettier
- .env environment variables for API keys
- Query DynamoDB to grab nearby user comments using Geohash
- Unit tests & unit test running on pre-commit hook
- Local AWS setup including:
    - API Gateway
    - lambdas
    - DynamoDB to store comments
    - DynamoDB to rate comments (thumbs up or thumbs down)
    - DynamoDB to retrieve nearby comments based on location
    - Lambda body / query string parameters validation including:
        - Missing / null
        - Invalid / out of bounds
        - Profanity filter for comments
- Terraform for deployment of
    - API Gateway
    - Lambda Functions

## Planned Features

- AWS backend:
    - Improvement of profanity filter (more words)
    - API Gateway rate limiting
- Terraform of more resources
    - DynamoDB
- More unit & integration tests
- New updated UI
- Set loading animations when changing location via drop down component 
- Move 'Is this information accurate' feedback option into 'Should you wear a coat' component
- Background footage changing based on weather data
- Mobile support / support for different screen sizes
- Watchman for hot reloading/deployment of local aws services
- ESLinter for backend/ directory
- Custom Favicon
- Sort comments by rating
- Limit users from multiple ratings of comments
    - No login system, so this will be done by IP
    - One user cannot rate a thumb up or down more than once
    - One user cannot rate both thumb up and thumb down
    - User cannot rate their own comment(s)


## How to run the app?

- Make sure you have docker running in the background
- Create a file `env.json` and add the following:
```
{
  "CheckCoat": {
    "API_KEY": ""
  }
}
```
- Add your api key from https://home.openweathermap.org/ as the value
- Run `./deploy-local-aws.sh` in `backend/` to deploy AWS backend (you must have the AWS CLI installed)
- Download the local DynamoDB files from [here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html) and extract the folder
- Place the folder in ./backend
- Startup local dynamoDB server by running `./deploy-local-dynamodb.sh` (assuming you have a local instance of dynamoDB downloaded in that directory in a folder named dynamodb_local_latest & java installed)
- Now deploy the necessary DynamoDB tables via `./deploy-local-dynamodb-tables.sh` (ensure dynamoDB is already running)
- Create a .env file in ./src/ and add the following variable(s)
- `REACT_APP_GOOGLE_MAPS_API_KEY=`
- Make sure you grab your own google maps api key from Google
- Now run `npm i && npm start` in `frontend/` to deploy ReactJS web app frontend


## App Screenshots

![Main App Page / Dashboard](app-screenshots/dashboard-08-07-2024.png)
