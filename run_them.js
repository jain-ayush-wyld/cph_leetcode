async function run_all()
{
    const vscode = require('vscode');
    const fs = require('fs');
    const path = require('path');
    const editor = vscode.window.activeTextEditor; // dimag hai .js pae
    // to get path of input and expec folders else show error message
            const folder = vscode.workspace.workspaceFolders[0];
            const folderName = folder.name; // Name of the folder
            const folderPath = folder.uri.fsPath;
            const inputDir = path.join(folderPath, 'input');
            const expectedDir = path.join(folderPath, 'expected');
            const outputDir = path.join(folderPath, 'output');
            const directories = [inputDir, expectedDir, outputDir];
            directories.forEach((dir) => {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                } else {
                }
            });
            const inp_fileNames = fs.readdirSync(inputDir);
            const edi_filePath = editor.document.fileName; 
            const edi_fileName = path.basename(edi_filePath); 
            const edi_folderPath = path.dirname(edi_filePath); 
            const fileExtension = path.extname(edi_filePath);
            let commands = [];

            switch (fileExtension) {
                case ".cpp":
                    inp_fileNames.forEach((fname)=> {
                        const inps_name = path.join(inputDir,fname);
                        const file_num = fname.match(/\d+/)[0];
                        const opt_name_1 = "output_" + file_num + ".txt";
                        const opts_name = path.join(outputDir,opt_name_1);
                        commands.push(`g++ "${edi_filePath}" -o "${edi_folderPath}\\sam.exe" && type "${inps_name}" | "${edi_folderPath}\\sam.exe" > "${opts_name}"`);
                        // await delay(400);
                    });
                    // command  = `g++ ${filePath} -o ${folderPath}\\output.exe ;Get-Content input_1.txt | ./output.exe > out_1.txt`
                    break;
                case ".py":
                    inp_fileNames.forEach((fname)=> {
                        const inps_name = path.join(inputDir,fname);
                        const file_num = fname.match(/\d+/)[0];
                        const opt_name_1 = "output_" + file_num + ".txt";
                        const opts_name = path.join(outputDir,opt_name_1);
                        commands.push(`type "${inps_name}" | python "${edi_filePath}" > "${opts_name}"`)
                        // await delay(400);
                        // commands.push(`g++ ${edi_filePath} -o ${edi_folderPath}\\sam.exe ;
                            // Get-Content ${inps_name} | ./sam.exe | Out-File -FilePath ${opts_name} -Encoding utf8
                            // `)
                    });
                    break;
                default:
                    vscode.window.showErrorMessage(`Unsupported file extension: ${fileExtension}`);
                    return;
            }
            const terminal = vscode.window.createTerminal({
                    name: "terminator",
                    shellPath: "cmd.exe", 
                });
            terminal.hide(true);
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                terminal.sendText(command);
                await delay(4);
            }
            vscode.window.showInformationMessage('Running');
            //  delay(5000);
            return {filename: edi_fileName, folderpath:edi_folderPath};
}
function delay(ms) {
    const vscode = require('vscode');
    const fs = require('fs');
    const path = require('path');
    return new Promise((resolve) => setTimeout(resolve, ms));
}
module.exports = {run_all};