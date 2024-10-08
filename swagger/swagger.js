// this file was generated by serverless-auto-swagger
            module.exports = {
  "swagger": "2.0",
  "info": {
    "title": "DCarbon Minting",
    "version": "1"
  },
  "paths": {
    "/v1/common/health": {
      "get": {
        "summary": "Check health service",
        "description": "",
        "tags": [
          "COMMON"
        ],
        "operationId": "health.get./v1/common/health",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "200 response"
          }
        }
      }
    },
    "/v1/minting": {
      "post": {
        "summary": "Trigger Minting Carbon (only for test)",
        "description": "",
        "tags": [
          "MINTING"
        ],
        "operationId": "minting.post./v1/minting",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "in": "body",
            "name": "body",
            "description": "Body required in the request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/IMintingBody"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200 response"
          }
        }
      }
    },
    "/v1/minting/device": {
      "post": {
        "summary": "Trigger Minting Carbon by Device",
        "description": "",
        "tags": [
          "MINTING"
        ],
        "operationId": "deviceMinting.post./v1/minting/device",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "in": "body",
            "name": "body",
            "description": "Body required in the request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/IDeviceMintingBody"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200 response"
          }
        }
      }
    },
    "/v1/minting/trigger": {
      "post": {
        "summary": "Trigger Minting Carbon",
        "description": "",
        "tags": [
          "MINTING"
        ],
        "operationId": "triggerMinting.post./v1/minting/trigger",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "in": "body",
            "name": "body",
            "description": "Body required in the request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/ITriggerMintingBody"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200 response"
          }
        }
      }
    },
    "/v1/common/hook/helius": {
      "post": {
        "summary": "Helius hook",
        "description": "",
        "tags": [
          "COMMON"
        ],
        "operationId": "syncTxHelius.post./v1/common/hook/helius",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "200 response"
          }
        }
      }
    },
    "/v1/common/prices": {
      "get": {
        "summary": "getTokenPrice",
        "description": "",
        "tags": [
          "COMMON"
        ],
        "operationId": "getTokenPrice.get./v1/common/prices",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "200 response"
          }
        }
      }
    }
  },
  "definitions": {
    "IHealthCheckResponse": {
      "properties": {
        "request_id": {
          "title": "IHealthCheckResponse.request_id",
          "type": "string"
        },
        "message": {
          "title": "IHealthCheckResponse.message",
          "type": "string"
        },
        "data": {
          "properties": {
            "msg": {
              "title": "IHealthCheckResponse.data.msg",
              "type": "string"
            }
          },
          "required": [
            "msg"
          ],
          "additionalProperties": false,
          "title": "IHealthCheckResponse.data",
          "type": "object"
        }
      },
      "required": [
        "request_id",
        "message",
        "data"
      ],
      "additionalProperties": false,
      "title": "IHealthCheckResponse",
      "type": "object"
    },
    "IMintingBody": {
      "properties": {
        "minter": {
          "title": "IMintingBody.minter",
          "type": "string"
        },
        "device_id": {
          "title": "IMintingBody.device_id",
          "type": "string"
        },
        "project_id": {
          "title": "IMintingBody.project_id",
          "type": "string"
        }
      },
      "required": [
        "minter",
        "device_id",
        "project_id"
      ],
      "additionalProperties": false,
      "title": "IMintingBody",
      "type": "object"
    },
    "IDeviceMintingBody": {
      "properties": {
        "device_id": {
          "title": "IDeviceMintingBody.device_id",
          "type": "number"
        },
        "project_id": {
          "title": "IDeviceMintingBody.project_id",
          "type": "number"
        }
      },
      "required": [
        "device_id",
        "project_id"
      ],
      "additionalProperties": false,
      "title": "IDeviceMintingBody",
      "type": "object"
    },
    "ITriggerMintingBody": {
      "properties": {
        "minting_schedule": {
          "$ref": "#/definitions/TMintScheduleType",
          "title": "ITriggerMintingBody.minting_schedule"
        }
      },
      "required": [
        "minting_schedule"
      ],
      "additionalProperties": false,
      "title": "ITriggerMintingBody",
      "type": "object"
    },
    "TMintScheduleType": {
      "title": "TMintScheduleType"
    }
  },
  "securityDefinitions": {},
  "host": "localhost:8086"
};