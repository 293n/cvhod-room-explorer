// get RoomID argument from URL
let RoomID = location.href.split("?")[1];

// initialization of arrays
let RoomTable = JSON.parse(JSON.stringify((new Array(11)).fill((new Array(8)).fill(""))));
let MapATable = JSON.parse(JSON.stringify((new Array(41)).fill((new Array(65)).fill(""))));
let MapBTable = JSON.parse(JSON.stringify((new Array(41)).fill((new Array(65)).fill(""))));
let toRoomTable = JSON.parse(JSON.stringify((new Array(100)).fill((new Array(4)).fill(""))));
let PageRankTable = JSON.parse(JSON.stringify((new Array(420)).fill((new Array(5)).fill(""))));
let PageRank = new Array();//JSON.parse(JSON.stringify((new Array(419)).fill((new Array(4)).fill(0))));

let RoomTableStr = new Array();
let MapATableStr = new Array();
let MapBTableStr = new Array();
let toRoomTableStr = new Array();
let PageRankTableStr = new Array();


// initial values of RoomID
if (!(parseInt(RoomID, 16) > 0)) {
    RoomID = "08498D1C";
}

let selection = window.getSelection();
selection.removeAllRanges();


const promise = Promise.all([getCSV(RoomTable, RoomTableStr, './table/' + RoomID + '.csv'),
                             getCSV(MapATable, MapATableStr, './table/mapA.csv'),
                             getCSV(MapBTable, MapBTableStr, './table/mapB.csv'),
                             getCSV(toRoomTable, toRoomTableStr, './table/to' + RoomID + '.csv'),
                             getCSV(PageRankTable, PageRankTableStr, './table/CVHoD_pagerank.csv')]);
promise.then((xhrArray) => initialize());


function zeroPadding(value, length){
    return value = ('00000000' + value).slice(-length);
}

// 
function displayMap(MapTable, mapID){
    for (let i = 0; i < MapTable.length-1; i++){
        for (let j = 0; j < MapTable[0].length-1; j++){
            let id = mapID + 'id' + zeroPadding(i.toString(), 2) + zeroPadding(j.toString(),2);

            let div = document.createElement('div');
                div.id = "div" + id;
                div.className = "mapBlockContainer";
                div.dataset.RoomID = MapTable[i][j];
                if (MapTable[i][j] !== "00000000") {
                    div.dataset.None = 1;
                    div.dataset.PageRank = PageRank[MapTable[i][j]]['PageRank'];
                    div.dataset.ReversePageRank = PageRank[MapTable[i][j]]['ReversePageRank'];
                    div.dataset.Hub = PageRank[MapTable[i][j]]['Hub'];
                    div.dataset.Authorities = PageRank[MapTable[i][j]]['Authorities'];
                }else{
                    div.dataset.None = 1;
                    div.dataset.PageRank = 1;
                    div.dataset.ReversePageRank = 1;
                    div.dataset.Hub = 1;
                    div.dataset.Authorities = 1;
                }

            div.addEventListener("mouseover", function(e){
                let childImg = this.firstElementChild.nextSibling;
                childImg.src = childImg.dataset.src;
            },false);

            let link = document.createElement('a');
                link.href = location.pathname +"?" + MapTable[i][j];
                link.id   = "link" + id;
                link.className = "mapBlock";

            let balloon = document.createElement('img');
                balloon.className = "balloon";
                balloon.id = "balloon" + id;
                balloon.dataset.src = "";

            if (MapTable[i][j] === "00000000"){
                link.gridArea = link.id;
                link.href = "javascript:void(0)";
                link.className = link.className + " mapUndefined";
            }else{
                if (MapTable[i][j] === RoomID){
                    link.gridArea = MapTable[i][j];
                    link.className = link.className + " mapCurrentRoom";
                    link.className = link.className + " " + MapTable[i][j];
                }else{
                    link.gridArea = MapTable[i][j];
                    link.className = link.className + " " + mapID + "defined";
                    link.className = link.className + " " + MapTable[i][j];
                }
                balloon.dataset.src = "./image/" + MapTable[i][j] + ".png";
                console.log(balloon.src);
                // draw border lines in map
                if (i >= 1 && j >= 1) {
                    if (MapTable[i][j] !== MapTable[i-1][j]){
                        link.style.borderTop = "solid";
                        link.style.borderWidth = "1px";
                        link.style.borderColor = "#DDDDDD";
                    }
                    if (MapTable[i][j] !== MapTable[i][j+1]){
                        link.style.borderRight = "solid";
                        link.style.borderWidth = "1px";
                        link.style.borderColor = "#DDDDDD";
                    }
                    if (MapTable[i][j] !== MapTable[i+1][j]){
                        link.style.borderBottom = "solid";
                        link.style.borderWidth = "1px";
                        link.style.borderColor = "#DDDDDD";
                    }
                    if (MapTable[i][j] !== MapTable[i][j-1]){
                        link.style.borderLeft = "solid";
                        link.style.borderWidth = "1px";
                        link.style.borderColor = "#DDDDDD";
                    }
                }
            }
            document.getElementById(mapID).appendChild(div);
            document.getElementById(div.id).appendChild(link);
            document.getElementById(div.id).appendChild(balloon);
        }
    }
}

function displayToBox(table){
    let i=0;
    while (table[i][0]!==""){
        let link = document.createElement('a');
            link.id = 'toimglinkid' + zeroPadding(i, 2);
            link.href =  link.href = location.pathname +"?" + table[i][0];

        let img = document.createElement('img');
            img.id = "toimgid" + zeroPadding(i, 2);
            img.src = "./image/" + table[i][0] + ".png";
            img.className = "toImg";
        document.getElementById('toBox').appendChild(link);
        document.getElementById(link.id).appendChild(img);
        i++;
    }
}

function pagerank(table){
    for (let i = 1; i < table.length; i++){
        PageRank[table[i][0]] = {}; //{table[0][j]: table[i][j]};
        PageRank[table[i][0]]['PageRank'] = parseFloat(table[i][1]);
        PageRank[table[i][0]]['ReversePageRank'] = parseFloat(table[i][2]);
        PageRank[table[i][0]]['Hub'] = parseFloat(table[i][3]);
        PageRank[table[i][0]]['Authorities'] = parseFloat(table[i][4]);
    }
}

function mapFilter(str){
    let cur = document.getElementById('mapA').firstElementChild.nextSibling.nextSibling;
    while(cur != null){
        cur.style.opacity = cur.dataset[str];
        cur = cur.nextSibling;
    }
    cur = document.getElementById('mapB').firstElementChild.nextSibling;
    while(cur != null){
        cur.style.opacity = cur.dataset[str];
        cur = cur.nextSibling;
    }
}

// display maps and rooms
function initialize(){
    //page rank
    pagerank(PageRankTable);

    let digit = 8;
    document.getElementById('RoomID').innerHTML = RoomID.toString();
    //document.getElementById('mapA').style.gridTemplateAreas = MapATableStr;
    displayMap(MapATable, 'mapA');
    displayMap(MapBTable, 'mapB');
    displayToBox(toRoomTable);


    // display rooms
    for (let i = 0; i < 11; i++){
        for (let j = 0; j < 9; j++){
            let id = 'id' + i.toString() + j.toString();
            let NextRoomID = (parseInt(RoomTable[i+1][j],16) & 0x0FFFFFFF).toString(16).toUpperCase();
            let InBound = (parseInt(RoomTable[i+1][j],16) & 0x80000000) == -0x80000000;
            let RoomExit = (parseInt(RoomTable[i+1][j],16) & 0x70000000) >= 0x10000000;
            NextRoomID = ('00000000' + NextRoomID).slice(-digit);
            parse = parseInt(RoomTable[i][j+1],16) & 0x80000000;

            // check for adjascent
            let s_start = Math.max(i-1, 1);
            let t_start = Math.max(j-1, 0);
            let s_end = Math.min(i+1, 10);
            let t_end = Math.min(j+1, 9);
            let NextInBound = false;
            for (let s = s_start; s <= s_end; s++){
                for (let t = t_start; t <= t_end; t++){
                    NextInBound = parseInt(RoomTable[s+1][t],16) >= 0x80000000;
                    if (NextInBound == true){
                        break;
                    }
                }
                if (NextInBound == true){
                    break;
                }
            }


            let link = document.createElement('a');
                link.href = location.pathname +"?" + NextRoomID;
                link.id   = "link" + id;
            let div = document.createElement('div');
                div.className = 'imageBox';
            
            let room = document.createElement('span');
                room.className = 'showRoomID';
                room.id = "room" + id;

            if (NextRoomID === "00000000"){
                div.style.backgroundColor = "#313131";
                room.style.backgroundColor = "#313131";
                room.innerHTML = 'Crash';

            }else{
                if (NextInBound === true) {
                    div.style.filter = "opacity(70%)";
                    room.style.backgroundColor = "#00000080";
                    room.innerHTML = 'Warp to ' + NextRoomID;
                }else{
                    div.style.filter = "saturate(50%) brightness(50%)";
                }
                div.style.backgroundImage = "url('./image/" + NextRoomID + ".png')"
            }
            
            div.id = id;
            div.style.content = NextRoomID;

            if (InBound === true) {
                div.style.borderColor = "#FF0000";
                div.style.backgroundColor = "#FF0000";
                if (i==1 && j==1){
                    div.style.filter = "brightness(100%)";
                }else{
                    div.style.filter = "brightness(70%)";
                }
                div.style.backgroundImage = "url('./image/" + RoomID + ".png')"
                room.style.backgroundColor = "#FF000080";
                room.innerHTML = 'Current Room';
            }
            if (RoomExit === true) {
                div.style.borderColor = "#5151FF";
                div.style.filter = "brightness(100%)";
                div.style.backgroundImage = "url('./image/" + NextRoomID + ".png')"
                room.style.backgroundColor = "#0000FF80";
                room.innerHTML = 'Exit to ' + NextRoomID;
            }

            // create HTML elements
            document.getElementById('canvas').appendChild(link);
            document.getElementById(link.id).appendChild(div);
            document.getElementById(div.id).appendChild(room);
        }
    }
    let main = document.getElementById('mainBox');
    main.style.display = 'flex';
}


// get CSV file
function getCSV(table, str, path){
    const p = new Promise((resolve,rejct) => {
        let req = new XMLHttpRequest();
        req.open("get", path, true);
        req.addEventListener('load', (e) => resolve(req));
        req.responseType = 'text';
        req.send(null);

        req.onreadystatechange = recieveCSV.bind(null, table, str, req);

    });
    return p;
}

// recieve CSV file
function recieveCSV(table, str, req){
    if(req.readyState === 4 && req.status === 200){
        let response = req.response;
        if (typeof response === "string"){
            convertCSVtoArray(table, response);
        }
        response = response.replace(/ \n/g, '\n');
        response = response.replace(/\n/g, '\" \"');
        response = response.replace(/,"/g, '\"');
        response = '\"' + response.replace(/,/g, ' ');

        str[0] = response.slice(0, this.length - 2);
    }
}

// convert CSV to array
function convertCSVtoArray(table, str){
    let result = [];
    let tmp = str.split("\n");

    for(let i=0;i<tmp.length;++i){
        result[i] = tmp[i].split(',');
    }
    table_tmp = JSON.parse(JSON.stringify(result)); 
    for (let i=0; i < table_tmp.length; i++) {
        table[i] = JSON.parse(JSON.stringify(table_tmp[i]))
    }
    table = result.concat();
}
