import { Construct } from 'constructs';
import { CfnNotificationRule } from 'aws-cdk-lib/aws-codestarnotifications';
import { Pipeline } from 'aws-cdk-lib/aws-codepipeline';

export interface PipelineNotificationProperties {
    readonly stageName: string;
    readonly serviceName: string;
    readonly snsTopicArn: string;
    readonly pipeline: Pipeline;
}

/**
 * Create notifications for a pipeline that posts event notifications on a given SNS topic.
 */
export class PipelineNotification extends Construct {

    constructor(scope: Construct, id: string, properties: PipelineNotificationProperties) {
        super(scope, id);

        new CfnNotificationRule(this, 'PipelineNotification', {
            name: properties.serviceName + '-' + properties.stageName,
            status: 'ENABLED',
            resource: properties.pipeline.pipelineArn,
            detailType: 'FULL',
            eventTypeIds: [
                'codepipeline-pipeline-pipeline-execution-succeeded',
                'codepipeline-pipeline-pipeline-execution-failed'
            ],
            targets: [
                <CfnNotificationRule.TargetProperty> {
                    targetType: 'SNS',
                    targetAddress: properties.snsTopicArn
                }
            ]
        });
    }
}
