import { fetch, file } from "bun";
const a = await fetch("localhost:9090", {
    method: "POST",
    body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple HTML Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
        }
        h1 {
            color: #333;
        }
        p {
            font-size: 16px;
            color: #666;
        }
        button {
            padding: 10px 20px;
            background-color: #008CBA;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #005f73;
        }
    </style>
</head>
<body>
    <h1>Welcome to My Simple HTML Page</h1>
    <p>This is a paragraph of text on the page. You can add more content here, such as images, links, or other elements.</p>
    <button onclick="alert('Button clicked!')">Click Me</button>
</body>
</html>
`,
});

if (a.body) {
    const f = file("a.png").writer();
    const r = a.body.getReader();
    while (true) {
        const d = await r.read();
        if (d.done) break;
        f.write(d.value);
    }
}
