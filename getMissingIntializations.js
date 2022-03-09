

module.exports = (document) => {
    let variableRegex = /\$[a-zA-Z_][a-zA-Z0-9_]*/gm

    let assignVariableRegex = /\$[a-zA-Z_][a-zA-Z0-9_]* *=/gm
    
    
    
    let matchWithIndex = (str, regex) => {
        let outputArr = [];
        let output = null;
        while ((output = regex.exec(str)) !== null) {
            outputArr.push({name: output[0], start: output.index});
        }
        return outputArr; 
    }
    
    
    /* Find all occurences with indexes. */
    
    variables = matchWithIndex(document,variableRegex);
    variablesBeingAssigned = matchWithIndex(document,assignVariableRegex);
    
    
    /* Remove everything except for variable names. */
    
    variablesBeingAssigned = variablesBeingAssigned.map(match => {return {name: match.name.replace(/ *=/gm, ""), start: match.start}});
    
    
    /* remove irelevant duplicates from arrays (we only care about first occurences)*/ 
    
    let removeRepeatedNameOcurences = (arr) => {
        for(let i = 0; i < arr.length; ++i) {
            for(let x = 0; x < i; ++x) {
                if(arr[i].name == arr[x].name) {
                    arr.splice(i, 1);
                    i--;
                    x = i;
                }
            }
        }
    };
    
    removeRepeatedNameOcurences(variables);
    removeRepeatedNameOcurences(variablesBeingAssigned);
    
    
    
    
    /* check if every variable is being assigned value during it's first occurence*/
    /* if not add it to the uinitializedVariablesArr */
    
    uinitializedVariablesArr = []
    
    variables.forEach((occurence)=> {
        let firstInitialization = variablesBeingAssigned.find((initializingOccurence) => {
            return initializingOccurence.name == occurence.name
        });
    
        if(!firstInitialization || occurence.start < firstInitialization.start) {
            uinitializedVariablesArr.push(occurence.name);
        }
    });
    
    
    /* generate missing code */
    
    let missingInitializations = "";
    
    uinitializedVariablesArr.forEach((uninitializedVariable) => {
        missingInitializations += 
`
if($_POST["${uninitializedVariable}"]){
    ${uninitializedVariable} = $_POST["${uninitializedVariable}"];
}else if($_GET["${uninitializedVariable}"]){
    ${uninitializedVariable} = $_GET["${uninitializedVariable}"];
}
`;
    });

    return missingInitializations;
        
}


