import { GroupedItemGrid } from '../components/ui/GroupedItemGrid';
import { ItemProps, OrigamiProps, ProjectProps } from '../types';

interface OrigamiGalleryProps {
    myDesigns: OrigamiProps[];
    otherDesigns: OrigamiProps[];
    software: ProjectProps[];
}

export function Origami({ myDesigns, otherDesigns, software }: OrigamiGalleryProps) {
    const allItems: ItemProps[] = [...myDesigns, ...otherDesigns, ...software];

    return (
        <div className="max-w-6xl mx-auto px-6 pb-20 pt-32">
            <div className="text-center mb-14">
                <p className="gallery-overline mb-4">The Gallery</p>
                <h1 className="gallery-heading text-4xl md:text-5xl lg:text-6xl mb-4 text-ink">
                    Origami
                </h1>
                <p className="text-base font-heading italic max-w-lg mx-auto mb-2 px-2 text-balance text-ink-muted">
                    Where geometric precision meets artistic expression.
                </p>
            </div>
            <p className="text-sm font-body text-center mb-14 text-ink-faint">
                More on{' '}
                <a
                    href="https://www.instagram.com/12googolplex"
                    target="_blank"
                    rel="noopener noreferrer" className="text-gold"
                >
                    @12googolplex
                </a>
            </p>

            <GroupedItemGrid
                items={allItems}
                itemType="mixed"
                showGrouping={true}
                allowGroupingToggle={true}
                myDesigns={myDesigns}
                otherDesigns={otherDesigns}
                software={software}
            />
        </div>
    );
}
