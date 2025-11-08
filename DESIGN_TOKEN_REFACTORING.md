# Design Token Refactoring - Complete Analysis & Plan

## Objective

Replace ALL hardcoded className strings with design token system utilities while maintaining 100% visual/functional parity.

## Current State Assessment

### What Was Previously Done (Incomplete)

- ✅ Created 13 base components (Box, Text, Heading, Card, Button, Link, Pill, Flex, Stack)
- ✅ Created design-tokens.ts with comprehensive token system
- ✅ Created utility functions (cn, createVariants, responsive, themeClasses, spacing)
- ⚠️ Replaced HTML tags with components BUT kept hardcoded classNames
- ❌ Did NOT apply design token system to existing classNames
- ❌ Did NOT use spacing() utility
- ❌ Did NOT use themeClasses() for colors
- ❌ Did NOT consolidate repeated patterns

### What Needs To Be Done

1. **Read every component file manually** to identify all hardcoded classNames
2. **Create reusable patterns** in design-tokens.ts for common combinations
3. **Replace spacing classes** (mb-4, space-y-6, etc.) with spacing() utility
4. **Replace color classes** with themeClasses() utility
5. **Replace layout patterns** with Flex/Stack components
6. **Create component variants** for repeated patterns
7. **Verify zero visual changes** after each file

## Phase 1: Manual File Analysis (IN PROGRESS)

### Files to Analyze (Systematic Review)

#### Pages (6 files)

- [ ] src/pages/Home.tsx
- [ ] src/pages/Portfolio.tsx
- [ ] src/pages/ProjectDetail.tsx
- [ ] src/pages/Origami.tsx
- [ ] src/pages/AdminPage.tsx
- [ ] src/pages/NotFound.tsx

#### Layout Components (3 files)

- [ ] src/components/layout/Navbar.tsx
- [ ] src/components/layout/RootRoute.tsx
- [ ] src/components/layout/ThemeToggle.tsx

#### Section Components (4 files)

- [ ] src/components/sections/About.tsx
- [ ] src/components/sections/Contact.tsx
- [ ] src/components/sections/Skills.tsx
- [ ] src/components/sections/ResumeSection.tsx

#### Portfolio Components (5 files)

- [ ] src/components/portfolio/ProjectCard.tsx
- [ ] src/components/portfolio/ProjectGrid.tsx
- [ ] src/components/portfolio/ProjectImageCarousel.tsx
- [ ] src/components/portfolio/ProjectLinks.tsx
- [ ] src/components/portfolio/ProjectTechnologies.tsx

#### Origami Components (1 file)

- [ ] src/components/origami/OrigamiCard.tsx

#### UI Components (5 files)

- [ ] src/components/ui/Carousel.tsx
- [ ] src/components/ui/CategoryLabel.tsx
- [ ] src/components/ui/GroupedItemGrid.tsx
- [ ] src/components/ui/ItemGrid.tsx
- [ ] src/components/ui/HighlightedText.tsx

#### Search Components (2 files)

- [ ] src/components/search/UniversalSearch.tsx
- [ ] src/components/search/GroupedSearch.tsx

#### Admin Components (8 files)

- [ ] src/components/admin/AdminPanel.tsx
- [ ] src/components/admin/AdminDashboard.tsx
- [ ] src/components/admin/AdminLogin.tsx
- [ ] src/components/admin/ContentList.tsx
- [ ] src/components/admin/EditContentModal.tsx
- [ ] src/components/admin/EnhancedEditModal.tsx
- [ ] src/components/admin/ProjectForm.tsx
- [ ] src/components/admin/OrigamiForm.tsx

**Total: 42 files to analyze**

## Phase 2: Pattern Identification

### Common Hardcoded Patterns Found

#### Spacing Patterns (CRITICAL - Most Common)

- `mb-X` (margin-bottom: 2, 3, 4, 6, 8, 12, 16)
- `mt-X` (margin-top: 2, 4, 6, 8, 12, 16)
- `space-y-X` (vertical spacing: 1, 4, 6, 8, 12)
- `gap-X` (gap: 1, 2, 3, 4, 8, 12)
- `px-X`, `py-X` (padding)

#### Color Patterns

- `text-gray-X dark:text-gray-Y` (text colors)
- `bg-gray-X dark:bg-gray-Y` (backgrounds)
- `bg-black/50 hover:bg-black/70` (semi-transparent overlays)
- `border-gray-X dark:border-gray-Y` (borders)
- `text-blue-600 dark:text-blue-400` (accent colors)
- Category colors: `bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`

#### Layout Patterns

- `grid grid-cols-1 lg:grid-cols-2 gap-X`
- `flex items-center justify-center`
- `max-w-X mx-auto` (centering)
- `fixed bottom-12 right-12` (positioning)

#### Interactive Patterns

- `hover:bg-X hover:text-Y` (hover states)
- `opacity-0 group-hover:opacity-100 transition-all` (reveal on hover)
- `cursor-pointer` (clickable elements)

#### Admin-Specific Patterns (Lower Priority)

- Form labels: `block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1`
- Form inputs: Complex className strings with borders, backgrounds, dark mode
- Tabs: `px-6 py-3 text-sm font-medium` with conditional classes

### Issues Identified

1. **No spacing utility usage** - All spacing is hardcoded instead of using `spacing()`
2. **No color utility usage** - Colors hardcoded instead of using `themeClasses()`
3. **Repeated className patterns** - Same combinations appear in multiple files
4. **Inconsistent spacing** - Some use mb-4, some mb-6 for similar contexts
5. **Complex conditional classNames** - Could be component variants
6. **Admin forms** - Lots of repeated form styling that could be components

## Phase 3: Token System Enhancement Plan

### New Utilities Needed

1. **Overlay utility** - For semi-transparent backgrounds

   ```ts
   export const overlay = (opacity: 'light' | 'medium' | 'heavy' = 'medium') => { ... }
   ```

2. **Container utility** - For max-width + centered patterns

   ```ts
   export const container = (size: 'sm' | 'md' | 'lg' | 'xl' | 'full') => { ... }
   ```

3. **Grid utility** - For common grid patterns

   ```ts
   export const grid = (cols: '1' | '2' | 'auto', gap: string) => { ... }
   ```

### New Component Variants Needed

1. **FormLabel component** - For consistent form labels
2. **FormInput component** - For consistent form inputs  
3. **Section component** - With standardized spacing
4. **CategoryBadge component** - For category labels with colors

### Design Token Additions

Add to `design-tokens.ts`:

- `overlays` - Semi-transparent background patterns
- `containers` - Max-width patterns
- `formElements` - Form-specific styling patterns

## Phase 4: Systematic Refactoring Plan

### Refactoring Strategy

For each file:

1. **Identify all className strings**
2. **Group by pattern type** (spacing, colors, layout, etc.)
3. **Replace with utilities/components**:
   - Spacing: `spacing('mb', 4)` or remove if using Stack
   - Colors: `themeClasses('text-gray-900', 'text-white')`
   - Layout: Use Flex/Stack components
4. **Test visually** (no changes should be visible)
5. **Mark as complete**

### Priority Order

**HIGH PRIORITY (User-Facing):**

1. Home.tsx
2. Portfolio.tsx  
3. ProjectDetail.tsx
4. Origami.tsx
5. NotFound.tsx
6. Navbar.tsx
7. ProjectCard.tsx
8. OrigamiCard.tsx
9. Carousel.tsx
10. ProjectImageCarousel.tsx
11. All section components
12. All UI components

**MEDIUM PRIORITY:**
13. Search components
14. Grid components

**LOW PRIORITY (Admin-Only):**
15-22. All admin components (can use more hardcoded patterns)

## Phase 5: Execution Tracking

### Files Completed: 1/42

#### User-Facing (High Priority): 1/25

- [x] Home.tsx ✅ - Replaced: container(), grid(), spacing(), Stack, themeClasses()
- [ ] Portfolio.tsx
- [ ] ProjectDetail.tsx
- [ ] Origami.tsx
- [ ] NotFound.tsx
- [ ] Navbar.tsx
- [ ] ThemeToggle.tsx
- [ ] RootRoute.tsx
- [ ] About.tsx
- [ ] Contact.tsx
- [ ] Skills.tsx
- [ ] ResumeSection.tsx
- [ ] ProjectCard.tsx
- [ ] ProjectGrid.tsx
- [ ] ProjectImageCarousel.tsx
- [ ] ProjectLinks.tsx
- [ ] ProjectTechnologies.tsx
- [ ] OrigamiCard.tsx
- [ ] Carousel.tsx
- [ ] CategoryLabel.tsx
- [ ] HighlightedText.tsx
- [ ] ItemGrid.tsx
- [ ] GroupedItemGrid.tsx
- [ ] UniversalSearch.tsx
- [ ] GroupedSearch.tsx

#### Admin (Lower Priority): 0/8

- [ ] AdminPanel.tsx
- [ ] AdminDashboard.tsx
- [ ] AdminLogin.tsx
- [ ] ContentList.tsx
- [ ] EditContentModal.tsx
- [ ] EnhancedEditModal.tsx
- [ ] ProjectForm.tsx
- [ ] OrigamiForm.tsx

## Phase 6: Final Verification

(Will execute after all refactoring)

---

**Status: PHASE 3 COMPLETE - DESIGN TOKEN SYSTEM ENHANCED**
**Next Step: Begin systematic file refactoring**
**Files Analyzed: 42/42 ✅**
**Files Refactored: 0/42**

### Enhancements Completed

- ✅ Added `overlay()` utility for semi-transparent backgrounds
- ✅ Added `container()` utility for max-width + centered patterns  
- ✅ Added `grid()` utility for responsive grid layouts
- ✅ All utilities tested and have 0 TypeScript errors
