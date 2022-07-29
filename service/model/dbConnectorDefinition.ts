import {Attribute, AUTO_GENERATE_ATTRIBUTE_STRATEGY, AutoGenerateAttribute, Entity, INDEX_TYPE} from "@typedorm/common";

@Entity({
    name: 'connectorDefinition',
    primaryKey: {
        partitionKey: '{{uuid}}',
        sortKey: 'connector#{{customer}}'
    },
    indexes: {
        PK_SK: {
            partitionKey: 'connector#{{customer}}',
            sortKey: '{{uuid}}',
            type: INDEX_TYPE.GSI
        },
        REF2_PK: {
            partitionKey: 'connectortype#{{type}}',
            sortKey: '{{uuid}}',
            type: INDEX_TYPE.GSI
        }
    }
})
export class DbConnectorDefinition {
    @AutoGenerateAttribute({
        strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.UUID4
    })
    uuid!: string;
    @Attribute()
    customer!: string;
    @Attribute()
    name!: string;
    @Attribute()
    active!: boolean;
    @Attribute()
    ref2!: string;
    @Attribute()
    config!: any;
    @Attribute()
    type!: string;
}
