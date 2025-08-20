export function Skills() {
    const skills = ['Web Development', 'Computational Origami Design', 'Origami Folding', 'Teaching Youth']

    return (
        <section id="skills" className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 dark:text-white">Skills</h2>
            <div className="flex flex-wrap gap-2 items-center justify-center">
                {skills.map((skill) => (
                    <span 
                        key={skill} 
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-full text-sm text-gray-800 dark:text-gray-200"
                    >
                        {skill}
                    </span>
                ))}
            </div>
        </section>
    )
}
