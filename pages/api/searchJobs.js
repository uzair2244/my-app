import puppeteer from 'puppeteer';
import xl from "excel4node";

export default async function handler(req, res) {
    const { keyword } = req.query;
    console.log(keyword)

    // Call your Puppeteer script here with the provided keyword

    let job = keyword;

    let url_job = job.split(" ").join("+");

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

    const url = `https://www.indeed.com/jobs?q=${url_job}&l=united+states&sc=0kf%3Aattr%28DSQF7%29%3B&fromage=1`;
    await page.goto(url);

    let allJobsData = [];
    // let nP ;
    let number = 2;
    let companies = []

    await getjobs();

    async function getjobs() {
        const newJobsData = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll("tbody tr"));
            const data1 = rows.map(row => {
                const columns = Array.from(row.querySelectorAll("span"));
                return columns.map(column => column.textContent);
            });

            const links = Array.from(document.querySelectorAll('h2 a'));
            const data2 = links.map(el => el.dataset.jk);

            return data1.map((el, id) => ({
                titles: el[0],
                company_name: el[1],
                link: "https://www.indeed.com/viewjob?jk=" + data2[id] + "&tk=1hmc8jq4dk7gl803&from=serp&vjs=3",

            }));
        });
        for (let job of newJobsData) {
            const people = job.company_name
            // job.people = people;
            companies.push(people)
        }



        allJobsData = allJobsData.concat(newJobsData);
        // console.log(allJobsData);
        return allJobsData;
    }


    async function nextPage(number) {
        const nextPageButton = await page.evaluate((number) => {
            const nextButton = document.querySelector(`a[aria-label = "${number}"]`);
            return nextButton ? nextButton.href : null;
        }, number);

        if (nextPageButton !== null) {
            await page.goto(nextPageButton)
        }

        return nextPageButton;
    }

    let next_page = await nextPage(number);

    // console.log(next_page)


    let i = 1;
    while (i < 3) {
        if (next_page) {
            // await page.goto(next_page);
            await getjobs();
            number++;
            i++;
            await nextPage(number);
        } break;
    }

    browser.close();
    // console.log(allJobsData)

    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('links_sheet');

    ws.cell(1, 1).string("Company Name");
    ws.cell(1, 2).string("Title");
    ws.cell(1, 3).string("Link");
    // ws.cell(1, 4).string("People");s

    allJobsData.forEach((item, index) => {
        ws.cell(index + 2, 1).string(item.company_name);
        ws.cell(index + 2, 2).string(item.titles);
        ws.cell(index + 2, 3).string(item.link);
        // ws.cell(index + 2, 4).string(item.people);s
    });
    // wb.write(`${job + Math.floor(Math.random() * 10)}.xlsx`);

    

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${keyword}.xlsx"`);
    wb.writeToBuffer().then(buffer => {
        res.end(buffer);
    })


    // res.status(200).json({ message: 'Job search initiated' });
}
