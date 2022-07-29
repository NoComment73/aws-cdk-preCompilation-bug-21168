import {aws_dynamodb, RemovalPolicy, Stack} from "aws-cdk-lib";
import {ServiceStackProperties} from "../service-stack";
import {AttributeType, ProjectionType} from "aws-cdk-lib/aws-dynamodb";


export class DynamoDB {

    public readonly mainTable: aws_dynamodb.Table;


    constructor(private stack: Stack,
        properties: ServiceStackProperties) {
        this.mainTable = new aws_dynamodb.Table(stack, 'MainDataTable', {
            tableName: `${properties.serviceName}-MainData`,
            partitionKey: {name: 'PK', type: aws_dynamodb.AttributeType.STRING},
            sortKey: {name: 'SK', type: aws_dynamodb.AttributeType.STRING},
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: properties.dynamoDbRemovalPolicy ? properties.dynamoDbRemovalPolicy : RemovalPolicy.RETAIN
        });
        this.mainTable.addGlobalSecondaryIndex({
            indexName: 'SK_PK',
            partitionKey: {name: 'SK', type: AttributeType.STRING},
            sortKey: {name: 'PK', type: AttributeType.STRING},
            projectionType: ProjectionType.ALL
        });
        this.mainTable.addGlobalSecondaryIndex({
            indexName: 'REF2_PK',
            partitionKey: {name: 'REF2', type: AttributeType.STRING},
            sortKey: {name: 'PK', type: AttributeType.STRING},
            projectionType: ProjectionType.ALL
        })
    }
}
