# env-collection-scanner

Inspired by the Environment Scanner collection in the Postman public workspace but limited by collection runner issues at scale, this project scans environment and collection vairables for leaked keys and outputs a report at the end. 

During the process, the utility will log env and collection variables found to match a regex, and note whether they are marked secret or not. The ending report will only report non-secret variable offenders (collection variables cannot be secret.

Example output:
```
[
    {
        "collectionId": "16901625-31b93a62-bfbd-426b-8558-de1e971f8767",
        "collectionName": "Copy a Workspace",
        "key": "newApiKey",
        "val": "PMAK-62c583145a91792afb3957e1-83XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "workspace": "Clone Utility",
        "workspaceId": "1c5401cc-692f-4dc3-8962-763712b73425"
    },
    {
        "collectionId": "16901625-31b93a62-bfbd-426b-8558-de1e971f8767",
        "collectionName": "Copy a Workspace",
        "key": "originalApiKey",
        "val": "PMAK-62c583145a91792afb3957e1-83XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "workspace": "Clone Utility",
        "workspaceId": "1c5401cc-692f-4dc3-8962-763712b73425"
    },
    {
        "collectionId": "16901625-63d6a9c0-d843-45c7-b314-b6679eb65d4a",
        "collectionName": "Connect your Fleet - Vehicle Management API",
        "key": "APIKEY",
        "val": "PMAK-636c18414577c563685f734a-97XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "workspace": "Carson - Connected Car 1/24",
        "workspaceId": "e44c5da2-e1e3-4d1d-8cfd-79c73850e792"
    },
    {
        "environmentId": "16901625-969efe2c-da39-4569-bc3d-45be9fdd0d90",
        "environmentName": "Connected Car Workspace",
        "key": "oldTeamAPIKey",
        "val": "PMAK-62c583145a91792afb3957e1-83XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "workspace": "Clone Utility",
        "workspaceId": "1c5401cc-692f-4dc3-8962-763712b73425"
    },
    {
        "environmentId": "18475718-9058ce45-23bf-4dfc-ba0a-f440ded8f348",
        "environmentName": "Fuel Price Demo",
        "key": "google-maps-api-key",
        "val": "AIzaSyC4g4kIXkqPqstXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "workspace": "Fuel Prices",
        "workspaceId": "2c3bd2f1-32bd-4f28-80ba-b16887c7db6f"
    },
    {
        "environmentId": "16901625-3906e48e-575a-48db-980e-094ac4b1cf9c",
        "environmentName": "Electric Vehicles",
        "key": "key",
        "val": "PMAK-636c18414577c563685f734a-97XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "workspace": "Carson - Connected Car 1/24",
        "workspaceId": "e44c5da2-e1e3-4d1d-8cfd-79c73850e792"
    }
]
```
