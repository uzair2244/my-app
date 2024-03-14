import puppeteer from "puppeteer";
import fetch from "node-fetch";
import cheerio from "cheerio";

const LinkedInPeople = async (shareCompany) => {
    const companyNames = shareCompany;
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    let links = [];

    await getLinks();

    async function getLinks() {
        for (let companyName of companyNames) {
            let urlName = companyName.split(" ").join("-");
            const url = `https://www.google.com/search?q=${urlName}+linkedin`;
            await page.goto(url, {waitUntil: "networkidle0"});

            const html = await page.content();
            const $ = cheerio.load(html);

            const searchResultLink = $('div#search div.g a[href^="https://www.linkedin.com"]').attr('href');
            
            if (searchResultLink) {
                links.push(searchResultLink);
            }
        }
    }

    await browser.close();

    const employeeNamesArray = [];
    for (let link of links) {
        const response = await fetch(link);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const employeeNames = [];
        $('h3.base-main-card__title').each((index, element) => {
            employeeNames.push(`(${$(element).text().trim()})`);
        });
        employeeNamesArray.push(employeeNames)
    }

    // console.log(employeeNamesArray)
    return employeeNamesArray;
};

export default LinkedInPeople;