import puppeteer from 'puppeteer';
import xl from 'excel4node';

export default async function handler(req, res) {
    const { keyword, filter } = req.query;

    try {
        const browser = await puppeteer.launch({
            headless: true, // Set to true for production
            args: [`--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36`],
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1024 });

        const url = `https://www.ziprecruiter.com/jobs-search?search=${encodeURIComponent(keyword)}&location=United+States&company=&refine_by_location_type=only_remote&radius=25&days=${filter}&refine_by_salary=&refine_by_employment=employment_type%3Aall`;

        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.click(".bg-black");


            const allJobsData = [];

            let currentPage = 1;
            while (true) {
                const newJobsData = await page.evaluate(() => {
                    const titles = Array.from(document.querySelectorAll("h2 a")).map(el => el.textContent);
                    const companys = Array.from(document.querySelectorAll("div.mt-\\[4px\\] div p")).map(el => el.textContent.trim());
                    const links = Array.from(document.querySelectorAll("h2 a")).map(el => el.href);

                    return titles.map((title, i) => ({
                        company: companys[i],
                        title,
                        link: links[i],
                    }));
                });

                allJobsData.push(...newJobsData);

                const nextPageLink = await page.evaluate((currentPage) => {
                    const nextButton = document.querySelector(`a[title="Page: ${currentPage + 1}"]`);
                    return nextButton ? nextButton.href : null;
                }, currentPage);

                if (!nextPageLink) {
                    break;
                }

                await page.goto(nextPageLink, { waitUntil: 'networkidle0' });
                if(currentPage === 4 ) break
                currentPage++;
            }

            await browser.close();

            // Excel generation
            const wb = new xl.Workbook();
            const ws = wb.addWorksheet('links_sheet');

            // Set worksheet headers
            ws.cell(1, 1).string("Company Name");
            ws.cell(1, 2).string("Title");
            ws.cell(1, 3).string("Link");

            // Write scraped data to worksheet
            allJobsData.forEach((item, index) => {
                ws.cell(index + 2, 1).string(item.company);
                ws.cell(index + 2, 2).string(item.title);
                ws.cell(index + 2, 3).string(item.link);
            });

            // Generate Excel buffer and send response
            wb.writeToBuffer().then((buffer) => {
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="${keyword}.xlsx"`);
                res.end(buffer);
            });
        } catch (error) {
            console.error(error);
            // Handle errors appropriately, send error response to user
        }
    }