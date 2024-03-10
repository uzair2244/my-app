import puppeteer from 'puppeteer';
import xl from 'excel4node';

export default async function handler(req, res) {
  const { keyword, filter } = req.query;

  try {
    // 1. Launch headless Puppeteer browser (ensure environment variables are set)
    // 1. Launch headless Puppeteer browser with optional User-Agent
    const browser = await puppeteer.launch({
      headless: true,
      args: [`--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36`] // Optional User-Agent
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

    // 2. Construct Indeed URL with keyword
    const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(keyword)}&l=united+states&sc=0kf%3Aattr%28DSQF7%29%3B&fromage=${filter}`;

    // 3. Navigate to Indeed URL and wait for page to load
    await page.goto(url, { waitUntil: 'networkidle0' }); // Wait for network stability

    // 4. Initialize variables and empty arrays
    let allJobsData = [];
    let nextPageButton;
    let pageNumber = 2;

    // 5. Recursive function to scrape job data and handle pagination
    async function scrapeJobs(pageNumber) {
      // 5.1. Evaluate job data within the page using Puppeteer
      const newJobsData = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll("tbody tr"));
        const data1 = rows.map((row) => {
          const columns = Array.from(row.querySelectorAll("span"));
          return columns.map((column) => column.textContent.trim()); // Trim whitespace
        });

        const links = Array.from(document.querySelectorAll('h2 a'));
        const data2 = links.map((el) => el.dataset.jk);

        return data1.map((el, id) => ({
          titles: el[0],
          company_name: el[1],
          link: "https://www.indeed.com/viewjob?jk=" + data2[id] + "&tk=1hmc8jq4dk7gl803&from=serp&vjs=3",
        }));
      });

      // 5.2. Process scraped data
      allJobsData = allJobsData.concat(newJobsData);

      // 5.3. Check for next page button
      nextPageButton = await page.evaluate((pageNumber) => {
        const nextButton = document.querySelector(`a[aria-label = "${pageNumber}"]`);
        return nextButton ? nextButton.href : null;
      }, pageNumber);

      // 5.4. Base case: If no next page button or reached a limit, return
      if (!nextPageButton || pageNumber > 3) {
        return; // Adjust limit as needed
      }

      // 5.5. Recursive call for next page
      await page.goto(nextPageButton,{ waitUntil: 'networkidle0' });
      return scrapeJobs(pageNumber + 1);
    }

    // 6. Initiate scraping with pagination handling
    await scrapeJobs(pageNumber);

    // 7. Close Puppeteer browser
    await browser.close();

    // 8. Create Excel workbook and worksheet
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('links_sheet');

    // 9. Set worksheet headers
    ws.cell(1, 1).string("Company Name");
    ws.cell(1, 2).string("Title");
    ws.cell(1, 3).string("Link");

    // 10. Write scraped data to worksheet
    allJobsData.forEach((item, index) => {
      ws.cell(index + 2, 1).string(item.company_name);
      ws.cell(index + 2, 2).string(item.titles);
      ws.cell(index + 2, 3).string(item.link);
    });

    // 11. Generate Excel buffer and send response with proper headers
    wb.writeToBuffer().then((buffer) => {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${keyword}.xlsx"`);
      res.end(buffer);
    });
  } catch (error) {
    console.error(error)
  }
}