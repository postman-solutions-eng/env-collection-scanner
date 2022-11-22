require('dotenv').config()
const { Parser } = require('json2csv');
const postman = require('./postman.js');
const logger = require('./logger.js');
const fs = require("fs");
const commandLineArgs = require('command-line-args')


const optionDefinitions = [
    { name: 'fileName', alias: 'f', type: String, default: "output.csv" },
    { name: 'overwrite', alias: 'o', type: Boolean, default: false}
  ]
const options = commandLineArgs(optionDefinitions)

//if a filename is not given, it will default to output.csv
let outputFile;
if (options.fileName){
    outputFile = options.fileName;
  }else{
    outputFile = "output.csv"
  }

  //overwriting is the default behavior for fs.writeFile. If !overwrite, we will append date stamp to it to create a new unique file name
if (!options.overwrite && fs.existsSync(outputFile)){
    outputFile = outputFile.split('.').join('-' + Date.now() + '.');
  }
  
const regex = JSON.parse(process.env.REGEX)

const main = async () => {

    //get a list of all workspaces
    const allWorkspaces = await postman.getWorkspaces({ workspaces: "randomstring" });
    var teamWorkspaceArr = [];
    //map the env and collection ids to their workspace ids so we can identify them later in the report
    var resourceToWorkspaceMap = {};
    var environmentArrayTeam = [];
    var collectionArrayTeam = [];
    var classifiedEnvInfo = [];

    const ENVIRONMENT_STRING = "environment"
    const COLLECTION_STRING = "collection"

    const csvFields = ['resourceType', 'resourceId', 'resourceName', 'key', 'val', 'workspace', 'workspaceId','url'];
    const csvOptions = { fields: csvFields };


    // filter out public workspaces(Team Workspaces)
    for (var i = 0; i < allWorkspaces.workspaces.length; i++) {
        const currentWorkspace = allWorkspaces.workspaces[i]
        if (currentWorkspace?.type === "team" || currentWorkspace?.type === "private-team") {
            teamWorkspaceArr.push(currentWorkspace.id);
        }
    }
    //iterate through each workspace and store the collection and environment ids
    for (x in teamWorkspaceArr) {
        setTimeout(() => { }, 200)
        //get workspace
        const currentWorkspace = (await postman.getWorkspaceById(teamWorkspaceArr[x])).workspace;
       
        if (currentWorkspace && currentWorkspace.hasOwnProperty('environments')) {
            var currentEnvironmentSize = currentWorkspace.environments.length;
            for (var i = 0; i < currentEnvironmentSize; i++) {
                environmentArrayTeam.push(currentWorkspace.environments[i].uid);
                resourceToWorkspaceMap[currentWorkspace.environments[i].uid] = currentWorkspace.id
            }
        }

        if (currentWorkspace && currentWorkspace.hasOwnProperty('collections')) {
            var currentCollectionSize = currentWorkspace.collections.length;
            for (var i = 0; i < currentCollectionSize; i++) {
                collectionArrayTeam.push(currentWorkspace.collections[i].uid);
                resourceToWorkspaceMap[currentWorkspace.collections[i].uid] = currentWorkspace.id
            }
        }
    }

    //iterate through each collection & environment and check against the regex
    await scanResourceVariables(collectionArrayTeam, COLLECTION_STRING);
    await scanResourceVariables(environmentArrayTeam, ENVIRONMENT_STRING);

    try {
        //print to csv
        console.info('Scanning complete, building output document')
        const parser = new Parser(csvOptions);
        const csv = parser.parse(classifiedEnvInfo, csvFields);
        writeFile(csv);     
        logger.debug(csv)
        console.log(`Process complete, variable scanner report available in ${outputFile}`);

    } catch (err) {
        logger.error(`Encountered error building csv document: ${err}`)
    }

    function writeFile(csv) {
        fs.writeFile(outputFile, csv, (err) => {
            if (err) {
                logger.error(`Encountered error writing to file ${err}`);
            }
        });
    }

    async function scanResourceVariables(resourceArray, resourceType) {
        for (x in resourceArray) {
            setTimeout(() => { }, 200);
            const resourceId = resourceArray[x];
            const workspaceId = resourceToWorkspaceMap[resourceId];

            //get workspace name by id from allworkspaceinfo
            const workspaceMatch = (allWorkspaces.workspaces).find(obj => {
                return obj.id === workspaceId;
            });
            var workspaceName = workspaceMatch?.name;
            let currentResource
            if (resourceType == COLLECTION_STRING) {
                currentResource = (await postman.getCollectionById(resourceId)).collection
                if (currentResource.hasOwnProperty("variable")) {
                    var collectionVariables = currentResource.variable
                    var valuesArrSize = collectionVariables.length;
                    const collectionName = currentResource.info.name;

                    if (valuesArrSize !== 0) {
                        scanValues(valuesArrSize, resourceType, resourceId, collectionName, workspaceName, workspaceId, collectionVariables);
                    }
                }
            } else {
                currentResource = (await postman.getEnvironmentById(resourceId)).environment;
                const environmentName = currentResource.name;
                if (currentResource.hasOwnProperty("values")) {
                    var valuesArrSize = currentResource.values.length;
                    if (valuesArrSize !== 0) {
                        //iterate through the key/value pairs in the env
                        scanValues(valuesArrSize, resourceType, resourceId, environmentName, workspaceName, workspaceId, currentResource.values);
                    }
                }
            }
        }
        return null;
    }

    function scanValues(valuesArrSize, resourceType, resourceId, resourceName, workspaceName, workspaceId, values) {
        var url  = `https://go.postman.co/${resourceType}/${resourceId}`
        for (var i = 0; i < valuesArrSize; i++) {
            for (key in regex) {
                var regexPattern = regex[key];
                //convert to string in case of integer for matching
                const envValue = '' + values[i].value;
                const envKey = '' + values[i].key;
                temp = envValue.match(regexPattern);

                if (temp !== null) {
                    let okey = temp[0];
                    okey = okey.slice(0, okey.length / 2);
                    var newokey = okey + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

                    if (resourceType == COLLECTION_STRING || (resourceType == ENVIRONMENT_STRING && values[i].type !== "secret")) {
                        classifiedEnvInfo.push({
                            resourceType: resourceType,
                            resourceId: resourceId,
                            resourceName: resourceName,
                            key: envKey,
                            val: newokey,
                            workspace: workspaceName,
                            workspaceId: workspaceId,
                            url: url
                        });
                    }
                }
            }
        }
        return null;
    }
}
main()