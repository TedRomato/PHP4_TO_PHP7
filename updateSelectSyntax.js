let testStr = 
`
if($data=mysql_query("select cislo, jmeno from tabulka where cislo>15")){
    $x=0;
    while($data1=mysql_fetch_array($data)){
          $cislo[$x]=$data1["jmeno"];
          $jmeno[$x]=$data1["jmeno"];
    $x++;
    }
}
if($data=mysql_query("select cislo, jmeno from tabulka where cislo>15")){
    $x=0;
    while($data1=mysql_fetch_array($data)){
          $cislo[$x]=$data1["jmeno"];
          $jmeno[$x]=$data1["jmeno"];
    $x++;
    }
}
if($data=mysql_query("select cislo, jmeno from tabulka where cislo>15")){
    $x=0;
    while($data1=mysql_fetch_array($data)){
          $cislo[$x]=$data1["jmeno"];
          $jmeno[$x]=$data1["jmeno"];
    $x++;
    }
}
`


let originalQueryRegex = /mysql_query\((.*)\)/m;
let fetchRegex = /mysql_fetch_array\((.*)\)/m;

