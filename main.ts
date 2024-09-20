import puppeteer from "puppeteer-core";
import { serve, ArrayBufferSink } from "bun";
import { configDotenv } from "dotenv";
configDotenv();
let port = Number(process.env.WEBSHOT_PORT);
if (!port) port = 9090;
console.log("Webshot is running on port", port);

const browser = await puppeteer.launch();
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function readall(stream: ReadableStream<Uint8Array>): Promise<string> {
    const r = stream.getReader();
    const buf = new ArrayBufferSink();
    while (true) {
        const chunk = await r.read();
        if (chunk.value) buf.write(chunk.value);
        if (chunk.done) break;
    }
    return new TextDecoder("utf-8").decode(buf.end());
}
function log(msg: string) {
    const now = new Date();
    const timestamp = now.toISOString();
    return `[${timestamp}] ${msg}`;
}
async function screenshot(
    url: string,
    body: string,
    width: number,
    height: number,
    type: "png" | "jpeg" | "webp",
    quality: number | undefined,
    delay: number
): Promise<Uint8Array> {
    const page = await browser.newPage();
    page.setViewport({ height, width });
    if (body === "") {
        page.goto(url);
    } else {
        page.setContent(body);
    }
    if (delay !== 0) await sleep(delay);
    try {
        const image = await page.screenshot({ encoding: "binary", type: type, quality: quality });
        page.close();
        return image;
    } catch (e) {
        page.close();
        throw e;
    }
}
serve({
    port,
    async fetch(req) {
        let msg = `[${req.method}]`;
        const queryParams = new URLSearchParams(new URL(req.url).search);
        let url = queryParams.get("url");
        let type = queryParams.get("type");
        let quality: undefined | number;
        let delay = Number(queryParams.get("delay"));
        let width = Number(queryParams.get("width"));
        let height = Number(queryParams.get("height"));
        if (!url) {
            url = "";
        } else {
            msg += ` url:${url}`;
        }
        if (!type) {
            type = "png";
        } else {
            msg += ` type:${type}`;
        }
        if (Number(queryParams.get("quality"))) {
            quality = Number(queryParams.get("quality"));
        } else {
            msg += ` quality:${quality}`;
        }
        if (!delay) {
            delay = 0;
        } else {
            msg += ` delay:${delay}`;
        }
        if (!width) {
            width = 400;
        } else {
            msg += ` width:${width}`;
        }
        if (!height) {
            height = 300;
        } else {
            msg += ` height:${height}`;
        }
        log(msg);

        if (!["png", "jpge", "webp"].includes(type as string)) {
            return new Response("The file type must be one of the following: png, jpeg, or webp.", {
                status: 400,
            });
        }
        let body = "";
        if (req.method === "POST") {
            if (!req.body) {
                return new Response("Need a html string.", {
                    status: 400,
                });
            }
            body = (await readall(req.body)).toString();
        }
        if (body === "" && url === "") {
            return new Response("Need url param", { status: 400 });
        }
        try {
            const image = await screenshot(
                url,
                body,
                width,
                height,
                type as "png" | "jpeg" | "webp",
                quality,
                delay
            );
            return new Response(image, {
                headers: {
                    "Content-Type": "image/" + type,
                    "Content-Length": image.length.toString(), // 替换为实际的图片长度
                },
            });
        } catch (e) {
            return new Response(e, { status: 500 });
        }
    },
});
