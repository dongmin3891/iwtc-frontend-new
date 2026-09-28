export type ChangelogSection = {
    title: string;
    items: string[];
};

export type ChangelogRelease = {
    version: string;
    date: string;
    summary: string;
    sections: ChangelogSection[];
};

const RELEASE_HEADING_PATTERN = /^##\s+(\d+\.\d+\.\d+)\s+·\s+(\d{4}-\d{2}-\d{2})$/;

export const parseChangelog = (source: string): ChangelogRelease[] => {
    const releases: ChangelogRelease[] = [];
    let release: ChangelogRelease | null = null;
    let section: ChangelogSection | null = null;

    const saveRelease = () => {
        if (release) {
            releases.push(release);
        }
    };

    source.split(/\r?\n/).forEach((rawLine) => {
        const line = rawLine.trim();
        if (!line || line.startsWith('# ')) {
            return;
        }

        const releaseHeading = line.match(RELEASE_HEADING_PATTERN);
        if (releaseHeading) {
            saveRelease();
            release = {
                version: releaseHeading[1],
                date: releaseHeading[2],
                summary: '',
                sections: [],
            };
            section = null;
            return;
        }

        if (!release) {
            return;
        }

        if (line.startsWith('### ')) {
            section = {
                title: line.slice(4).trim(),
                items: [],
            };
            release.sections.push(section);
            return;
        }

        if (line.startsWith('- ')) {
            if (!section) {
                section = { title: '주요 변경', items: [] };
                release.sections.push(section);
            }
            section.items.push(line.slice(2).trim());
            return;
        }

        release.summary = release.summary ? `${release.summary} ${line}` : line;
    });

    saveRelease();
    return releases;
};
