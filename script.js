// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

// Helper: Convert "5 minutes ago" → 300 seconds
function parseAge(ageText) {
  const [value, unit] = ageText.split(" ");
  const number = parseInt(value, 10);

  const unitMap = {
    minute: 60,
    minutes: 60,
    hour: 3600,
    hours: 3600,
    day: 86400,
    days: 86400,
  };

  return number * (unitMap[unit] || 0);
}

async function sortHackerNewsArticles() {
  // STEP 1: Launch browser and new tab
  const browser = await chromium.launch({ headless: false }); // true for silent
  const context = await browser.newContext();
  const page = await context.newPage();

  // STEP 2: Go to Hacker News newest articles page
  await page.goto("https://news.ycombinator.com/newest");
  await page.waitForSelector("tr.athing");

  const articles = [];

  // STEP 3: Collect articles until we have 100
  while (articles.length < 100) {
    // Grab all article titles and IDs
    const pageArticles = await page.$$eval("tr.athing", (rows) =>
      rows.map((row) => {
        const titleElement = row.querySelector(".titleline a");
        const id = row.getAttribute("id");
        return {
          title: titleElement?.innerText || "No title",
          id,
        };
      })
    );

    // Grab visible age text ("5 minutes ago", etc.)
    const ageTextList = await page.$$eval("span.age > a", (els) =>
      els.map((el) => el.innerText)
    );

    // Pair them up
    for (let i = 0; i < pageArticles.length; i++) {
      if (articles.length >= 100) break;
      const article = pageArticles[i];
      article.ageText = ageTextList[i];
      article.ageSeconds = parseAge(article.ageText);
      articles.push(article);
    }

    // Load next page if needed
    if (articles.length >= 100 || !(await page.$(".morelink"))) break;

    await page.click(".morelink");
    await page.waitForSelector("tr.athing");
  }

  // STEP 4: Print out titles + relative times
  console.log("\n ✅ Exactly the first 100 Hacker News Articles:\n");
  articles.forEach((article, i) => {
    console.log(
      `${i + 1}. "${article.title}" — ${article.ageText} (${article.ageSeconds} seconds)`
    );
  });

  // STEP 5: Validate if sorted from newest → oldest
  let isSorted = true;
  for (let i = 0; i < articles.length - 1; i++) {
    if (articles[i].ageSeconds > articles[i + 1].ageSeconds) {
      isSorted = false;
      console.log(
        `❌ Out of order at index ${i}: "${articles[i].title}" → "${articles[i + 1].title}"`
      );
    }
  }

  if (isSorted) {
    console.log("\n✅ Articles ARE sorted from newest to oldest.");
  } else {
    console.log("\n❌ Articles are NOT sorted correctly.");
  }

  // STEP 6: Close browser
  await browser.close();
}

(async () => {
  await sortHackerNewsArticles();
})();
