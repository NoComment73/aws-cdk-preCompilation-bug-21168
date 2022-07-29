import { ServiceStack } from './service-stack';
import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface StageProperties extends StageProps {
    readonly serviceName: string;
    readonly stageName: string;
}

export class ServiceStage extends Stage {

    constructor(scope: Construct,
                id: string,
                properties: StageProperties) {
        super(scope, id);

        new ServiceStack(
            this,
            'ServiceStack',
            {
                ...properties,
                stackName: `${properties.serviceName}`
            }
        );
    }

}
