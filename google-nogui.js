#!/usr/bin/env node

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const BASE = "https://www.google.com/search?q="
const ARGS = process.argv.slice(2);

Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"
Reverse = "\x1b[7m"
Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"


async function getPage(query) {
    try {
        query = encodeURIComponent(query);
        let res = await fetch(BASE + query, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9,it;q=0.8",
                "sec-ch-dpr": "1",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\"",
                "sec-ch-ua-arch": "\"x86\"",
                "sec-ch-ua-bitness": "\"64\"",
                "sec-ch-ua-full-version": "\"101.0.4951.41\"",
                "sec-ch-ua-full-version-list": "\" Not A;Brand\";v=\"99.0.0.0\", \"Chromium\";v=\"101.0.4951.41\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-model": "\"\"",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-ch-ua-platform-version": "\"5.17.5\"",
                "sec-ch-ua-wow64": "?0",
                "sec-ch-viewport-width": "1920",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "x-client-data": "CPyHywE=",
                "autorithy": "www.google.com",
                "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36",
            }
        });
        let html = await res.text();
        return html;
    } catch (e) {
        console.log(e)
    }
}

function getPage2(query) {
    query = encodeURIComponent(query);
    return new Promise((resolve, reject) => {

        let cmd = `curl '${BASE}${query}' \
        -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' \
        -H 'accept-language: en-US,en;q=0.9,it;q=0.8' \
        -H 'sec-ch-viewport-width: 1920' \
        -H 'upgrade-insecure-requests: 1' \
        -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36' \
        --compressed`

        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            stdout = stdout.toLowerCase();
            resolve(stdout);
        });
    })
}


async function getResults(query) {
    try {
        let html = await getPage(query);
        const dom = new JSDOM(html);
        //console.log(dom.window.document.querySelector("p").textContent); // "Hello world"
        let posts = dom.window.document.querySelectorAll("[style=\"-webkit-line-clamp:2\"]");
        let v = 0;
        for (var i = 0; i < posts.length; i++) {
            //console.log(`${FgWhite}===========================================================================`)            
            let p = posts[i];

            let init = `${i}. `;
            let space = "";
            for (var j = 0; j < init.length; j++) space += " ";
            console.log(`${FgRed}${i}.${FgMagenta} ${getTitle(p)}`);
            let text = getText(p);
            if (!text) {
                p = dom.window.document.querySelector("[data-attrid=\"wa:/description\"]");
            }
            console.log(`${FgYellow}${getUrl(p)}`)
            console.log(`${FgCyan}${getText(p)}`);
            console.log()
            //console.log(`${FgWhite}===========================================================================`)
        }
    } catch (e) {
        console.log(e)
    }
}


function getParentFromText(element) {
    return element.parentNode.parentNode;
}

function getTitle(element) {
    return formatText(getParentFromText(element).getElementsByTagName("h3")[0].outerHTML).replace(/(<.*?>)/gm, "");
}

function getText(element) {
    return formatText(element.innerHTML).replace(/(<.*?>)/gm, "");
}

function getUrl(element) {
    return getParentFromText(element).getElementsByTagName("a")[0].href
}

function isTextElement(element) {
    return element.className.includes("g ");
}

function formatText(text) {
    if (text == null || text == undefined) return text;
    text = text.replace(/&#8220;/g, "“");
    text = text.replace(/&#8221;/g, "”");
    text = text.replace(/&#8211;/g, "-");
    text = text.replace(/&#8217;/g, "'");
    text = text.replace(/&#8230;/g, "...");
    text = text.replace(/&#039;/g, "'");
    text = text.replace(/&#038;/g, "&");
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/&quot;/g, "\"");
    text = text.replace(/&#039;/g, "'");
    return text;
}

if (ARGS.length == 0) {
    console.log("Command format : \n\tgoogle-nogui [param]")
} else {
    getResults(ARGS[0])
}