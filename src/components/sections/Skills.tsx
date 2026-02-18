

export function Skills() {
    const skills = ['Web Development', 'Computational Origami Design', 'Origami Folding', 'Teaching Youth'];

    return (
        <div id="skills">
            <p className="gallery-overline mb-4">Expertise</p>
            <h2 className="gallery-heading text-3xl md:text-4xl mb-8"
                style={{ color: 'var(--color-text-primary)' }}>
                Skills & Interests
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {skills.map((skill, i) => (
                    <span key={skill} className="text-sm font-body tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                        {skill}{i < skills.length - 1 && <span className="ml-6" style={{ color: 'var(--color-accent)', opacity: 0.5 }}>·</span>}
                    </span>
                ))}
            </div>
        </div>
    );
}
