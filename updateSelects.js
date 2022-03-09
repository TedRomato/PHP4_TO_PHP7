let test = `
$vzorky=mysql_query("select cislo, ukon, vysledek, date_format(datum, '%d.%m.%y') as datum from vzorky where zvire=$zvire order by cislo desc");
	while($vz=mysql_fetch_array($vzorky)):
		$c_naz_vz=$vz["ukon"];
		$naz_vz=mysql_query("select skupina, podskupina, nazev, druh_vz from ukony where cislo=$c_naz_vz");
		$naz_v=mysql_fetch_array($naz_vz);
		?>
		<tr>
			<td bgcolor="#ffffff">
			<strong><? echo $vz["datum"]; ?></strong>
			</td>
			<td bgcolor="#ffffff">
			<a href="zprava.php?cis_vz=<? echo $vz["cislo"] ?>&druh_vz=<? echo $naz_v["druh_vz"] ?>&cis_osetr=<? echo $cis_osetr ?>&cislo1=<? echo $cislo1 ?>&zvire=<? echo $zvire ?>">
			<?
			echo $naz_v["skupina"], " - ", $naz_v["podskupina"], " - ", $naz_v["nazev"], "<br>";
			?>
			</a>
			</td>
		</tr>

`

let findSelectFields = (document) => {
	// find all db selects

	let selectFieldsRegex = /(?:mysql_query\("select)(.*)(?:from)/mg

	let selectFiledsMatches = document.matchAll(selectFieldsRegex);



	// seperate individual selected fields
	let individualFiledsRegex = /(?:[A-Za-z_][\w]*\((.*)\) *(?:as *\w*|,))|([A-Za-z_][\w]*)/mg;

	let fieldsArr = [];

	for (const selectField of selectFiledsMatches) {
		fieldsArr.push(selectField[1].match(individualFiledsRegex));
	}



	// extract field name from a function if it is hidden in one

	let firstArgumentRegex = /[A-Za-z_][\w_]*\(([A-Za-z_][\w_]*),/m;
	

	fieldsArr = fieldsArr.map((fields) => {
		return fields.map((field) => {
			let firstArgument = field.match(firstArgumentRegex)
			if(firstArgument) return firstArgument[1];
			return field;
		});
	});

	return fieldsArr;
}


// find all mysql fetched arrays 
let findFetchedArrays = (document) => {
	let fetchedArrayName = /(?:mysql_query\("select(?:\r\n|\r|\n)|.)*(\$[A-Za-z_][\w_]*)(?: *= *mysql_fetch_array)/mg	
	let matches = document.matchAll(fetchedArrayName);
	let fetchedArrayNames = [] 
	for (const match of matches) {
		fetchedArrayNames.push(match[1]);
	}
	return fetchedArrayNames
}


let replaceFetchedArrayCalls = (document) => {
	let fetchedArrays = findFetchedArrays(document);
	let fetchedArraysCopy = fetchedArrays.map(val => val);
	
	
	// generate warning for duplicate fetched array names
	let fetchedArraysSet = new Set(fetchedArraysCopy);
	if(fetchedArraysSet.size !== fetchedArraysCopy.length) {
		fetchedArraysSet.forEach( fetchedArray => {
			if(fetchedArraysCopy[fetchedArraysCopy.indexOf(fetchedArray)] != undefined){
				fetchedArraysCopy[fetchedArraysCopy.indexOf(fetchedArray)] = null;
			}
		});
		let repeatingFetchedArrays = fetchedArraysCopy.reduce( (str, arr) => {return str + " " + (arr??"")},'')
		document = `/*** WARNING REPEATED NAMING IN FETCHED VARIABLES: ${repeatingFetchedArrays} ***/` + document;
	}
	
	let selectFields = findSelectFields(document);
	
	// make map for fetched array names and their respective select fields 
	let map = new Map();
	
	for (let i = 0; i < selectFields.length; i++) {
		map.set(fetchedArrays[i], selectFields[i]);
	}
	
	
	
	// replace all array calls with index of respective select field  
	let accesedArrayRegex = /([A-Za-z_][\w_]*)\[(?:\"|\') *([\w]*) *(?:\"|\')\]/mg
	
	let allMatches = document.matchAll(accesedArrayRegex);
	
	for (const match of allMatches) {
		// check if found array is one of fetched arrays
		if(map.has("$"+match[1])) {
			let patternToReplace = new RegExp(match[1] + "\\[\"" + match[2] + "\"\\]",'m');
			let replacement = match[1] + "[" + map.get("$"+match[1]).indexOf(match[2]) + "]" + `/***${match[1]}[\"${match[2]}\"]***/`;
			document = document.replace(patternToReplace, replacement);
		}
	}
	return document;
}




console.log(replaceFetchedArrayCalls(test));


