import * as fs from 'node:fs';
import path from 'node:path';
import { ExtractedPageData } from './crawl';

export function writeJSONReport(
  pageData: Record<string, ExtractedPageData>,
  filename = "report.json",
): void 
{
    const sorted = Object.values(pageData).sort((a, b) => a.url.localeCompare(b.url))
    const stringyfied = JSON.stringify(sorted, null, 2);
    fs.writeFileSync(path.resolve(process.cwd(), filename), stringyfied, 'utf-8');
    console.log("Report saved");
}