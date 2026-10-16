import { argv } from"node:process";
import { crawlSiteAsync } from "./crawl.js";

async function main() 
{
    if (argv.length > 5)
    {
        console.log("Too many args");
        process.exit(1);
    }
    if (argv.length < 5)
    {
        console.log("Missing args");
        process.exit(1);
    }

    const baseURL = argv[2];
    const conc = Number(argv[3]);
    const maxpages = Number(argv[4]);
    console.log("Starting crawl with url " + baseURL);

    const crawlResult = await crawlSiteAsync(baseURL, conc, maxpages);

    console.log("Crawled frequency:");
    for (const cPage in crawlResult)
    {
        console.log(cPage + " : " + String(crawlResult[cPage]));
    }
    process.exit(0);
}

main();