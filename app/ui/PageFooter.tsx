const currentVersion: string | undefined = process.env.NEXT_PUBLIC_WEB_VERSION
const versionString = currentVersion
    ? currentVersion.match(/^[0-9]+\.[0-9]+/)
        ? `v${currentVersion}`
        : `version ${currentVersion}`
    : undefined

export default function PageFooter() {
    return (
        <footer>
            <span>
                Made with <span className="pixelnheart"></span> by{' '}
                <a href="https://wiki.chalmers.it/Cal">Cal</a>.
            </span>
            <span>
                Is something wrong or could be improved?&nbsp;
                <a href="https://github.com/olillin/cals-cals/issues">
                    Leave an issue
                </a>{' '}
                on GitHub!
            </span>
            <span>
                {versionString && `Cal's cals ${versionString}. `}
                See the{' '}
                <a href="https://github.com/olillin/cals-cals">
                    source code
                </a>{' '}
                on GitHub.
            </span>
        </footer>
    )
}
