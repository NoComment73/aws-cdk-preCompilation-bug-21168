import 'reflect-metadata'
import {StepFunctionQueryDbEvent} from "./model/stepFunctionQueryDbEvent";
import {StepFunctionQueryDbResult} from "./model/stepFunctionQueryDbResult";
import {QueryDbService} from "./service";
import {DocumentClientV3} from "@typedorm/document-client";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";

exports.loadFromDb = async (event: StepFunctionQueryDbEvent): Promise<StepFunctionQueryDbResult> => {
    const documentClient = new DocumentClientV3(new DynamoDBClient({}))
    const service = new QueryDbService(documentClient);
    const connectorDefinitions = await service.getConnectorDefinitions();
    return {"connectorDefinitions": connectorDefinitions};
}
