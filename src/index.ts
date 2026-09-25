import { argv } from"node:process";


function main() 
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
    console.log("Starting crawl with url " + argv[2]);
    process.exit(0);
}

main();