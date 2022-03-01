const fs = require('fs');
const puppeteer = require('puppeteer');


async function main() {
    const browser = await puppeteer.launch(
        {
            headless: false,
            timeout: 60000,
        }
    );
    const page = await browser.newPage();
    for (let i = 151; i < 600; i++) {
        const url = 'https://opensea.io/assets/0x31b79bdb59687162dab5d078197d40003c5745de/' + i.toString();
        await page.goto(url);
        console.log("refresh: " + url);
        await page.waitFor(2000);
        const elements = await page.$x("//button[contains(., 'refresh')]")
        // console.log(elements);
        await elements[0].click() 
        // await page.click(selector);
        await page.waitFor(5000);
    }
    await browser.close();
}

main().then(function () {
});
