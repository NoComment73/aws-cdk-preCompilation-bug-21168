import {INDEX_TYPE, Table} from '@typedorm/common';

export const mainTable = new Table({
    name: 'fcs-ava-connector-MainData',
    partitionKey: 'PK',
    sortKey: 'SK',
    indexes: {
        PK_SK: {
            type: INDEX_TYPE.GSI,
            partitionKey: 'SK',
            sortKey: 'PK',
        },
        REF2_PK: {
            type: INDEX_TYPE.GSI,
            partitionKey: 'REF2',
            sortKey: 'PK'
        }
    }
})
