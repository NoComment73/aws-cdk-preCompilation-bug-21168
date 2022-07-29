#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {RemovalPolicy} from 'aws-cdk-lib';
import {Pipeline} from '../lib/pipeline';
import {ServiceStack} from "../lib/service-stack";

const app = new cdk.App();
const stackName = 'ci-fcs-ava-connector';
const serviceName = 'fcs-ava-connector';
const repositoryName = 'Fiegl-Spielberger/fcs-ava-connector';

const stackBuildTargetAcct = process.env.STACK_BUILD_TARGET_ACCT || 'dev';


// assuming we run a deployment from a local code base if not prod, test, dev
if (['dev', 'test', 'prod'].indexOf(stackBuildTargetAcct) < 0) {
    new ServiceStack(
        app,
        'FSServiceStack',
        {
            env: {
                account: process.env.CDK_DEFAULT_ACCOUNT,
                region: process.env.CDK_DEFAULT_REGION
            },
            stackName: `FSServiceStack${stackBuildTargetAcct.toUpperCase()}`,
            stageName: stackBuildTargetAcct,
            serviceName: 'fcs-ava-connector',
            dynamoDbRemovalPolicy: RemovalPolicy.DESTROY
        }
    );
}
if (stackBuildTargetAcct === 'dev') {
    new Pipeline(app, 'ci-fcs-ava-connector-dev', {
        env: {
            account: process.env.CDK_DEFAULT_ACCOUNT,
            region: process.env.CDK_DEFAULT_REGION
        },
        stackName: stackName,
        stageName: 'dev',
        serviceName: serviceName,
        repositoryName: repositoryName,
        branchName: 'dev'
    });
} else if (stackBuildTargetAcct === 'test') {
    new Pipeline(app, 'ci-fcs-ava-connector-test', {
        env: {
            account: process.env.CDK_DEFAULT_ACCOUNT,
            region: process.env.CDK_DEFAULT_REGION
        },
        stackName: stackName,
        stageName: 'test',
        serviceName: serviceName,
        repositoryName: repositoryName,
        branchName: 'test'
    });
}
