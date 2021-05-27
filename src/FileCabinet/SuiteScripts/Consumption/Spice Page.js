/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'N/log', 'N/record', 'N/search', 'N/transaction', 'N/ui/dialog', 'N/ui/message', 'N/ui/serverWidget'],
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
    (file, log, record, search, transaction, dialog, message, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {


            var form = serverWidget.createForm({
                title: "Spice Consumption"
            })

            var spicetemplate = file.load('SuiteScripts/Consumption/Consumption Templates/Spice.xlsx').getContents()

            log.debug("spicetemplate",spicetemplate)

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




        }

        return {onRequest}

    });
