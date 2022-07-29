import {DbConnectorDefinition} from "../model/dbConnectorDefinition";
import {createConnection, getEntityManager} from "@typedorm/core";
import {mainTable} from "../model/mainTable";
import {DocumentClientV3} from "@typedorm/document-client";

export class QueryDbService {

    constructor(documentClient: DocumentClientV3) {
        createConnection({
            table: mainTable,
            entities: [DbConnectorDefinition],
            documentClient
        })
    }

    async getConnectorDefinitions(): Promise<DbConnectorDefinition[]> {
        const entityManager = getEntityManager();
        const queryResult = await entityManager.find(DbConnectorDefinition, {
            ref2: 'connectortype#23456'
        })
        console.log(queryResult);
        console.log(queryResult.items);

        // try {
        //     const queryResult: QueryCommandOutput = await this.dbClient.query({
        //         TableName: 'fcs-ava-connector-MainData',
        //         IndexName: 'REF2_PK',
        //         KeyConditionExpression: 'REF2 = :pkValue',
        //         ExpressionAttributeValues: {":pkValue": {"S": "connectortype#12345"}}
        //     });
        //     console.log(queryResult);
        //     // @ts-ignore
        //     queryResult.Items?.forEach((element, index, array) => {
        //         console.log(element.PK.S);
        //         const connectorDefinition: DbConnectorDefinition = {
        //             pk: element.PK.S,
        //             sk: element.SK.S,
        //             ref2: element.REF2.S,
        //             active: element.active.BOOL,
        //             config: element.config.M,
        //             name: element.name.S
        //         }
        //     })
        //
        // } catch (error) {
        //     console.error(error);
        //     return [];
        // }
        return [];
    }
}
