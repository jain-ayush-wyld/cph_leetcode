const { pub_format_inp, pub_format_opt } = require('./format.js');
const {getWebviewContent} = require('./webview.js');
const {run_all} = require('./run_them.js')

const vscode = require('vscode');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

puppeteer.use(StealthPlugin());

/** to specify what context represents
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const app = express();
    const port = 8080;

    app.use(cors());
    app.use(bodyParser.json());

    app.post('/receive-url', (req, res) => {
        try {
            const url = req.body.url;
            
            if (!url) {
                throw new Error('No URL provided');
            }
            // console.log(url);
            fetchProblemData(url);
            // Create a more detailed notification
            vscode.window.showInformationMessage(`URL Captured: ${url}`, 
                'Copy to Clipboard')
                .then(selection => {
                    if (selection === 'Copy to Clipboard') {
                        vscode.env.clipboard.writeText(url);
                    }
                });

            res.json({ status: 'success', message: 'URL processed successfully' });
        } catch (error) {
            vscode.window.showErrorMessage(`URL Processing Error: ${error.message}`);
            res.status(400).json({ status: 'error', message: error.message });
        }
    });

    const server = app.listen(port, () => {
        vscode.window.showInformationMessage(`URL receiver server running on port ${port}`);
    });

    // Cleanup on extension deactivation
    context.subscriptions.push({
        dispose: () => {
            server.close();
        }
    });
	console.log('code ph is live now, keep coding');

	const disposable = vscode.commands.registerCommand('codeph.fetchtc', async function ()     {
        const url = await vscode.window.showInputBox({
            prompt: 'Enter the LeetCode problem URL',
            placeHolder: 'https://leetcode.com/problems/example-problem',
            validateInput: (text) => {
                try {
                    new URL(text); 
                    return null; 
                } catch (error) {
                    return 'Please enter a valid URL.';
                }
            }
        });
        if (!url) {
            vscode.window.showWarningMessage('No URL was entered.');
            return;
        }
        vscode.window.showInformationMessage(`Received URL: ${url}`);
        fetchProblemData(url);
    });

    const disposable_2 = vscode.commands.registerCommand('codeph.test_cases',async function()    {
        vscode.window.showInformationMessage('Hello World from test_codeph_new!');
        const editor = vscode.window.activeTextEditor;
        if (!editor)    {
            vscode.window.showErrorMessage("No active file is open.");
            return;
        }
         const edi_info = await run_all();
        console.log(edi_info);
        const panel = vscode.window.createWebviewPanel(
            'testCasesOutput', 
            'Test Cases Output', 
            vscode.ViewColumn.Two,
             {
                enableScripts : true
             }
        );
        panel.webview.html = await getWebviewContent();

        panel.webview.onDidReceiveMessage(
            async (message) => {
                if (message.command === 'processRun') {
                    const { index, input, expected } = message;
                    const output =  await processInput(input, expected, edi_info);
                    console.log("rcvd");
                    panel.webview.postMessage({
                        command: 'updateOutput',
                        index: index,
                        output: output
                    });
                    console.log('sent');
                }
            },
            undefined,
            context.subscriptions
        );
    });

	context.subscriptions.push(disposable);
    context.subscriptions.push(disposable_2);
}

async function processInput(input, expected, edi_info) {
    const edi_folderPath = edi_info.folderpath;
    const edi_fileName = edi_info.filename;
    const edi_filePath = path.join(edi_folderPath,edi_fileName);
    const fileExtension = path.extname(edi_filePath);
    const folder = vscode.workspace.workspaceFolders[0];
    const folderName = folder.name; 
    const folderPath = folder.uri.fsPath;
    const inputDir = path.join(folderPath, 'input');
    const expectedDir = path.join(folderPath, 'expected');
    const outputDir = path.join(folderPath, 'output');
    const inp_fileNames = fs.readdirSync(inputDir);
    var maxi = Number(0);
    inp_fileNames.forEach((fname)=> {
        const inps_name = path.join(inputDir,fname);
        var file_num = fname.match(/\d+/)[0];
        file_num = Number(file_num);
        maxi = Math.max(file_num,maxi);
    });
    maxi+=1;
    const testcase = {'input':input,'expected': expected  };
    const inputFilePath = path.join(inputDir, `input_${maxi}.txt`);
    const expecFilePath = path.join(expectedDir, `expec_${maxi}.txt`);
    const outputFilePath = path.join(outputDir,`output_${maxi}.txt`);
    fs.writeFileSync(inputFilePath, testcase.input, 'utf-8');
    fs.writeFileSync(expecFilePath, testcase.expected, 'utf-8');
    var command = "";
    switch(fileExtension) {
        case ".cpp":
            command = `g++ "${edi_filePath}" -o "${edi_folderPath}\\sam.exe" && type "${inputFilePath}" | "${edi_folderPath}\\sam.exe" > "${outputFilePath}"`;
            break;
        case ".py":
            command = `type "${inputFilePath}" | python "${edi_filePath}" > "${outputFilePath}"`;
            break;
        default:
            vscode.window.showErrorMessage(`Unsupported file extension: ${fileExtension}`);
            return;
        }
// const command = `g++ "${edi_filePath}" -o "${edi_folderPath}\\sam.exe" && type "${inputFilePath}" | "${edi_folderPath}\\sam.exe" > "${outputFilePath}"`;
    const terminal = vscode.window.createTerminal({
        name: "terminator",
        shellPath: "cmd.exe", 
    });
    terminal.sendText(command);
    terminal.hide(); 
     await delay(2000);
    var outputContent =  fs.readFileSync(outputFilePath, 'utf8') ;
    outputContent = String(outputContent);
    try {
    fs.unlinkSync(inputFilePath);
    fs.unlinkSync(outputFilePath);
    fs.unlinkSync(expecFilePath);
    }
    catch(err)
    {
        vscode.window.showErrorMessage('Check code! Run again');
    }
    return outputContent;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Function to process the given URL
 * @param {string} url - The user-provided problem URL
 */
async function fetchProblemData(url) {
    const browser = await puppeteer.launch({headless : true,
        defaultViewport : false
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const metaDescription = await page.evaluate(() => {
        const metaTag = document.querySelector('meta[name="description"]');
        return metaTag ? metaTag.content : null;
    });
    if (!metaDescription) {
        console.log('Meta description not found.');
        return;
    }
    const decodedDescription = metaDescription;
    const testCases = [];
    const regex = /Input:\s*(.*)\n*(.*)Output:\s*(.*)/g;
    const regex_1 = /Input:\s*(.*)\n*(.*)/g;
    let match;
    const test_cases =[];
    while ((match = regex_1.exec(decodedDescription)) !== null) 
        {
            const regex_2 = /Output:\s*(.*)/g;
            const st1 = match[1];
            const st2= match[2];
            const fina_1 = pub_format_inp(st1);
            // console.log(fina_1);
            const match_2 = regex_2.exec(st2);
            const st3 = match_2[1];
            const fina_2 = pub_format_opt(st3);
            testCases.push({ input: fina_1, output: fina_2 });
        }
    const folder = vscode.workspace.workspaceFolders[0];
    const folderName = folder.name;
    const folderPath = folder.uri.fsPath;
    const inputDir = path.join(folderPath, 'input');
    const expectedDir = path.join(folderPath, 'expected');
    const outputDir = path.join(folderPath, 'output');
    // Create/Clean the directories
    createOrCleanDir(inputDir);
    createOrCleanDir(expectedDir);
    createOrCleanDir(outputDir);
    testCases.forEach   (  (testCase, index) =>     {
        const inputFilePath = path.join(inputDir, `input_${index + 1}.txt`);
        const outputFilePath = path.join(expectedDir, `expec_${index + 1}.txt`);
        fs.writeFileSync(inputFilePath, testCase.input, 'utf-8');
        fs.writeFileSync(outputFilePath, testCase.output, 'utf-8');
    }   )   ;
    await browser.close();
    console.log('flag');

    // ###################################################   //
    // shiva.js if needed
}
    
const createOrCleanDir = (dirPath) => {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            fs.unlinkSync(path.join(dirPath, file));
        });
    } else {
        fs.mkdirSync(dirPath);
    }
};
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
