import { readable } from 'svelte/store'
import type { Readable } from "svelte/store";

import { parseFilterArgs } from '../queryCore/core/utils'
import { notifyManager, QueryClient, QueryKey } from '../queryCore/core'
import { useQueryClient } from '../queryClientProvider'
import type { QueryFilters } from '../queryCore/core/utils'

export function useIsFetching(filters?: QueryFilters): Readable<number>
export function useIsFetching(queryKey?: QueryKey, filters?: QueryFilters): Readable<number>
export default function useIsFetching(
    arg1?: QueryKey | QueryFilters,
    arg2?: QueryFilters
): Readable<number> {
    const [filters] = parseFilterArgs(arg1, arg2)
    const client: QueryClient = useQueryClient()
    const cache = client.getQueryCache()
    // isFetching is the prev value initialized on mount *
    let isFetching = client.isFetching(filters)

    const { subscribe } = readable(isFetching, set => {
        return cache.subscribe(
            notifyManager.batchCalls(() => {
                const newIsFetching = client.isFetching(filters)
                if (isFetching !== newIsFetching) {
                    // * and update with each change
                    isFetching = newIsFetching
                    set(isFetching)
                }
            }))
    })

    return { subscribe }
}