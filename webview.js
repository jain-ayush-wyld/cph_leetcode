async function getWebviewContent()
{
    await delay(10000);
    const fs = require("fs");
    const path = require("path");
    const vscode = require('vscode');
    const folder = vscode.workspace.workspaceFolders[0];
    const folderName = folder.name; // Name of the folder
    const folderPath = folder.uri.fsPath;
        const inputDir = path.join(folderPath, 'input');
        const expectedDir = path.join(folderPath, 'expected');
        const outputDir = path.join(folderPath, 'output');
        const inp_fileNames = fs.readdirSync(inputDir); 
        let sectionsData =[];
        inp_fileNames.forEach((fname)=> {
          const inps_name = path.join(inputDir,fname);
          const file_num = fname.match(/\d+/)[0];
          const opt_name_1 = "output_" + file_num + ".txt";
          const opts_name = path.join(outputDir,opt_name_1);
          const exp_name_1 = "expec_" + file_num + ".txt";
          const exp_name = path.join(expectedDir,exp_name_1);
          const inputContent =  fs.readFileSync(inps_name, 'utf8') ;
          const expectedContent = fs.readFileSync(exp_name, 'utf8');
        const outputContent =  fs.readFileSync(opts_name, 'utf8') ;
          sectionsData.push({input: inputContent, expected: expectedContent, output: outputContent});
        });
        let contentHtml = '';
    return`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Interactive Webview</title>
        <style>
            body {
                font-family: "Times New Roman", Times, serif;
                // margin: 1%;
                padding: 0.5%;
                background-color: #f3f3f3;
            }
            .section {
                position: relative;
                width: 100%;
                // margin-bottom: 5px;
                padding: 0.5%;
                border: 1px solid #ddd;
                background-color: #ffffff;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                box-sizing: border-box; /* Include padding and border in width */
            }
            .box {
                // margin: 10px 10px 10px 0;
                width: 98%;
                margin:1%;
                padding: 0.5%;
                border: 1px solid #ccc;
                border-radius: 4px;
                background-color: #f9f9f9;
                // height: 120px;
                overflow-x: auto; /* Horizontal scroll */
                max-width: 100%; 
                font-family: monospace;
                white-space: nowrap;
            }
            .box_1 {
                width: 98%;
                margin:1%;
                padding: 0.01%;
                border: 1px solid #ccc;
                border-radius: 4px;
                background-color: #f9f9f9;
                overflow-x: auto; /* Horizontal scroll */
                max-width: 100%; 
                font-family: monospace;
                white-space: nowrap;
            }
            .header-container {
                // justify-content: space-between; /* Aligns elements at the start and end of the container */
                // align-items: center; /* Align items vertically in the center */
                padding: 0%;
                margin: 0%;
                font-size: 12px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end; /* Aligns items to the bottom of the container */
                padding: 0.5%; 
                // border-bottom: 1px solid #ddd; /* Optional: To emphasize the bottom alignment */
                font-family: "Times New Roman", Times, serif;
            }
            .header {
                font-weight: bold;
                font-size: 10px;
                margin-bottom: 0%;
                color: #333;
            }
            .run-btn {
                font-size: 9px;
                padding: 1px 1px;
                background-color: #007acc;
                color: #ffffff;
                border: none;
                border-radius: 2px;
                cursor: pointer;
            }
            .run-btn:hover {
                background-color: #005f99;
            }
            textarea {
                width: 98%;
                height: 50%;
                border: none;
                outline: none;
                background: transparent;
                resize: vertical;
                font-family: monospace;
                font-size: 10px;
                padding:0;
                margin:0;
            }
        </style>
    </head>
    <body>
        <div id="sections"></div>
        <script>
            const vscode = acquireVsCodeApi();
            const sectionsContainer = document.getElementById('sections');
            const testCases = ${JSON.stringify(sectionsData)};
            testCases.forEach((testCase, index) => {
                const sectionHtml = \`
                    <div class="section" id="section-\${index}">
                        <div class="box_1">
                        <div class="header-container">
                            <div class="header">Input</div>
                            <button class="run-btn" onclick="run(\${index})">Run</button>
                        </div>
                        <textarea id="input-\${index}" spellcheck="false">\${testCase.input}</textarea>
                        </div>
                        <div class="box">
                            <div class="header">Expected</div>
                            <textarea id="expected-\${index}" spellcheck="false">\${testCase.expected}</textarea>
                        </div>
                        <div class="box">
                            <div class="header">Output</div>
                            <textarea id="output-\${index}" spellcheck="false" readonly>\${testCase.output}</textarea>
                        </div>
                    </div>
                \`;
                sectionsContainer.innerHTML += sectionHtml;
            });
            function run(index) {
                const inputBox = document.getElementById(\`input-\${index}\`);
                const expectedBox = document.getElementById(\`expected-\${index}\`);
                const input = inputBox.value || '';
                const expected = expectedBox.value || '';
                vscode.postMessage({
                    command: 'processRun',
                    index: index,
                    input: input,
                    expected: expected
                });
            }

            window.addEventListener('message', (event) => {
                const message = event.data;
                switch (message.command) {
                case 'updateOutput':
                const outputBox = document.getElementById(\`output-\${message.index}\`);
                outputBox.textContent = message.output; // Update the output box
                break;
        }
            });

        </script>
    </body>
    </html>
    `;
// return ends!!
}

function delay(ms) {
    const vscode = require('vscode');
    const fs = require('fs');
    const path = require('path');
    return new Promise((resolve) => setTimeout(resolve, ms));
}
module.exports = {getWebviewContent};