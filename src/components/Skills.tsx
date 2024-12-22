export function Skills() {
    const skills = ['Sleeping', 'Not Coding', 'Origami']

    return (
        <section id="skills" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 dark:text-white">Skills</h2>
            <div className="flex flex-wrap gap-2 justify-center">
                {skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-full text-sm">
                        {skill}
                    </span>
                ))}
            </div>
        </section>
    )
}
