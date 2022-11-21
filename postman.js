const axios = require('axios');
const prompt = require('prompt');
// const log = require('./log.js');

axios.defaults.headers.common['x-api-key'] = process.env.POSTMAN_API_KEY;
axios.defaults.headers.post['Content-Type'] = 'application/json';

const sendRequest = async (config, errorMessage, attempts = 0) => {
  // if (attempts > 3) {
  //   console.log(`Attempted to send request ${attempts} times and failed`);
  //   process.exit();
  // }
  try {
    attempts = attempts +1
    const response = await axios(config);
    //console.debug(response.data);
    return response.data;
  }
  catch (e) {
    console.error(e);
    const errorMessageFormatted = `Attempted Request #${attempts} Failed - HTTP Request Error, returned:\n${e.response?.status}: ${e.response?.statusText}, ${JSON.stringify(e.response?.data)}\nWould you like to try again (y/n)?`;
    console.error(`Error: ${errorMessage}`);
    const promptSchema = {
      properties: {
        tryAgain: {
          message: errorMessageFormatted,
          required: true
        }
      }
    };
    const {tryAgain} = await prompt.get(promptSchema);
    if(tryAgain==="y"){
      await new Promise(resolve => setTimeout(resolve, 1000));
      const value = await sendRequest(config, errorMessage, attempts);
      return value;
    }
    else {
      console.log("Ending process")
      process.exit();
    }

  }
}

module.exports.getEnvironmentById = async environmentId => {
    const logMessage = `Fetching environment by id: ${environmentId}`;
    console.info(logMessage);
    const config = {
      method: 'get',
      url: `https://api.getpostman.com/environments/${environmentId}`
    };
    const environment = await sendRequest(config, logMessage);
    return environment;
  }
  
module.exports.getCollectionById = async collectionId => {
    const logMessage = `Fetching collection by id: ${collectionId}`;
    console.info(logMessage);
    const config = {
      method: 'get',
      url: `https://api.getpostman.com/collections/${collectionId}`
    };
    const collection = await sendRequest(config, logMessage);
    return collection;
  }

module.exports.getWorkspaceById = async workspaceId => {
  const logMessage = `Fetching workspace by id: ${workspaceId}`;
  console.info(logMessage);
  const config = {
    method: 'get',
    url: `https://api.getpostman.com/workspaces/${workspaceId}`
  };
  const workspace = await sendRequest(config, logMessage);
  return workspace;
}

module.exports.createWorkspace = async workspacePayload => {
  const logMessage = `create workspace with data: ${workspacePayload}`;
  console.info(logMessage);

  const config = {
    method: 'post',
    url: 'https://api.getpostman.com/workspaces',
    data : workspacePayload
  };

  const workspace = await sendRequest(config, logMessage);
  return workspace;
}

//FIXME: how to create async request without param?
module.exports.getWorkspaces = async workspaceId => {
    const logMessage = `get all workspaces`;
    console.info(logMessage);
  
    const config = {
      method: 'get',
      url: 'https://api.getpostman.com/workspaces'
    };
  
    const workspaces = await sendRequest(config, logMessage);
    return workspaces;
  }

module.exports.getAllAPIs = async workspaceId => {
  const logMessage = `get all APIs on workspaceId: ${workspaceId}`;
  console.info(logMessage);
  const config = {
    method: 'get',
    url: `https://api.getpostman.com/apis?workspace=${workspaceId}&direction=asc&sort=name`
  };

  const APIs = await sendRequest(config, logMessage);
  return APIs;
}

module.exports.deleteAPI = async apiId => {
  const logMessage = `deleting API: ${apiId}`;
  console.info(logMessage);
  const config = {
    method: 'delete',
    url: `https://api.getpostman.com/apis/${apiId}`
  };

  const API = await sendRequest(config, logMessage);
  return API;

}

module.exports.getAPIbyId = async apiId => {
  const logMessage = `get API by ID: ${apiId}`;
  console.info(logMessage);

  var config = {
    method: 'get',
    url: `https://api.getpostman.com/apis/${apiId}`
  };

  const API = await sendRequest(config, logMessage);
  return API;
}

module.exports.createAPI = async (workspaceId, apiPayload) => {
  const logMessage = `create api with on workspace: ${workspaceId} with data:\n ${apiPayload}`;
  console.info(logMessage);
  const config = {
    method: 'post',
    url: `https://api.getpostman.com/apis?workspace=${workspaceId}`,
    data : apiPayload
  };

  const API = await sendRequest(config, logMessage)
  return API;
}

module.exports.getAPIVersions = async (apiId) => {
  const logMessage = `get api versions: ${apiId}`;
  console.info(logMessage);

  const config = {
    method: 'get',
    url: `https://api.getpostman.com/apis/${apiId}/versions`,
  };

  const API = await sendRequest(config, logMessage)
  return API;
}

module.exports.createAPIVersion = async (apiId, apiVersionPayload) => {
  const logMessage = `create API version on apiID: ${apiId} with data:\n ${apiVersionPayload}`;
  console.info(logMessage);

  const config = {
    method: 'post',
    url: `https://api.getpostman.com/apis/${apiId}/versions`,
    data : apiVersionPayload
  };
  const apiVersion = await sendRequest(config, logMessage)
  return apiVersion;
}

module.exports.updateAPIVersion = async (apiId, apiVersionId, apiVersionUpdatePayload) => {
  const logMessage = `create API version meta data on apiID: ${apiId} , versionid: ${apiVersionId} with data:\n ${apiVersionUpdatePayload}`;
  console.info(logMessage);

  const config = {
    method: 'put',
    url: `https://api.getpostman.com/apis/${apiId}/versions/${apiVersionId}`,
    data : apiVersionUpdatePayload
  };

  const apiVersion = await sendRequest(config, logMessage);
  return apiVersion;
}

module.exports.getAPIVersionSchemaById = async (apiId, versionId, schemaId) => {
  if (!schemaId) {
    console.info(`No schema for API: ${apiId} version: ${versionId}`);
    return null;
  }
  const logMessage = `get schema for api:  ${apiId} version: ${versionId} schemaId: ${schemaId}`;
  console.info(logMessage);

  const config = {
    method: 'get',
    url: `https://api.getpostman.com/apis/${apiId}/versions/${versionId}/schemas/${schemaId}`,
  };

  const schema = await sendRequest(config, logMessage);
  return schema;
}

module.exports.getAPIVersionSchema = async (apiId, versionId) => {
  const logMessage = `get api:  ${apiId} version: ${versionId}`;
  console.info(logMessage);

  const config = {
    method: 'get',
    url: `https://api.getpostman.com/apis/${apiId}/versions/${versionId}`,
  };

  const schemaId = (await sendRequest(config, logMessage)).version.schema[0]
  const schema = await module.exports.getAPIVersionSchemaById(apiId, versionId, schemaId);
  return schema;
}


module.exports.createVersionSchema = async (apiId, versionId, schemaPayload) => {
  const logMessage = `create API version schema on api: ${apiId} and version: ${versionId} with data:\n ${schemaPayload}`;
  console.info(logMessage);
  const config = {
    method: 'post',
    url: `https://api.getpostman.com/apis/${apiId}/versions/${versionId}/schemas`,
    data: schemaPayload
  };

  const versionSchema = await sendRequest(config, logMessage);
  return versionSchema;
}


// if no draft, call echo
module.exports.deleteAPIVersion = async (apiId, versionId) => {
  const logMessage = `create API version schema on api: ${apiId} with versionId:\n ${versionId}`;
  console.info(logMessage);

  const config = {
    method: 'delete',
    url: `https://api.getpostman.com/apis/${apiId}/versions/${versionId}`
  };

  const deleteResponse = await sendRequest(config, logMessage)
  return deleteResponse;
}