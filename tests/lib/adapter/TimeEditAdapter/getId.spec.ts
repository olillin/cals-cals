import TimeEditAdapter from '../../../../app/lib/adapter/TimeEditAdapter'
import { beforeAll, it, expect } from 'vitest'

let adapter: TimeEditAdapter
beforeAll(() => {
    adapter = new TimeEditAdapter()
})

const httpsUrl = new URL(
    'https://cloud.timeedit.net/chalmers/web/public/abc123.ics'
)
const webcalUrl = new URL(
    'webcal://cloud.timeedit.net/chalmers/web/public/abc123.ics'
)
const wrongCategoryUrl = new URL(
    'https://cloud.timeedit.net/chalmers/web/student/abc123.ics'
)
const wrongOrganizationUrl = new URL(
    'https://cloud.timeedit.net/kth/web/public/abc123.ics'
)
const wrongDomainUrl = new URL(
    'https://example.com/chalmers/web/public/abc123.ics'
)

it('follows the format "category.filename"', () => {
    const id = adapter.getId(httpsUrl)
    expect(id).toBe('public.abc123')
})

it('should allow webcal://', () => {
    const id = adapter.getId(webcalUrl)
    expect(id).toBe('public.abc123')
})

it('should throw on wrong category', () => {
    expect(() => {
        adapter.getId(wrongCategoryUrl)
    }).toThrow(
        new Error(
            'Unsupported category. Calendar must be from the "public" schedule ("Öppen schemavisning").'
        )
    )
})

it('should throw on wrong orginazation', () => {
    expect(() => {
        adapter.getId(wrongOrganizationUrl)
    }).toThrow(
        new Error('Unsupported organization. Calendar must be from Chalmers.')
    )
})

it('should throw on wrong domain', () => {
    expect(() => {
        adapter.getId(wrongDomainUrl)
    }).toThrow(new Error('Invalid URL'))
})
