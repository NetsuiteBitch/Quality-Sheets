// noinspection JSVoidFunctionReturnValueUsed

/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define(['N/search','N/log','N/record'],
    /**
     * @param{search} search
     * @param{log} log
     * @param{record} record
     */
    (search,log,record) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {string} internalid
         * @since 2015.2
         */

                const return2darray  = (searchId) => {
                    var endarray = []
                    var binsearch = search.load(searchId).run().each(
                        function (result){
                            var temp = []
                            for (var j =0; j<result.columns.length;j++){
                                temp.push(
                                    result.getText(result.columns[j]) ?  result.getText(result.columns[j]) : result.getValue(result.columns[j])
                                )
                            }
                            endarray.push(temp)
                            return true
                        }
                    )


                    return endarray;
                }

        const loaditemwithoutid = (internalid) => {

            var fieldLookUp = search.lookupFields({
                type: "item",
                id: internalid,
                columns: ['type','islotitem']
            })

            const CONST_ITEMTYPE = {
                'Assembly' : 'assemblyitem',
                'Description' : 'descriptionitem',
                'Discount' : 'discountitem',
                'GiftCert' : 'giftcertificateitem',
                'InvtPart' : 'inventoryitem',
                'Group' : 'itemgroup',
                'Kit' : 'kititem',
                'Markup' : 'markupitem',
                'NonInvtPart' : 'noninventoryitem',
                'OthCharge' : 'otherchargeitem',
                'Payment' : 'paymentitem',
                'Service' : 'serviceitem',
                'Subtotal' : 'subtotalitem'
            }

            var type = CONST_ITEMTYPE[fieldLookUp["type"][0]['value']];
            var islot = fieldLookUp["islotitem"];
            var finaltype = islot ? "lotnumbered" + type : type;
            var rec = record.load({type:finaltype,id:internalid})
            return rec
        }

        const getsublistval = (rec,fieldid,sublistid,i) => {
            return rec.getSublistValue({
               sublistId:sublistid,
                fieldId:fieldid,
                line:i
            })
        }


        const getsublistvalues = (rec,sublistid,line,valarr) => {
            // var rec = args[0]
            // var sublistid = args[1]
            // var line = args[2]
            var vals = []
            valarr.forEach((x) => {
                vals.push(getsublistval(rec,x,sublistid,line))
            })
            return vals
        }

        const searchiteminbin = (item,bin) => {
            var itemSearchObj = search.create({
                title: "A" + bin + item,
                type: "item",
                filters:
                    [
                        ["binonhand.binnumber","anyof",bin],
                        "AND",
                        ["internalid","anyof",item]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "quantityonhand",
                            join: "binOnHand",
                            sort: search.Sort.ASC,
                            label: "On Hand"
                        }),
                        search.createColumn({name: "stockunit", label: "Primary Stock Unit"})
                    ]
            });
            // itemSearchObj.save()
            // log.debug("searching",`${item}-${bin}`)
            var searchResultCount = itemSearchObj.runPaged().count;
            if (searchResultCount == 0){
                return 0
            }
            // log.debug("itemSearchObjresult count",searchResultCount);
            var results = itemSearchObj.run().getRange({start:0,end:1})
            var quantity = results[0].getValue({name:'quantityonhand',join:'binOnHand'})
            var displayname = results[0].getValue({name:'itemid'})
            return quantity
        }


        return {
            loaditemwithoutid: loaditemwithoutid,
            getsublistvalues: getsublistvalues,
            searchiteminbin: searchiteminbin,
            return2darray: return2darray
        }

    });