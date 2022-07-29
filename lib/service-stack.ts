import {RemovalPolicy, Stack, StackProps,} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Functions} from './construct/Functions';
import {DynamoDB} from "./construct/DynamoDB";

export interface ServiceStackProperties extends StackProps {
    readonly stageName: string;
    readonly serviceName: string;
    readonly dynamoDbRemovalPolicy?: RemovalPolicy
}

export class ServiceStack extends Stack {

    constructor(scope: Construct,
                id: string,
                properties: ServiceStackProperties) {
        super(scope, id, properties);

        const dynamoDb = new DynamoDB(this, properties);

        new Functions(this, properties, dynamoDb);

    }
}
