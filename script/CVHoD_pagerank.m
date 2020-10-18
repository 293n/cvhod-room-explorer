%%
clear all;
dir = dir();
format long;

tbl.name = 'CVHoD_pagerank';
for i = 3:(length(dir) - 3)
    fileID = fopen(dir(i).name,'r');
    RoomHeader = strsplit(fgets(fileID),',');
    CurRoomID = RoomHeader{1};
    RoomXsize = min(str2num(RoomHeader{4}),7);
    RoomYsize = str2num(RoomHeader{5});
    tbl = setfield(tbl,strcat('to',CurRoomID),'RoomNum', i-2);
    for Y = 1:(RoomYsize + 2)
        RoomTable = strsplit(fgetl(fileID),',');
        for X = 1:(RoomXsize + 2)
            toRoom = hex2dec(RoomTable{X});
            toRoomHeader = bitshift(bitand(toRoom, hex2dec('F0000000')), -28);
            toRoom = dec2hex(bitand(toRoom, hex2dec('0FFFFFFF')),8);
            if toRoomHeader >= 0 && toRoomHeader ~= 8 && toRoom ~= "00000000"
                tbl = setfield(tbl,strcat('to',toRoom), strcat('from', CurRoomID), 'X', X-2);
                tbl = setfield(tbl,strcat('to',toRoom), strcat('from', CurRoomID), 'Y', Y-2);
            end
        end
    end
    fclose(fileID);
end

%%
% create adjacent matrix
tblField = fieldnames(tbl);
adjTable = zeros(length(tblField)-1);
linkTable = cell(length(tblField), length(tblField));
RoomNumCorr = cell(length(tblField)-1,2);
for i=2:length(adjTable)+1 
    tblFieldSub = fieldnames(getfield(tbl, tblField{i}));
    RoomNumCorr{i-1,1} = erase(tblField{i},'to');
    RoomNumCorr{i-1,2} = getfield(tbl, tblField{i}, 'RoomNum');
    for j=1:length(tblFieldSub)
        if tblFieldSub(j) ~= "RoomNum"
            RoomID = erase(tblFieldSub(j), 'from');
            RoomIdx = getfield(tbl, strcat('to',RoomID{1}), 'RoomNum');
            CurRoomIdx = getfield(tbl, tblField{i}, 'RoomNum');
            adjTable(CurRoomIdx,RoomIdx) = 1;
            linkTable{CurRoomIdx,RoomIdx} = RoomID;
        end
    end
end

RoomNumCorr = sortrows(RoomNumCorr);

adjRevTable = adjTable';


%%
% eigen values and vectors
[adjVect,adjEigD] = eig(adjTable);
adjEig = abs(diag(adjEigD));
pageRank = abs(adjVect(1,:))';

[adjRevVect,adjRevEigD] = eig(adjRevTable);
adjRevEig = abs(diag(adjRevEigD));
revPageRank = abs(adjRevVect(1,:))';


G = digraph(adjTable);
Grev = digraph(adjTable');
pageRank = centrality(G, 'pagerank');
revPageRank = centrality(Grev, 'pagerank');
hub = centrality(G, 'hub');
authorities = centrality(G, 'authorities');

result = cell(length(RoomNumCorr)+1, 3);
result{1,1} = 'RoomID';
result{1,2} = 'PageRank';
result{1,3} = 'ReversePageRank';
result{1,4} = 'Hub';
result{1,5} = 'Authorities';

for i = 2:length(RoomNumCorr) + 1
    result{i,1} = RoomNumCorr{i-1,1};
    result{i,2} = pageRank(i-1)/max(pageRank);
    result{i,3} = revPageRank(i-1)/max(revPageRank);
    result{i,4} = hub(i-1)/max(hub);
    result{i,5} = authorities(i-1)/max(authorities);
end

writecell(result,'../CVHoD_pagerank.csv');


