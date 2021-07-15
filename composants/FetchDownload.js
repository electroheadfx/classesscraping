const getPageData = require('./FetchPage').getPageData;
const Download = require('./Download');
const validUrl = require('valid-url').isUri;

const FetchFiles = async (links, folder = 'download') => {

  for (let link of links) {
    console.log('\nFetch data on '+link);
    const data = await getPageData(link);
    // console.log(data);
    // download captions vtt
    if (validUrl(data.captions)) {
      await Download.write(data.captions, data.title+".vtt", folder);
      console.log(data.title+".vtt downloaded.");
    }
    // download video mp4
    if (validUrl(data.video)) {
      await Download.write(data.video, data.title+".mp4", folder);
      console.log(data.title+".mp4 downloaded.");
    }
    // download pdf
    if (validUrl(data.pdf)) {
      await Download.write(data.pdf, data.title+".pdf", folder);
      console.log(data.title+".pdf downloaded.");
    }
  }
  return;
}

module.exports = { FetchFiles };