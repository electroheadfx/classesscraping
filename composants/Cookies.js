const Chrome = require('chrome-cookies-secure');
const Fs = require('fs');
const Path = require('path');

const getAuthPage = (url, callback) => {
    const cookiesPath = Path.resolve(__dirname, 'cache', 'cookies.json');
    // check the cached cookies cookiesPath
    Fs.access(cookiesPath, (error) => {
        // not ceched cookies, create and read them
        if (error) {
            Chrome.getCookies(url, 'puppeteer', function(err, cookies) {
                if (err) {
                    console.log(err, 'error');
                    console.log('Not cookies, this site never was logged.');
                    return;
                }
                // console.log("--Cookies created from chrome--");
                (async () => {
                    const path = Path.resolve(__dirname, 'cache', 'cookies.json');
                    await Fs.promises.writeFile(path, JSON.stringify(cookies, null, 2));
                })();
                callback(cookies);
            });
            // cookies was created the script return
            return;
        }
        // cached cookies exist, read them
        (async () => {
            const cookiesString = await Fs.promises.readFile(cookiesPath);
            const cookies = JSON.parse(cookiesString);
            // console.log("--Cookies read from cache--");
            callback(cookies);
        })();
    });
}

module.exports = { getAuthPage };