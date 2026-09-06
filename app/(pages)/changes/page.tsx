import { readAllChanges } from '@/app/lib/changes'

export default async function Page() {
    const changes = await readAllChanges()
    return <section>{changes}</section>
}
