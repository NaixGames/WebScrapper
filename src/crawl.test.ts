import { expect, test } from 'vitest'
import { normalizeURL, 
        getHeadingFromHTML, 
        getFirstParagraphFromHTML, 
        getURLsFromHTML,
        getImagesFromHTML,
        extractPageData } from './crawl.js'


test('Normalizing urls correctly', () => {
    const answer = "www.boot.dev/blog/path";

    const case1 = "https://www.boot.dev/blog/path/";
    const case2 = "https://www.boot.dev/blog/path";
    const case3 = "http://www.boot.dev/blog/path/";
    const case4 = "http://www.boot.dev/blog/path";
    
    expect(normalizeURL(case1)).toBe(answer)
    expect(normalizeURL(case2)).toBe(answer)
    expect(normalizeURL(case3)).toBe(answer)
    expect(normalizeURL(case4)).toBe(answer)
})


test("getHeadingFromHTML basic", () => {
  const inputBody = `<html><body><h1>Test Title</h1></body></html>`;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "Test Title";
  expect(actual).toEqual(expected);
});


test("getHeadingFromHTML basic 2", () => {
  const inputBody = `<html><body>THIS IS TO CONFUSE ME<h2>Test Title</h2></body></html>`;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "Test Title";
  expect(actual).toEqual(expected);
});


test("getHeadingFromHTML basic 3", () => {
  const inputBody = `<html><body>THIS IS TO CONFUSE ME</body></html>`;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});


test("getFirstParagraphFromHTML main priority", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
        <p>Main paragraph.</p>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Main paragraph.";
  expect(actual).toEqual(expected);
});


test("getURLsFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one"];

  expect(actual).toEqual(expected);
});


test("getImagesFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png"];

  expect(actual).toEqual(expected);
});


test("extractPageData basic", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Title",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: ["https://crawler-test.com/link1"],
    image_urls: ["https://crawler-test.com/image1.jpg"],
  };

  expect(actual).toEqual(expected);
});