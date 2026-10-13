import { argv } from"node:process";
import { crawlPage } from "./crawl.js";

async function main() 
{
    if (argv.length > 3)
    {
        console.log("Too many args");
        process.exit(1);
    }
    if (argv.length < 3)
    {
        console.log("Missing args");
        process.exit(1);
    }

    const baseURL = argv[2];
    console.log("Starting crawl with url " + baseURL);

    const crawlResult = await crawlPage(baseURL, baseURL, {});

    console.log("Crawled frequency:");
    for (const cPage in crawlResult)
    {
        console.log(cPage + " : " + String(crawlResult[cPage]));
    }
    process.exit(0);
}

main();