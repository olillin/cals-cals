/* oxlint-disable typescript/no-unsafe-call, typescript/no-unsafe-member-access */
'use server'

import fs from 'node:fs/promises'
import * as prod from 'react/jsx-runtime'
import { ReactNode } from 'react'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeReact from 'rehype-react'
import { toString } from 'mdast-util-to-string'
import { unified, type Plugin } from 'unified'
import type { VFile } from 'vfile'
import type * as mdast from 'mdast'

export interface Changes {
    version: string
    name: string
    body: ReactNode
}

const production = { Fragment: prod.Fragment, jsx: prod.jsx, jsxs: prod.jsxs }

const lastHeading: Plugin<[{ depth: number }]> = options => {
    return (tree: mdast.Root, file: VFile) => {
        // Find the last heading of matching depth
        const lastIndex = tree.children.findLastIndex(node => {
            return node.type === 'heading' && node.depth === options.depth
        })
        // Do nothing if not found
        if (lastIndex === -1) return

        // Extract heading
        const lastHeading = tree.children[lastIndex]
        if (lastHeading.type !== 'heading') {
            console.warn("Impossible state, last heading not of type 'heading'")
            return
        }
        file.data.lastHeading = toString(lastHeading)

        tree.children = tree.children.slice(lastIndex + 1)
    }
}

const replaceHeadings: Plugin<[]> = () => {
    return (tree: mdast.Root) => {
        tree.children.forEach((element, i) => {
            if (element.type !== 'heading') return
            tree.children[i] = { type: 'strong', children: element.children }
        })
    }
}

const removeTopHeading: Plugin<[]> = () => {
    return (tree: mdast.Root) => {
        // Find second heading
        const firstIndex = tree.children.findIndex(node => {
            return node.type === 'heading'
        })
        const secondIndex = tree.children.findIndex((node, i) => {
            return i > firstIndex && node.type === 'heading'
        })
        // Do nothing if not found
        if (secondIndex === -1) return

        tree.children = tree.children.slice(secondIndex)
    }
}

export async function readLatestChanges(
    filename: string = 'CHANGELOG.md'
): Promise<Changes | null> {
    'use cache'
    const text = await fs.readFile(filename)
    const file = (await unified()
        .use(remarkParse, { fragment: true })
        .use(lastHeading, { depth: 2 })
        .use(replaceHeadings)
        .use(remarkRehype)
        .use(rehypeReact, production)
        .process(text)) as VFile

    const body = file.result as ReactNode
    const heading = file.data.lastHeading
    if (typeof heading !== 'string') {
        throw new Error('lastHeading is not a string')
    }
    let index = heading.indexOf(' ')
    if (index === -1) {
        index = heading.length
    }
    const version = heading.slice(0, index)
    const name = heading.slice(index + 1)

    return {
        version,
        name,
        body,
    }
}

export async function readAllChanges(
    filename: string = 'CHANGELOG.md'
): Promise<ReactNode | null> {
    'use cache'
    const text = await fs.readFile(filename)
    const file = (await unified()
        .use(remarkParse, { fragment: true })
        .use(removeTopHeading)
        .use(remarkRehype)
        .use(rehypeReact, production)
        .process(text)) as VFile
    return file.result as ReactNode
}
