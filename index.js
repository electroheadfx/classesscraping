// process.setMaxListeners(50);
const Fs = require('fs');
const Path = require('path');

const axios = require("axios")
const Puppeteer = require('puppeteer');
const Cheerio = require('cheerio');
const getAuthPage = require('./composants/Cookies').getAuthPage;
const getContentData = require('./composants/FetchPage').getContentData;
const FetchFiles = require('./composants/FetchDownload').FetchFiles;

// axios requests on public page with no authentification needed
const fetchHTML = async (url) => {
  const { data } = await axios.get(url)
  return Cheerio.load(data)
}

// main function
const extractLinks = (pageUrl, findclass) => {
  const baseurl = "https://codewithmosh.com"
  getAuthPage(pageUrl, async (cookies) => {
      const URL = pageUrl;
      const browser = await Puppeteer.launch(); // run chrome browser instance
      const page = await browser.newPage(); // create a new page
      await page.setCookie(...cookies); // load cookies
      await page.goto(URL); // load url
      const data = await page.content(); // get html data from page url
      // return Cheerio.load(data); // read the html data with cheerio
      $ = Cheerio.load(data);
  
      const sessions = $('div.row div.course-section');
      if (sessions.length == 0) {
        console.log('No valid ID session.');
        browser.close();
        return;
      }
      let folderPath = '';
      let id = 1;
      // main loop on each session
      for (let element of sessions) {
        sessionTitle = id+'-'+$(element).find('div.section-title').text().split(' (')[0].replace(/^\s+|\s+$/gm,'');
        ulSession = $(element).find('ul.section-list li');
        console.log("\n* "+sessionTitle);
        let URLS = [];
        
        // prepare session folder
        folderPath = Path.resolve(__dirname, 'download', sessionTitle);
        try {
          if (!Fs.existsSync(folderPath))
            Fs.mkdirSync(folderPath);
        } catch (err) {
          console.error(err);
        }
        
        // loop on content session
        for (let el of ulSession) {
          const sessionTitle = $(el).find('span.lecture-name').text().split(' (')[0].replace(/^\s+|\s+$/gm,'');
          const link = baseurl+$(el).find('a.item').attr("href");
          URLS.push(link);
        }
        // download session media 
        await FetchFiles(URLS, folderPath).then( () => console.log("Done."));
        // console.log(URLS);
        id = id +1;
      }
      browser.close();
  });
};

const ID = process.argv.slice(2)[0];

// Load url and extract
if (ID)
  extractLinks(`https://codewithmosh.com/courses/enrolled/${ID}`, "item");
else
  console.log('Add an ID course.');