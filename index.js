require('dotenv').config()
const postman = require('./postman.js');
// const logger = require('./logger.js');

//TODO replace this with command line arg
// const regex = { "Basic Auth": "Basic [a-zA-Z0-9\/+]{4,1000}[=]?", "Postman API Key": "PMAK-[a-f0-9]{24}-[a-f0-9]{34}", "Bearer Token": "Bearer [a-zA-Z0-9\/+.-]{15,1000}", "Slack Token": "xox[pb](?:[-a-zA-Z0-9]{4,1000})", "RSA private key": "-----BEGIN RSA PRIVATE KEY-----", "SSH (DSA) private key": "-----BEGIN DSA PRIVATE KEY-----", "SSH (EC) private key": "-----BEGIN EC PRIVATE KEY-----", "PGP private key block": "-----BEGIN PGP PRIVATE KEY BLOCK-----", "Amazon AWS Access Key ID": "AKIA[0-9A-Z]{16}", "AWS Access Key": "AKIA[0-9A-Z]{16}", "Facebook OAuth": "[f|F][a|A][c|C][e|E][b|B][o|O][o|O][k|K].*['|\"][0-9a-f]{32}['|\"]", "Generic API Key": "[a|A][p|P][i|I][_]?[k|K][e|E][y|Y].*['|\"][0-9a-zA-Z]{32,45}['|\"]", "Generic Secret": "[s|S][e|E][c|C][r|R][e|E][t|T].*['|\"][0-9a-zA-Z]{32,45}['|\"]", "Google API Key": "AIza[0-9A-Za-z\\-_]{35}", "Google Cloud Platform OAuth": "[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com", "Google (GCP) Service-account": "\"type\": \"service_account\"", "Google OAuth Access Token": "ya29\\.[0-9A-Za-z\\-_]+", "Heroku API Key": "[h|H][e|E][r|R][o|O][k|K][u|U].*[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}", "Password in URL": "(http|https|HTTP|HTTPS):[^\\s:@]{3,20}:[^\\s:@]{3,20}@.(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\\-]*[A-Za-z0-9]){1,100}", "Slack Webhook": "https:\/\/hooks\\.slack\\.com\/services\/T[a-zA-Z0-9_]{8}\/B[a-zA-Z0-9_]{8}\/[a-zA-Z0-9_]{1,24}", "Stripe API Key": "sk_live_[0-9a-zA-Z]{24}", "Stripe Restricted API Key": "rk_live_[0-9a-zA-Z]{24}", "Twitter Access Token": "[t|T][w|W][i|I][t|T][t|T][e|E][r|R].*[1-9][0-9]+-[0-9a-zA-Z]{40}", "Twitter OAuth": "[t|T][w|W][i|I][t|T][t|T][e|E][r|R].*['|\"][0-9a-zA-Z]{35,44}['|\"]" }
const regex = JSON.parse(process.env.REGEX)
console.log(regex)
const main = async () => {
    console.log('starting process')

    //get a list of all workspaces
    const allWorkspaces = await postman.getWorkspaces({ workspaces: "randomstring" });
    var teamWorkspaceArr = [];

    // filter out public workspaces(Team Workspaces)
    for (var i = 0; i < allWorkspaces.workspaces.length; i++) {
        const currentWorkspace = allWorkspaces.workspaces[i]
        if (currentWorkspace?.type === "team" || currentWorkspace?.type === "private-team") {
            teamWorkspaceArr.push(currentWorkspace.id);
        }
    }
    //iterate through each workspace and store the collection and environment ids
    //list of all collection and environment ids we will later iterate through

    //map the env and collection ids to their workspace ids so we can identify them later in the report
    var resourceToWorkspaceMap = {};
    var environmentArrayTeam = [];
    var collectionArrayTeam = [];
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

    var classifiedEnvInfo = [];

    for (x in collectionArrayTeam) {
        setTimeout(() => { }, 200)
        const collectionId = collectionArrayTeam[x];
        const currentCollectoin = (await postman.getCollectionById(collectionId)).collection;
        const collectionName = currentCollectoin.info.name;
        const workspaceId = resourceToWorkspaceMap[collectionId]
        //get workspace name by id from allworkspaceinfo
        const result = (allWorkspaces.workspaces).find(obj => {
            return obj.id === workspaceId
        })
        var workspaceName = result?.name

        if (currentCollectoin.hasOwnProperty("variable")) {
            var collectionVariables = currentCollectoin.variable
            var valuesArrSize = collectionVariables.length;
            if (valuesArrSize !== 0) {
                //iterate through the key/value pairs in the collection
                for (var i = 0; i < valuesArrSize; i++) {
                    for (key in regex) {
                        const regexPattern = regex[key]
                        //convert to string in case of integer for matching
                        const collectionVarValue = '' + collectionVariables[i].value
                        const collectionVarKey = '' + collectionVariables[i].key
                        temp = collectionVarValue.match(regexPattern);

                        if (temp !== null) {
                            let okey = temp[0];
                            okey = okey.slice(0, okey.length / 2);
                            var newokey = okey + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

                            console.warn(`WS: ${workspaceName} [ID: ${workspaceId}] / Collection: ${collectionName} [ID: ${collectionId}] / Key: ${collectionVarKey} / Secret: NO`)

                            classifiedEnvInfo.push({
                                collectionId: collectionId,
                                collectionName: currentCollectoin.info.name,
                                key: collectionVarKey,
                                val: newokey,
                                workspace: workspaceName,
                                workspaceId: workspaceId
                            });

                        }

                    }
                }
            }
        }
    }

    //iterate through each environment and check against the regex
    for (x in environmentArrayTeam) {
        setTimeout(() => { }, 200)
        const environmentId = environmentArrayTeam[x]
        const currentEnvironment = (await postman.getEnvironmentById(environmentId)).environment;
        const environmentName = currentEnvironment.name
        const workspaceId = resourceToWorkspaceMap[environmentId]
        //get workspace name by id from allworkspaceinfo
        const result = (allWorkspaces.workspaces).find(obj => {
            return obj.id === workspaceId
        })
        var workspaceName = result?.name

        if (currentEnvironment.hasOwnProperty("values")) {
            var valuesArrSize = currentEnvironment.values.length;
            if (valuesArrSize !== 0) {
                //iterate through the key/value pairs in the env
                for (var i = 0; i < valuesArrSize; i++) {
                    for (key in regex) {
                        var regexPattern = regex[key]
                        //convert to string in case of integer for matching
                        const envValue = '' + currentEnvironment.values[i].value
                        const envKey = '' + currentEnvironment.values[i].key
                        temp = envValue.match(regexPattern);

                        if (temp !== null) {
                            let okey = temp[0];
                            okey = okey.slice(0, okey.length / 2);
                            var newokey = okey + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
                            if (currentEnvironment.values[i].type == "secret") {
                                console.info(`WS: ${workspaceName} [ID: ${workspaceId}] / Env: ${environmentName} [ID: ${environmentId}] / Key: ${currentEnvironment.values[i].key} / Secret: YES`)
                            } else {
                                console.warn(`WS: ${workspaceName} [ID: ${workspaceId}] / Env: ${environmentName} [ID: ${environmentId}] / Key: ${currentEnvironment.values[i].key} / Secret: NO`)
                                //only add non-secret values to ending report
                                classifiedEnvInfo.push({
                                    environmentId: environmentId,
                                    environmentName: environmentName,
                                    key: envKey,
                                    val: newokey,
                                    workspace: workspaceName,
                                    workspaceId: workspaceId
                                });
                            }
                        }

                    }
                }
            }
        }
    }

    console.warn(JSON.stringify(classifiedEnvInfo, null, 4))

    //iterate through each collection and check against the regex

}
main()