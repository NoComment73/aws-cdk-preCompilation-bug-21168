import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { ServiceStage } from './service-stage';
import { BuildEnvironmentVariableType, BuildSpec, ComputeType, LinuxArmBuildImage } from 'aws-cdk-lib/aws-codebuild';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { PipelineNotification } from './construct/PipelineNotification';

const NODE_VERSION = '14.18.3';

export interface PipelineStackProperties extends StackProps {
    readonly stageName: string;
    readonly serviceName: string;
    readonly repositoryName: string;
    readonly branchName: string;
}

export class Pipeline extends Stack {
    constructor(scope: Construct,
                id: string,
                properties: PipelineStackProperties) {
        super(scope, id, properties);

        const pipelineName = `${properties.serviceName}`;
        const githubConnectionArn = StringParameter.valueFromLookup(this, '/fcs/ci/github-connection-arn')
        // const alarmTopicArn: string = StringParameter.valueFromLookup(this, SSM_PARAMETER_ALARM_TOPIC);

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: pipelineName,
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.connection(
                    properties.repositoryName,
                    properties.branchName,
                    {
                        connectionArn: githubConnectionArn
                    }
                ),
                installCommands: [
                    `n ${NODE_VERSION} && npm i -g npm && npm install -g typescript@4.0.2 && npm install -g tslint@5.5.0`
                ],
                commands: [
                    'npm install -g aws-cdk',
                    'npm install -g pnpm',
                    'npm install',
                    'npm run build',
                    `npx cdk synth ${id}`
                ]
            }),
            synthCodeBuildDefaults: {
                buildEnvironment: {
                    computeType: ComputeType.SMALL,
                    privileged: true,
                    buildImage: LinuxArmBuildImage.AMAZON_LINUX_2_STANDARD_2_0,
                    environmentVariables: {
                        STACK_BUILD_TARGET_ACCT: {
                            type: BuildEnvironmentVariableType.PLAINTEXT,
                            value: properties.stageName
                        }
                    }
                },
                partialBuildSpec: BuildSpec.fromObject({
                    'runtime-versions': {
                        nodejs: 'latest',
                    },
                }),
                rolePolicy: [
                    new PolicyStatement({
                        sid: 'ssm',
                        effect: Effect.ALLOW,
                        actions: [
                            'ssm:GetParameter'
                        ],
                        resources: [
                            `arn:aws:ssm:${this.region}:${this.account}:parameter/*`,
                        ]
                    })
                ]
            }
        });

        pipeline.addStage(
            new ServiceStage(this,
                properties.stageName,
                {
                    ...properties,
                })
        );

        pipeline.buildPipeline();

        const artifactBucket = pipeline.pipeline.artifactBucket;
        artifactBucket.applyRemovalPolicy(RemovalPolicy.DESTROY);

        new PipelineNotification(this, 'PipelineNotification', {
            pipeline: pipeline.pipeline,
            stageName: properties.stageName,
            serviceName: properties.serviceName,
            snsTopicArn: `arn:aws:sns:${this.region}:${this.account}:chatbot-notification`
        });
    }
}
