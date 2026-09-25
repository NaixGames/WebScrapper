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