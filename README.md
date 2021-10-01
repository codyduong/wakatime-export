# wakatime-export
This exports wakatime stats daily to a Google Sheets at 12PM UTC for the previous day's statistics.

Fork and add your own secrets to .env or to GitHub Secrets. This uses Google Service Accounts and Google Sheets API. Note that it does not
automatically create new sheets (you have to manually create, or the chronjob will fail). It splits up data by the year into seperate sheets.

Environment Variable | Description
------------ | -------------
NODE_ENV | Used for development/production (simply changes the date search from today to yesterday respectively)
USER | Wakatime Username
WAKATIME_API | Wakatime API Key 
SHEET_ID | Google Sheets ID Number
GOOGLE_CREDENTIALS | A JSON object flattened to a single line and imported through the dotenv
GOOGLE_APPLICATION_CREDENTIALS=./secrets.json | A saved location where we write GOOGLE_CREDENTIALS to
