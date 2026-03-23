import { createClient, RedisClientType, SCHEMA_FIELD_TYPE } from 'redis'

export const TIMEEDIT_INDEX = 'hash-idx:timeedit'

let client: RedisClientType | null = null

export async function getRedisClient(): Promise<RedisClientType> {
    if (client == null) {
        client = createClient({
            url: process.env.REDIS_URL,
        })

        client.on('error', error => console.warn('Redis error:', error))
        client.on('connect', () => {
            console.log('Redis connected')
        })

        await client.connect()

        // Create hash index for TimeEdit cache
        await client.ft.dropIndex(TIMEEDIT_INDEX, { DD: true }).then(
            () => {},
            () => {}
        )
        await client.ft.create(
            TIMEEDIT_INDEX,
            {
                id: {
                    type: SCHEMA_FIELD_TYPE.TAG,
                    CASESENSITIVE: true,
                },
                week: SCHEMA_FIELD_TYPE.NUMERIC,
            },
            {
                ON: 'HASH',
                PREFIX: 'timeedit:',
            }
        )
    }
    return client
}
