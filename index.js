require('dotenv').config()
const { Parser } = require('json2csv');
const postman = require('./postman.js');
// const logger = require('./logger.js');

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

    const fields = ['resourceType', 'resourceId', 'resourceName', 'key', 'value', 'workspace', 'workspaceId'];
    const opts = { fields };

    // filter out public workspaces(Team Workspaces)
    for (var i = 0; i < allWorkspaces.workspaces.length; i++) {
        const currentWorkspace = allWorkspaces.workspaces[i]
        if (currentWorkspace?.type === "team" || currentWorkspace?.type === "private-team") {
            teamWorkspaceArr.push(currentWorkspace.id);
        }
    }
    //iterate through each workspace and store the collection and environment ids
    //list of all collection and environment ids we will later iterate through

    for (x in teamWorkspaceArr) {
        setTimeout(() => { }, 200)
        //get workspace
        const currentWorkspace = (await postman.getWorkspaceById(teamWorkspaceArr[x])).workspace;
        //check if there is an environment
        if (currentWorkspace && currentWorkspace.hasOwnProperty('environments')) {
            var currentEnvironmentSize = currentWorkspace.environments.length;
            // Populate Environment Array
            for (var i = 0; i < currentEnvironmentSize; i++) {
                environmentArrayTeam.push(currentWorkspace.environments[i].uid);
                resourceToWorkspaceMap[currentWorkspace.environments[i].uid] = currentWorkspace.id
            }
        }

        if (currentWorkspace && currentWorkspace.hasOwnProperty('collections')) {
            var currentCollectionSize = currentWorkspace.collections.length;
            // Populate Collections Array
            for (var i = 0; i < currentCollectionSize; i++) {
                collectionArrayTeam.push(currentWorkspace.collections[i].uid);
                resourceToWorkspaceMap[currentWorkspace.collections[i].uid] = currentWorkspace.id
            }
        }
    }

    //iterate through each collection & environment and check against the regex
   await scanResourceVariables(collectionArrayTeam, COLLECTION_STRING);
   await scanResourceVariables(environmentArrayTeam, ENVIRONMENT_STRING);

    //console.warn(JSON.stringify(classifiedEnvInfo, null, 4))


    try {
        //print to csv
        const parser = new Parser(opts);
        const csv = parser.parse(classifiedEnvInfo, fields);
        console.log(csv)
    } catch (err) {
        console.error(err);
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
            if(resourceType == COLLECTION_STRING){
                currentResource =(await postman.getCollectionById(resourceId)).collection
                if (currentResource.hasOwnProperty("variable")) {
                    var collectionVariables = currentResource.variable
                    var valuesArrSize = collectionVariables.length;
                    const collectionName = currentResource.info.name;
                    
                    if (valuesArrSize !== 0) {
                        scanValues(valuesArrSize, resourceType, resourceId, collectionName,workspaceName, workspaceId, collectionVariables);
                    }
                }
            }else{
                currentResource = (await postman.getEnvironmentById(resourceId)).environment;
                const environmentName = currentResource.name;
                if (currentResource.hasOwnProperty("values")) {
                    var valuesArrSize = currentResource.values.length;
                    if (valuesArrSize !== 0) {
                        //iterate through the key/value pairs in the env
                        scanValues(valuesArrSize, resourceType, resourceId,environmentName, workspaceName, workspaceId, currentResource.values);
                    }
                }
            }
        }
        return null;
    }

    function scanValues(valuesArrSize, resourceType, resourceId,resourceName, workspaceName, workspaceId, values) {
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
                            workspaceId: workspaceId
                        });
                    }
                }
            }
        }
        return null;
    }
}
main()