const fs = require('fs');
const path = require('path');
const getMissingInitializations = require("./getMissingIntializations.js");


const getAllFilePaths = (targetDir, opt = {includeEmbedded: false, fileRegex: /.*/m}) => {


    let paths = [];
    const files = fs.readdirSync(targetDir, { withFileTypes: true });
    files.forEach( file => {
        let pathToFile = path.join(targetDir, file.name);
        if(file.isDirectory()) {
            if(opt.includeEmbedded) {
                paths = paths.concat(getAllFilePaths(pathToFile, opt));
            }
        }
        else if(opt.fileRegex.test(file.name)) {
            paths.push(pathToFile);
        }
    });
    return paths;
}



const targetFolder = "C:/Users/vaine/Desktop/Hanu3/testFolder"

const phpFileRegex = /[/w]*.php/m

const filePaths = getAllFilePaths(targetFolder,{includeEmbedded: true, fileRegex: phpFileRegex});



filePaths.forEach((filePath) => {
    let content = fs.readFileSync(filePath, {encoding: "utf8"});
    let missingLines = "<?\n" + getMissingInitializations(content) + "?>\n";
    fs.writeFileSync(filePath, missingLines + content, {encoding: "utf8"});

})