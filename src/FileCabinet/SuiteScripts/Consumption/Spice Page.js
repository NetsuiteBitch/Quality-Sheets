/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'N/log', 'N/record', 'N/search', 'N/transaction', 'N/ui/dialog', 'N/ui/message', 'N/ui/serverWidget','./Client Scripts/utils/xlsx.core.min'],
    /**
 * @param{file} file
 * @param{log} log
 * @param{record} record
 * @param{search} search
 * @param{transaction} transaction
 * @param{dialog} dialog
 * @param{message} message
 * @param{serverWidget} serverWidget
 */
    (file, log, record, search, transaction, dialog, message, serverWidget,excel) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        function onRequest(scriptContext) {


            if (scriptContext.request.method == "GET"){
                var form = serverWidget.createForm({
                    title: "Spice Consumption"
                })

                var spicetemplate = file.load('SuiteScripts/Consumption/Consumption Templates/Spice.xlsx').getContents()

                // log.debug("spicetemplate",spicetemplate)

                form.clientScriptModulePath = 'SuiteScripts/Consumption/Client Scripts/Spice Client.js'



                var filegroup = form.addFieldGroup({
                    id: "filegroup",
                    label: "Files"
                })


                var wordersselect = form.addField({
                    id: "workorders",
                    label: "Work Orders",
                    type: serverWidget.FieldType.MULTISELECT,
                })

                var fileupload = form.addField({
                    id: "spiceconsumefile",
                    label: "Upload Spice File Here",
                    type: serverWidget.FieldType.FILE,
                })

                var submitbutton = form.addSubmitButton({
                    label: "Submit Template"
                })

                var wosearch = search.load({
                    id: "customsearchspiceorderscurrent"
                })

                wosearch.run().each((result) => {
                    wordersselect.addSelectOption({
                        value: result.getValue("internalid"),
                        text: search.lookupFields({
                            type:"item",
                            id: result.getValue("item"),
                            columns: "itemid"
                        }).itemid
                    });

                    return true
                })



                var templatedownload = form.addButton({
                    id: "spicetemplatedownload",
                    label: "Download Template",
                    functionName: "DownloadTemplate(\"" + spicetemplate + "\")"
                })



                scriptContext.response.writePage(form)

            }else{

                var filledtemplate = scriptContext.request.files.spiceconsumefile
                var filledtemplatecontents = filledtemplate.getContents()
                var filledtemplatebook = excel.read(filledtemplatecontents,{type: 'base64'})
                log.debug('book',filledtemplatebook)
            }




        }

        return {onRequest}

    });
