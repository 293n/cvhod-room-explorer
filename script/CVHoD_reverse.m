clear all;
dir = dir();

tbl.name = 'CVHoD_reverse';
for i = 3:(length(dir) - 2)
    fileID = fopen(dir(i).name,'r');
    RoomHeader = strsplit(fgets(fileID),',');
    CurRoomID = RoomHeader{1};
    RoomXsize = min(str2num(RoomHeader{4}),7);
    RoomYsize = str2num(RoomHeader{5});
    for Y = 1:(RoomYsize + 2)
        RoomTable = strsplit(fgets(fileID),',');
        for X = 1:(RoomXsize + 2)
            if strncmp(RoomTable{X}, '08', 2)
                tbl = setfield(tbl,strcat('to',RoomTable{X}), strcat('from', CurRoomID), 'X', X-2);
                tbl = setfield(tbl,strcat('to',RoomTable{X}), strcat('from', CurRoomID), 'Y', Y-2);
            end
        end
    end
    fclose(fileID);
end

fields = fieldnames(tbl);
for i = 2:length(fields)
    revFields = fieldnames(getfield(tbl, fields{i}));
    from = table();
    fileID = fopen(strcat('./', fields{i}, '.csv'), 'wt');
    for j=1:length(revFields)
        CSVtext = "";
        CSVtext = strcat(CSVtext,strrep(revFields{j},'from',''),',');
        CSVtext = strcat(CSVtext, num2str(getfield(tbl, fields{i},revFields{j},'X')), ',');
        CSVtext = strcat(CSVtext, num2str(getfield(tbl, fields{i},revFields{j},'Y')), ',');
        fprintf(fileID, '%s\n', CSVtext);
    end
    fclose(fileID);
end