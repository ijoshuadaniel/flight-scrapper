const express = require('express');
const cors = require('cors');
// const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const app = express();

app.use(cors(), express.json());

app.get('/:from/:to/:date', (req, res) => {
  const { from, to, date } = req.params;
  console.log(from, to, date);
  const url = `https://www.ixigo.com/search/result/flight?from=${from.toUpperCase()}&to=${to.toUpperCase()}&date=${date}&returnDate=&adults=1&children=0&infants=0&class=e&source=Search%20Form`;
  (async function main() {
    try {
      const browser = await puppeteer.launch();
      const [page] = await browser.pages();

      await page.goto(url, { waitUntil: 'networkidle0' });
      const data = await page.evaluate(
        () => document.querySelector('*').outerHTML
      );
      const $ = cheerio.load(data);
      const flightDetails = [];
      $('.c-flight-listing-row-v2').each(async function () {
        const airlineInfo = {};
        airlineInfo.logo = $(this)
          .find('.summary-section')
          .find('.flight-info')
          .find('.airline-info')
          .find('.logo')
          .find('img')
          .attr('src');
        airlineInfo.name = $(this)
          .find('.summary-section')
          .find('.flight-info')
          .find('.airline-info')
          .find('.text')
          .find('.u-text-ellipsis')
          .find('.flight-name')
          .text();
        airlineInfo.airlineNumber = $(this)
          .find('.summary-section')
          .find('.flight-info')
          .find('.airline-info')
          .find('.text')
          .find('.u-text-ellipsis')
          .find('div')
          .text();

        const flightInfoFrom = {};
        const flightInfoTo = {};
        const others = {};
        const fare = {};

        flightInfoFrom.airportCode = $(this)
          .find('.summary-section')
          .find('.flight-info')
          .find('.flight-summary')
          .find('.left-wing')
          .find('.airport-code')
          .text();
        flightInfoFrom.time = $(this)
          .find('.summary-section')
          .find('.flight-info')
          .find('.flight-summary')
          .find('.left-wing')
          .find('.time')
          .text();
        flightInfoFrom.date = $(this)
          .find('.summary-section')
          .find('.flight-info')
          .find('.flight-summary')
          .find('.left-wing')
          .find('.date')
          .text();
        flightInfoFrom.city = $(this)
          .find('.summary-section')
          .find('.flight-info')
          .find('.flight-summary')
          .find('.left-wing')
          .find('.city')
          .text();

        flightInfoTo.airportCode = $(this)
          .find('.summary-section')
          .find('.flight-info')
          .find('.flight-summary')
          .find('.right-wing')
          .find('.airport-code')
          .text();
        flightInfoTo.time = $(this)
          .find('.summary-section')
          .find('.flight-info')
          .find('.flight-summary')
          .find('.right-wing')
          .find('.time')
          .text();
        flightInfoTo.date = $(this)
          .find('.summary-section')
          .find('.flight-info')
          .find('.flight-summary')
          .find('.right-wing')
          .find('.date')
          .text();
        flightInfoTo.city = $(this)
          .find('.summary-section')
          .find('.flight-info')
          .find('.flight-summary')
          .find('.right-wing')
          .find('.city')
          .text();

        fare.price = $(this)
          .find('.summary-section')
          .find('.provider-list')
          .find('.fare-provider-list')
          .find('.price-section')
          .text();

        others.totalTime = $(this)
          .find('.summary-section')
          .find('.timeline-widget')
          .find('.c-timeline-wrapper')
          .find('.tl')
          .text();

        others.totalStop = $(this)
          .find('.summary-section')
          .find('.timeline-widget')
          .find('.c-timeline-wrapper')
          .find('.br')
          .text();

        flightDetails.push({
          airlineInfo: {
            ...airlineInfo,
          },
          flightInfo: {
            from: {
              ...flightInfoFrom,
            },
            to: {
              ...flightInfoTo,
            },
            fare: fare,
            details: {
              ...others,
            },
          },
        });
      });

      res.json(flightDetails);

      await browser.close();
    } catch (err) {
      console.error(err);
    }
  })();
});

app.listen(80);
