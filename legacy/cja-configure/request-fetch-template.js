fetch("https://datagroups.acc.appsvc.an.adobe.com/datagroups/1.0/users/sharedDimensions/dg_a64d1f7a-4d42-4638-9815-8188ecaadfd1/bulk?locale=en_US&expansion=tags,favorite,approved,storagePrecision,segmentable,dataSetIds,sourceFieldId,sourceFieldName,sourceFieldType,description,hideFromReporting,includeExcludeSetting,dataSetType,schemaPath,schemaType,type,required,tableName,baseTableName,allocation,duleLabels,deprecated,inheritedDataSetTypes,isArrayType,bucketingSetting,noValueOptionsSetting,booleanFormatSetting,defaultDimensionSort,persistenceSetting,multiValued,behaviorSetting,dateTimeFormatSetting,substringSetting,precisionSetting,summaryDataGroupingSetting", {
    "headers": {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7",
        "authorization": "XXXX",
        "cache-control": "no-cache",
        "content-type": "application/json; charset=UTF-8",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "x-gw-ims-org-id": "4D6368F454EC41940A4C98A6@AdobeOrg",
        "x-gw-ims-user-id": "838642835DCD42960A495E68@375b28235c0505160a495c4f",
        "x-request-client-type": "UI",
        "x-request-id": "9566ba8526344f78a0ac9723291e634d"
    },
    "referrer": "https://analytics.adobe.com/",
    "body": "[{\"name\":\"Search Type [v2]\",\"description\":\"change 4\",\"labels\":[],\"isDeleted\":false,\"hideFromReporting\":false,\"id\":\"variables/_experience.analytics.customDimensions.eVars.eVar2\",\"sharedComponentId\":\"69249efe368d820c0757008c\",\"sourceFieldId\":\"_experience.analytics.customDimensions.eVars.eVar2\",\"includeExcludeSetting\":{\"enabled\":false},\"persistenceSetting\":{\"enabled\":false},\"noValueOptionsSetting\":{\"includeNoneByDefault\":true,\"noneChangeable\":true,\"noneSettingType\":\"show-no-value\",\"customNoneValue\":\"No value\"},\"behaviorSetting\":{\"lowercase\":false},\"substringSetting\":{\"enabled\":false}}]",
    "method": "PUT",
    "mode": "cors",
    "credentials": "include"
});
