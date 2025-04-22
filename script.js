const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://news.ycombinator.com/newest");

  const articles = await page.$$eval(".athing", rows =>
    rows.map(row => {
      const title = row.querySelector(".titleline a")?.innerText;
      const link = row.querySelector(".titleline a")?.href;
      return { title, link };
    })
  );

  console.log("Top 10 Articles:");
  articles.slice(0, 10).forEach((a, i) => console.log(`${i + 1}. ${a.title} - ${a.link}`));

  await browser.close();
}

sortHackerNewsArticles();
