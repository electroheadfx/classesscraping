const Puppeteer = require('puppeteer');
const Cheerio = require('cheerio');
const getAuthPage = require('./Cookies').getAuthPage;

const getPageData = (geturl) => {
    const captionsBaseUrl = 'https://fast.wistia.net/embed/captions/';
    const captionsExt = '.vtt?language=eng'

    return new Promise((resolve, reject) => {
        getAuthPage(geturl, async cookies => {
            const URL = geturl;
            const browser = await Puppeteer.launch(); // run chrome browser instance
            const page = await browser.newPage(); // create a new page
            await page.setCookie(...cookies); // load cookies
            await page.goto(URL); // load url
            const data = await page.content(); // get html data from page url
            $ = Cheerio.load(data); // read the html data with cheerio

            const title = $('h2#lecture_heading').text().trim();
            const url = $('a.download').attr('href');
            let result;
            if (url) {
                const urlType = $('a.download').text().trim();
                if (urlType.includes('Download')) {
                    const captionsID = $('div.attachment-wistia-player').attr('data-wistia-id');
                    const captions = captionsBaseUrl + captionsID + captionsExt;
                    result = { origin: URL, video: url, pdf:'', title: title, captions: captions };
                } else {
                    result = { origin: URL, video:'', pdf: url, title: title, captions: '' };
                }
            } else {
                result = { origin: URL, pdf:'', video:'', title: title, captions:'' };
            }
            browser.close();
            console.log(" Create New Request:");
            resolve(result);
        });
    });
}


const getContentData = async (links) => {

    promises = links.map( (link, index) => {
      return new Promise( async (resolve, reject) => {
        const data = await getPageData(link);
        console.log(`    Data loaded successfully (${index})`);
        // log data in the stream
        console.log(data);
        console.log('\n');
        if (data) {
        //   setTimeout(() => {
            // resolve and send data each 3000ms to promise.all
            resolve(data);   
        //   }, 100);
        }
      });
    });
    
    return await Promise.all(promises).then( results => console.log("----- Finished Job.\n"));

};


module.exports = { getPageData, getContentData };