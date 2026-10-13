import { URL } from "node:url";
import { JSDOM } from 'jsdom'

export function normalizeURL(inputUrl : string)
{
    const myURL = new URL(inputUrl);
    var pathName = myURL.pathname;

    if (pathName.endsWith("/"))
    {
        pathName = pathName.slice(0,-1);
    }
    return myURL.host + pathName;
}

export function getHeadingFromHTML(html: string) : string
{
    const jsdom = new JSDOM(html);
    if (html.includes("<h1>")){
        return jsdom.window.document.querySelector("h1")?.textContent || "";
    }
    if (html.includes("<h2>")){
        return jsdom.window.document.querySelector("h2")?.textContent || "";
    }
    return "";
}

export function getFirstParagraphFromHTML(html: string) : string
{
    if (!html.includes("<p>")){
        return "";
    }
    var htmlTarget = html
    var jsdomElement = new JSDOM(html).window.document.documentElement;
     
    if (html.includes("<main>"))
    {
        jsdomElement = jsdomElement.querySelector("main") || jsdomElement;
    }
    return jsdomElement.querySelector("p")?.textContent || "";
}


export function getURLsFromHTML(html: string, baseURL: string): string[]
{
    const jsdom = new JSDOM(html);

    const queryResult = jsdom.window.document.querySelectorAll("a");
    const answer = [];

    for (const qResult of queryResult) {
        var link = qResult.getAttribute("href");
        if (link == null)
        {
            continue;
        }
        try {
            link = new URL(link, baseURL).href;
            answer.push(link);
        } catch{
            console.log("malformed link detected");
        }
        
    }
    return answer;
}

export function getImagesFromHTML(html: string, baseURL: string) : string[]
{
    const jsdom = new JSDOM(html);

    const queryResult = jsdom.window.document.querySelectorAll("img");
    const answer = [];

    for (const qResult of queryResult) {
        var link = qResult.getAttribute("src");
        if (link == null)
        {
            continue;
        }
        try {
            link = new URL(link, baseURL).href;
            answer.push(link);
        } catch{
            console.log("malformed image detected");
        }
        
    }
    return answer;
}


export async function getHTML(url: string)
{
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "MyApp/1.0" },
        });

        if (res.status >= 400) {
            console.log(`bad status: ${res.status}`);
            return;
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("text/html")) {
            console.log(`wrong content type: ${contentType}`);
            return;
        }

        return await res.text();
    } catch (err) {
        console.log(`request failed: ${(err as Error).message}`);
    }
}


export async function crawlPage(
  baseURL: string,
  currentURL: string,
  pages: Record<string, number>,
)
{
    const baseHostName = new URL(baseURL).hostname;
    const currentHostName = new URL(currentURL).hostname;

    if (baseHostName != currentHostName)
    {
        return pages;
    }
        
    const normURL = normalizeURL(currentURL);

    if (normURL in pages)
    {
        pages[normURL] = pages[normURL] + 1;
        return pages;
    }

    pages[normURL] = 1;

    const currentHTML = (await getHTML("https://" + normURL)) || "";
    console.log("Currently crawling: " + normURL);
    console.log(currentHTML);

    const urlsInPage = getURLsFromHTML(currentHTML, currentURL);

    for (const lurl of urlsInPage)
    {
        await crawlPage(baseURL, lurl, pages);
    }

    return pages;
}



export type ExtractedPageData = {
    url : string;
    heading : string;
    first_paragraph: string;
    outgoing_links: string[];
    image_urls: string[];
};


export function extractPageData(html: string, pageURL: string): ExtractedPageData
{
    const pageData : ExtractedPageData = {
        url :pageURL,
        heading : getHeadingFromHTML(html),
        first_paragraph : getFirstParagraphFromHTML(html),
        outgoing_links : getURLsFromHTML(html, pageURL),
        image_urls : getImagesFromHTML(html, pageURL),
    };
    return pageData;
}