import pLimit, { LimitFunction } from 'p-limit';
import { normalizeURL, getURLsFromHTML } from './crawl';

export class ConcurrentCrawler{
    public baseURL: string;
    public pages: Record<string, number>;
    public limit: LimitFunction;
    public baseHostName: string;
    public maxPages: number;
    public shouldStop: boolean;
    public allTasks: Set<Promise<void>>;
    public visited: Set<string>;

    constructor(baseurl: string, maxconcurrency: number, maxpages: number) {
        this.baseURL = baseurl;
        this.pages = {};
        this.limit = pLimit(maxconcurrency);
        this.baseHostName = new URL(baseurl).hostname;
        this.maxPages = maxpages;
        this.shouldStop = false;
        this.allTasks = new Set<Promise<void>>();
        this.visited = new Set<string>;
    }


    private addPageVisit(normalizedURL: string) : boolean{
        if (this.shouldStop)
        {
            return false;
        }

        if (normalizedURL in this.visited)
        {
            return false;
        }

        if (this.visited.size == this.maxPages)
        {
            this.shouldStop = true;
            console.log("Reached maximum number of pages to crawl.");
            return false;
        }

        if (normalizedURL in this.pages)
        {
            this.pages[normalizedURL] = this.pages[normalizedURL] + 1;
            return false;
        }

        this.pages[normalizedURL] = 1;
        this.visited.add(normalizedURL);
        return true;
    }


    private async getHTML(url: string) : Promise<string>
    {
        return await this.limit( async () => {
            try {
                const res = await fetch(url, {
                    headers: { "User-Agent": "MyApp/1.0" },
                });

                if (res.status >= 400) {
                    console.log(`bad status: ${res.status}`);
                    return "";
                }

                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("text/html")) {
                    console.log(`wrong content type: ${contentType}`);
                    return "";
                }

                return await res.text();
            } catch (err) {
                console.log(`request failed: ${(err as Error).message}`);
                return ""
            }
        })
    }


    private async crawlPage(currentURL: string): Promise<void>
    {
        if (this.shouldStop)
        {
            return;
        }

        const currentHostName = new URL(currentURL).hostname;
    
        if (this.baseHostName != currentHostName)
        {
            return;
        }
            
        const normURL = normalizeURL(currentURL);
    
        if (!this.addPageVisit(normURL))
        {
            return;
        }

        const currentHTML = (await this.getHTML("https://" + normURL)) || "";
        console.log("Currently crawling: " + normURL);
        console.log(currentHTML);
    
        const urlsInPage = getURLsFromHTML(currentHTML, currentURL);
        const promisesURLS : Promise<void>[] = new Array(urlsInPage.length);

        for (var i=0; i<urlsInPage.length; i++)
        {
            const task = new Promise<void>(() => {
                this.crawlPage(urlsInPage[i]);
            });
            this.allTasks.add(task);
            promisesURLS[i] = task;
            task.finally(() => this.allTasks.delete(task));
        }

        await Promise.all(promisesURLS);
    }

    public async crawl() : Promise<Record<string, number>>
    {
        await this.crawlPage(this.baseURL);
        return this.pages;
    }
}