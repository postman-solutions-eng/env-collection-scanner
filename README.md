# env-collection-scanner

Inspired by the Environment Scanner collection in the Postman public workspace but limited by collection runner issues at scale, this project scans environment and collection vairables for leaked keys and outputs a report at the end. 

During the process, the utility will log env and collection variables found to match a regex, and note whether they are marked secret or not. The ending report will only report non-secret variable offenders (collection variables cannot be secret).

### Notes on secret variables
Postman provides the ability to mark variables as secret at the environment and global scopes, while collection variables cannot be marked secret at the moment. Therefore, any variables marked as secret in environments will 

Global variables cannot be accessed via the postman api and are not scanned by this utility.

## Prerequisites
- You will need a [Postman API Key](https://learning.postman.com/docs/developer/intro-api/#generating-a-postman-api-key)


## Running the utility
1. Clone the repo
2. Set up your .env file (see below)
3. Run `npm install` to install needed dependencies
4. Run `node index.js` to run the program  
    a. Options: `-o` for overwite, `-f` for filename (see below)
5. Check the output at the end to see any exposed values

### Options
`-f` or `--filepath`: if included, will write the final output to the file name/path you speficy. File name should end in `.csv`. Default: `report.csv`.  
`-o` or `--overwrite`: If included, will overwrite the file with the given filename. If false and a file exists with the given or default filename, a datestring will be appended to make a unique filenae (ex: `report-1669071317405.csv` from `report.csv`). Default `false`.


### Setting up your `.env` file
The .env file holds values that are specific to your instance of the utility. This repo includes an `.env.sample` file that you can copy and use with a couple adjustments.
1. `POSTMAN_API_KEY` - This is the Postman API key that will be used to query resources to check for leaked keys. It should be noted that only the resources you have access to with this key will be scanned, so it is recommended that the key be generated by someone with the `super admin` team role if all resources are to be scanned.
2. `REGEX` is the list of regex values that values will be checked against, in JSON format. We have provided a sample list to start with, but you may add your own regex values as well, just be sure to match the existing formatting. 


## Example output:
```CSV
"resourceType","resourceId","resourceName","key","val","workspace","workspaceId","url"
"collection","16901625-31b93a62-bfbd-426b-8558-de1e971f8767","Copy a Workspace","newApiKey","PMAK-62c583145a91792afb3957e1-83XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX","Clone Utility","1c5401cc-692f-4dc3-8962-763712b73425","https://go.postman.co/collection/16901625-31b93a62-bfbd-426b-8558-de1e971f8767"
"collection","16901625-31b93a62-bfbd-426b-8558-de1e971f8767","Copy a Workspace","originalApiKey","PMAK-62c583145a91792afb3957e1-83XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX","Clone Utility","1c5401cc-692f-4dc3-8962-763712b73425","https://go.postman.co/collection/16901625-31b93a62-bfbd-426b-8558-de1e971f8767"
"collection","16901625-63d6a9c0-d843-45c7-b314-b6679eb65d4a","Connect your Fleet - Vehicle Management API","APIKEY","PMAK-636c18414577c563685f734a-97XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX","Carson - Connected Car 1/24","e44c5da2-e1e3-4d1d-8cfd-79c73850e792","https://go.postman.co/collection/16901625-63d6a9c0-d843-45c7-b314-b6679eb65d4a"
"environment","16901625-969efe2c-da39-4569-bc3d-45be9fdd0d90","Connected Car Workspace","oldTeamAPIKey","PMAK-62c583145a91792afb3957e1-83XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX","Clone Utility","1c5401cc-692f-4dc3-8962-763712b73425","https://go.postman.co/environment/16901625-969efe2c-da39-4569-bc3d-45be9fdd0d90"
"environment","18475718-9058ce45-23bf-4dfc-ba0a-f440ded8f348","Fuel Price Demo","google-maps-api-key","AIzaSyC4g4kIXkqPqstXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX","Fuel Prices","2c3bd2f1-32bd-4f28-80ba-b16887c7db6f","https://go.postman.co/environment/18475718-9058ce45-23bf-4dfc-ba0a-f440ded8f348"
"environment","16901625-3906e48e-575a-48db-980e-094ac4b1cf9c","Electric Vehicles","key","PMAK-636c18414577c563685f734a-97XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX","Carson - Connected Car 1/24","e44c5da2-e1e3-4d1d-8cfd-79c73850e792","https://go.postman.co/environment/16901625-3906e48e-575a-48db-980e-094ac4b1cf9c"
``` 
Same info as above but in table format:
| **"resourceType"** | **"resourceId"**                                | **"resourceName"**                            | **"key"**             | **"val"**                                                        | **"workspace"**               | **"workspaceId"**                      | **"url"**                                                                         |
|--------------------|-------------------------------------------------|-----------------------------------------------|-----------------------|------------------------------------------------------------------|-------------------------------|----------------------------------------|-----------------------------------------------------------------------------------|
| "collection"       | "16901625-31b93a62-bfbd-426b-8558-de1e971f8767" | "Copy a Workspace"                            | "newApiKey"           | "PMAK-62c583145a91792afb3957e1-83XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" | "Clone Utility"               | "1c5401cc-692f-4dc3-8962-763712b73425" | "https://go.postman.co/collection/16901625-31b93a62-bfbd-426b-8558-de1e971f8767"  |
| "collection"       | "16901625-31b93a62-bfbd-426b-8558-de1e971f8767" | "Copy a Workspace"                            | "originalApiKey"      | "PMAK-62c583145a91792afb3957e1-83XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" | "Clone Utility"               | "1c5401cc-692f-4dc3-8962-763712b73425" | "https://go.postman.co/collection/16901625-31b93a62-bfbd-426b-8558-de1e971f8767"  |
| "collection"       | "16901625-63d6a9c0-d843-45c7-b314-b6679eb65d4a" | "Connect your Fleet - Vehicle Management API" | "APIKEY"              | "PMAK-636c18414577c563685f734a-97XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" | "Carson - Connected Car 1/24" | "e44c5da2-e1e3-4d1d-8cfd-79c73850e792" | "https://go.postman.co/collection/16901625-63d6a9c0-d843-45c7-b314-b6679eb65d4a"  |
| "environment"      | "16901625-969efe2c-da39-4569-bc3d-45be9fdd0d90" | "Connected Car Workspace"                     | "oldTeamAPIKey"       | "PMAK-62c583145a91792afb3957e1-83XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" | "Clone Utility"               | "1c5401cc-692f-4dc3-8962-763712b73425" | "https://go.postman.co/environment/16901625-969efe2c-da39-4569-bc3d-45be9fdd0d90" |
| "environment"      | "18475718-9058ce45-23bf-4dfc-ba0a-f440ded8f348" | "Fuel Price Demo"                             | "google-maps-api-key" | "AIzaSyC4g4kIXkqPqstXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"              | "Fuel Prices"                 | "2c3bd2f1-32bd-4f28-80ba-b16887c7db6f" | "https://go.postman.co/environment/18475718-9058ce45-23bf-4dfc-ba0a-f440ded8f348" |
| "environment"      | "16901625-3906e48e-575a-48db-980e-094ac4b1cf9c" | "Electric Vehicles"                           | "key"                 | "PMAK-636c18414577c563685f734a-97XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" | "Carson - Connected Car 1/24" | "e44c5da2-e1e3-4d1d-8cfd-79c73850e792" | "https://go.postman.co/environment/16901625-3906e48e-575a-48db-980e-094ac4b1cf9c" |

### CSV Fields:
- resourceType: the type of resource where this key was found. Either environment or collection. 
- resourceId: the id of the resource with the matched value. Either an environment ID or collection ID. 
- resourceName: the name of the resource or collection. 
- key: the environment or collection variable name. 
- val: the environment or collection variable value. 
- workspace: the name of the workspace where the resource resides. 
- workspaceId: the id of the workspace where the resource resides. 
- url: a url that will navigate directly to the resource. 

## Logging
The application creates four log files:

| **Name**    | **Topic**                     |
|-------------|-------------------------------|
| error.log   | all errors while running      |       
| debug.log   | all logs related to debugging |      
| info.log    | output of the running tasks   |     
| comined.log | ALL logs                      |        

Once the application is running, you can access them via `tail -f <logfilename.log>`  
