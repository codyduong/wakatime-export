import got from 'got';
import {google} from 'googleapis';
require('dotenv').config();
const fs = require('fs');

if (!process.env.USER || !process.env.WAKATIME_API || !process.env.SHEET_ID) {
  console.log(
      `NO ${!process.env.user && 'USER'}\n 
      ${!process.env.WAKATIME_API && 'WAKATIME_API'}\n
      ${
  !process.env.GOOGLE_APLICATION_CREDENTIALS &&
        'GOOGLE_APLICATION_CREDENTIALS'
}\n
      ${!process.env.SHEET_ID && 'SHEET_ID'}\n
      `,
  );
  process.exit(1);
}

const run = async (): Promise<void> => {
  const date = new Date();
  process.env.NODE_ENV === 'production' && date.setDate(date.getDate() - 1);

  const {body} = await got(
      `https://wakatime.com/api/v1/users/${process.env.USER}/durations?date=${date
          .toISOString()
          .slice(0, 10)}`,
      {
        headers: {
          Authorization: `Basic ${process.env.WAKATIME_API}`,
        },
      },
  );
  const data = JSON.parse(body)?.data;
  let programmingSeconds = 0;
  for (const row of data) {
    programmingSeconds += row.duration;
  }
  const programmingHours = programmingSeconds / 3600;

  // This doesn't account for DST, so just dont run this thing at 1AM, LOL
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11

  const isLeapYear = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
  // A summation of the previous month's days using discrete maths.
  const daysPreviousMonth = [
    0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365,
  ];
  const dayOfYear =
    daysPreviousMonth[month] +
    date.getDate() +
    (month > 1 && isLeapYear ? 1 : 0);

  const requestBody = {
    majorDimension: 'ROWS',
    values: [[date.toLocaleDateString('en-US'), programmingHours]],
  };
  const range = `${date.getFullYear()}!A${dayOfYear}:B${dayOfYear}`;

  console.log(process.env.GOOGLE_CREDENTIALS);
  const injectedJSON = process.env.GOOGLE_CREDENTIALS ?? '';
  fs.writeFileSync('./secrets.json', injectedJSON);

  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({version: 'v4', auth: auth});

  await sheets.spreadsheets.values
      .update({
        spreadsheetId: process.env.SHEET_ID,
        range: range,
        requestBody: requestBody,
        valueInputOption: 'USER_ENTERED',
      })
      .then((): void => {
        console.log(
            `Wrote successfully to Row ${dayOfYear} (Day: ${date.toLocaleDateString(
                'en-US',
            )}) with hours recorded: ${programmingHours}`,
        );
      })
      .catch((): void => {
        console.log('Something went wrong...');
      });
};

run();
