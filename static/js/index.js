//define json path
var dataPath = "./assets/data/ntc-sample-data.json";

//define tr header to columns
var nameObj = {
	"productid" : "Ürün kodu",
	"productName" : "Ürün adı",
	"productPrice" : "Birim fiyat(TL)",
	"qnty" : "Adet"
}

var digitVals0 = {"0" : "", "1" : "bir", "2" : "iki", "3" : "üç", "4" : "dört", "5" : "beş", "6" : "altı", "7" : "yedi", "8" : "sekiz", "9" : "dokuz" };
var digitVals1 = {"0" : "", "1" : "on", "2" : "yirmi", "3" : "otuz", "4" : "kırk", "5" : "elli", "6" : "altmış", "7" : "yetmiş", "8" : "seksen", "9" : "doksan" };
var digitVals2 = {"0" : "", "1" : "yüz", "2" : "iki yüz", "3" : "üç yüz", "4" : "dört yüz", "5" : "beş yüz", "6" : "altı yüz", "7" : "yedi yüz", "8" : "sekiz yüz", "9" : "dokuz yüz" };
//function that load JSON with synchronous xhr 
function loadJSON(dataPath) {   
	var request = new XMLHttpRequest();
	request.open('GET', dataPath, false);
	request.send(null);

	if (request.status === 200) {
  	return JSON.parse(request.responseText);
	}
}
//new NTCTable class extends from NTCTable
function NNTCTable(dataSourceArray, tableHeadersArray){
	NTCTable.call(this, dataSourceArray, tableHeadersArray);
}

//create prototype chain to subclass
NNTCTable.prototype = Object.create(NTCTable.prototype);
Object.defineProperty(NNTCTable.prototype, 'constructor', {
    value: NNTCTable,
    enumerable: false,
    writable: true });

//override cellsForRowAtIndex function to cast decimal values to string
NNTCTable.prototype.cellsForRowAtIndex = function (indexPath){
		var newRow = new NTCRow();
    for (var key in this.dataSource[indexPath.sectionIndex][indexPath.rowIndex]) {
        newRow.addNewCell(actualOrPlaceholder(this.dataSource[indexPath.sectionIndex][indexPath.rowIndex][key].toString()));
    }

    return newRow;
}

//split total to converting
function convertTotalToString(total){
	var ret = "Yalnız";
	var kr;
	var br;
	var bn;
	var ml;
	var totalText = total.toString();
	var splited0 = totalText.split(".");
	//get kuruş part
	kr = splited0[1];
	console.log(kr);
	//divide total as 3 digits
	var splited1 = splited0[0].match(/.{1,3}/g);
	br = splited1[splited1.length-1];
	bn = splited1[splited1.length-2];
	ml = splited1[splited1.length-3];
	ret = convertTotalToStringHelper(ml) != "" ? ret + " " + convertTotalToStringHelper(ml) + " milyon" : "Yalnız";
	ret = convertTotalToStringHelper(bn) != "" ? ret + " " + convertTotalToStringHelper(bn) + " bin" : "Yalnız";
	ret = convertTotalToStringHelper(br) != "" ? ret + " " + convertTotalToStringHelper(br) + " lira" : "Yalnız";
	ret = convertTotalToStringHelper(kr) != "" ? ret + " " + convertTotalToStringHelper(kr) + " kuruş" : "Yalnız";
	return ret;
}
// convert number to string 
function convertTotalToStringHelper(str){
	var ret = "";
	if(!str){
		return ret;
	}else if(str.length == 3){
		ret = ret + digitVals2[str[0]] + " ";
		ret = ret + digitVals1[str[1]] + " ";
		ret = ret + digitVals0[str[2]] + " ";
	}else if(str.length == 2){
		ret = ret + digitVals1[str[0]] + " ";
		ret = ret + digitVals0[str[1]] + " ";
	}else if(str.length == 1){
		ret = ret + digitVals0[str[0]] + " ";		
	}
		return ret;  
}
window.onload = function(){
	var dataArr = loadJSON(dataPath);
	var tempObj = {};
	
	//Cast dataArr to dataObj and add header.
	for(var k in dataArr[0]) tempObj[k] = nameObj[k];
	var dataObj = {"" : [tempObj].concat(dataArr)};
	
	var div0 = document.getElementById("table");
	var table = new NNTCTable(dataObj);
	var code = table.generateTableHtmlCode();
	div0.innerHTML = code;
	
	//Get rows to reach price and count field
	//Except header row
	var tempObj1 = Object.values(table.rows)[0];
	var countPriceList = [];
	for(var i = 1 ; i < tempObj1.length; i++){
		var tempList = [tempObj1[i].cellsArray[2].cellData,  tempObj1[i].cellsArray[3].cellData];
		countPriceList.push(tempList);
	}
	//calculate total with multiply price and count.
	var total = countPriceList.reduce(function(acc, cur){
		return parseFloat(acc) + cur.reduce(function(acc1, cur1){
			return parseFloat(acc1) * parseFloat(cur1);
		})
	})
	
	var div1 = document.getElementById("total");
	total = total.toFixed(2);
	div1.innerHTML = "<b>Toplam</b><br>" + total + " TL<br>" + convertTotalToString(total);
	
}

