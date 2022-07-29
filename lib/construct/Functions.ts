import {Duration, Stack,} from 'aws-cdk-lib';
import {Architecture, Runtime} from 'aws-cdk-lib/aws-lambda';
import {Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from 'aws-cdk-lib/aws-iam';
import {ServiceStackProperties} from '../service-stack';
import * as path from 'path';
import {DynamoDB} from "./DynamoDB";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";

const DEFAULT_MEMORY = 1024;

export class Functions {

    public readonly lambdaRole: Role;
    public readonly connectorLambda: NodejsFunction;
    public readonly queryDbLambda: NodejsFunction;

    constructor(private stack: Stack,
                properties: ServiceStackProperties,
                dynamoDb: DynamoDB) {

        this.lambdaRole = new Role(stack, 'LambdaRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            roleName: `${properties.serviceName}-${properties.stageName}-lambda-default`,
            path: '/',
            managedPolicies: [
                ManagedPolicy.fromManagedPolicyArn(stack, 'AWSLambdaBasicExecutionRole', 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'),
                ManagedPolicy.fromManagedPolicyArn(stack, 'AWSLambdaVPCAccessExecutionRole', 'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole')
            ]
        });

        this.connectorLambda = new NodejsFunction(stack, 'AvConnectorLambda', {
                bundling: {
                    preCompilation: true,
                    forceDockerBundling: true,
                },
                entry: path.join(__dirname, '../../service/ava-api/handler.ts'),
                handler: 'retrieveData',
                runtime: Runtime.NODEJS_14_X,
                architecture: Architecture.ARM_64,
                timeout: Duration.seconds(900),
                memorySize: DEFAULT_MEMORY,
                initialPolicy: [
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: [
                            's3:GetObject'
                        ],
                        resources: ['*']
                    })
                ],
                environment: {
                    TEST_ENV_VARIABLE: 'test'
                }
            }
        );

        this.queryDbLambda = new NodejsFunction(stack, 'QueryDbLambda', {
                bundling: {
                    preCompilation: true,
                    forceDockerBundling: true,
                },
                entry: path.join(__dirname, '../../service/load-from-db/handler.ts'),
                handler: 'loadFromDb',
                runtime: Runtime.NODEJS_14_X,
                architecture: Architecture.ARM_64,
                timeout: Duration.seconds(900),
                memorySize: DEFAULT_MEMORY,
                initialPolicy: [
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: [
                            'dynamodb:Query'
                        ],
                        resources: [`${dynamoDb.mainTable.tableArn}/index/*`]
                    })
                ],
                environment: {
                    TEST_ENV_VARIABLE: 'test'
                }
            }
        );
    }
}
