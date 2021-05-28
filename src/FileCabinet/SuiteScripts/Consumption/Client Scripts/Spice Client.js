/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/log','N/currentRecord','N/record','N/search','./utils/utils','./utils/exceljs.min','./utils/FileSaver.min'],
/**
 * @param{log} log
 * @param{file} file
 * @param{record} record
 * @param{currentRecord} currentRecord
 * @param{utils} utils
 * @param{search} search
 * @param{excel} excel
 * @param{filesaver} filesaver
 */
function(log,currentRecord,record,search,utils,excel,filesaver) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */


     async function DownloadTemplate(templatefileobject){

        var templatebook= new excel.Workbook()

        var templatebook = await templatebook.xlsx.load(templatefileobject,{base64:true})

        var templatemainsheet = templatebook.getWorksheet("main")
        var templatelookupsheet = templatebook.getWorksheet("lookup")
        var lastrow = 3
        // console.log(templatemainsheet)

        templatemainsheet.dataValidations.add( "E3:E100",{
            type: "list",
            allowBlank: true,
            formulae: ["lookup!D:D"]
        })

        templatemainsheet.dataValidations.add("F4:F100",{
            type: "custom",
            allowBlank: true,
            showErrorMessage:true,
            formulae: ['F4<=(--(INDEX(lookup!E:E,MATCH(1,--(lookup!A:A=main!C4)*--(lookup!D:D=main!E4),0))))']
        })




        // console.log(utils.return2darray('customsearchspicebininv'))

        // console.log(templatefileobject)


        var crec = currentRecord.get()
        var worders = crec.getValue('workorders')

        for (const wid of worders){

            var wrec = record.load({
                type: "workorder",
                id: wid
            })

            var itemname = wrec.getText('assemblyitem')

            var itemidarr = []
            var itemarr = []
            var count = wrec.getLineCount('item')

            for (let i=0;i<count;i++){
                itemidarr.push(utils.getsublistvalues(wrec,'item',i,['item'])[0])
            }

            itemarr.push(["","","",""])
            for(const itemid of itemidarr){
                // var description
                const iteminfo  = search.lookupFields({type:"item",id:itemid,columns:["itemid","displayname"]})
                itemarr.push([itemname,itemid,iteminfo.itemid,iteminfo.displayname])
            }
            var startmerge = templatemainsheet.rowCount+2

            templatemainsheet.addRows(itemarr)
            templatemainsheet.mergeCells(startmerge,1,startmerge+itemarr.length-2,1)
            templatemainsheet.getCell(startmerge,1).alignment = {textRotation: 90}
        }

        //Add lookup

        var lookuparr = utils.return2darray("customsearchspicebininv")
        templatelookupsheet.addRows(lookuparr)
        console.log(lookuparr)

        //Autofit Rows
        templatemainsheet.columns.forEach(function(column){
            var dataMax = 0;
            column.eachCell({ includeEmpty: true }, function(cell){
                var columnLength = cell.value == null ? 10 : cell.value.length;
                if (columnLength > dataMax) {
                    dataMax = columnLength;
                }
            })
            column.width = dataMax < 10 ? 10 : dataMax;
        });

        //commit excel file
        // templatelookupsheet.commit()
        // templatemainsheet.commit()
        // templatebook.commit()
        //download excel file
        templatebook.xlsx.writeBuffer().then(function(buffer) {
            // done
            // console.log(buffer);

            const blob = new Blob([buffer], { type: "application/xlsx" });
            console.log(filesaver)
            saveAs(blob, "myexcel.xlsx");
        });

        // templatebook.xlsx.writeFile("temp.xlsx")
    }

    function pageInit(scriptContext){
    }


    return {
        pageInit: pageInit,
        DownloadTemplate: DownloadTemplate
    };
    
});
