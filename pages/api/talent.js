import puppeteer from 'puppeteer';
import xl from 'excel4node';

export default async function handler(req, res) {
    const { keyword, filter } = req.query;
    const numPages = 3;
    let allJobsData = [];

    try {
        const browser = await puppeteer.launch({
            headless: false,
            args: [`--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36`]
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1024 });

        const url = `https://www.talent.com/jobs?k=${encodeURIComponent(keyword)}&l=United%2CStates&workplace=remote&date=1&id=7a488b732bc2`;

        await page.goto(url, { waitUntil: 'networkidle0' });

        await page.evaluate((filter) => {
            const radio_button = document.querySelector(`input[name="filter-date"][value='${filter}d']`);
            if (radio_button) {
                radio_button.click();
            }
        }, filter);
        await page.waitForNavigation();

        await scrapeJobs();

        async function scrapeJobs() {
            for (let i = 0; i < numPages; i++) {
                const newJobsData = await page.evaluate(() => {

                    const filter_titles = Array.from(document.querySelectorAll(".card__job-title"));
                    const titles = filter_titles.map(el => el.textContent);

                    const filter_company = Array.from(document.querySelectorAll(".card__job-empname-label"));
                    const companys = filter_company.map(el => el.textContent.trim());

                    const filter_links = Array.from(document.querySelectorAll(".link-job-wrap"));
                    const links = filter_links.map(el => el.dataset.link);

                    const data = titles.map((title, i) => {
                        return {
                            company: companys[i],
                            title,
                            link: `www.talent.com/${links[i]}`
                        }
                    })
                    return data
                })
                allJobsData.push(...newJobsData);
                

                const nextPageButton = await page.evaluate(() => {
                    const nextButton = document.querySelector('a[aria-label="Next Page"]');
                    return nextButton ? nextButton.href : null;
                });

                if (!nextPageButton) {
                    console.log('Next page button not found.');
                    break;
                }

                await page.goto(nextPageButton);
                await page.waitForNavigation();
            };

            await browser.close();

            const wb = new xl.Workbook();
            const ws = wb.addWorksheet('links_sheet');

            ws.cell(1, 1).string("Company Name");
            ws.cell(1, 2).string("Title");
            ws.cell(1, 3).string("Link");

            const linkStyle = {
                font: {
                    color: '#0000EE',
                }
            };

            allJobsData.forEach((item, index) => {
                ws.cell(index + 2, 1).string(item.company);
                ws.cell(index + 2, 2).string(item.title);
                ws.cell(index + 2, 3).string(item.link).style(linkStyle)
            });

            wb.writeToBuffer().then((buffer) => {
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="${keyword}.xlsx"`);
                res.end(buffer);
            });
        }
    } catch (error) {
        console.error(error)
    }
}