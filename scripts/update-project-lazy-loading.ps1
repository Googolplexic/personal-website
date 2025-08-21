$projectsDir = "c:\Users\colem\Documents\Coding\personal-website\src\assets\projects"
$excludedDirs = @("template")

$projectDirs = Get-ChildItem -Path $projectsDir -Directory | Where-Object { $_.Name -notin $excludedDirs }

foreach ($projectDir in $projectDirs) {
    $indexPath = Join-Path $projectDir.FullName "index.ts"
    
    if (Test-Path $indexPath) {
        Write-Host "Updating $($projectDir.Name)/index.ts..."
        
        $content = Get-Content $indexPath -Raw
        
        # Check if it uses the old eager loading pattern
        if ($content -match "import\.meta\.glob.*eager: true") {
            # Replace the old pattern with the new lazy loading pattern
            $newContent = $content -replace "const sortedImages = Object\.values\(import\.meta\.glob\('\.\/images\/\*\.\(png\|jpg\|jpeg\)', \{ eager: true, import: 'default' \}\)\)\s+\.sort\(\(a, b\) => \(a as string\)\.localeCompare\(b as string\)\) as string\[\];", "// Use lazy loading to avoid bundling all images into main chunk`nconst imageModules = import.meta.glob('./images/*.(png|jpg|jpeg)', { import: 'default' });`nconst lazyImages = createLazyImageCollection(imageModules);"
            
            # Add the import for createLazyImageCollection
            $newContent = $newContent -replace "(import matter from 'front-matter';)", "`$1`nimport { createLazyImageCollection } from '../../../utils/lazyImages';"
            
            # Replace the images property
            $newContent = $newContent -replace "images: sortedImages,", "images: lazyImages,"
            
            Set-Content $indexPath $newContent -NoNewline
            Write-Host "✓ Updated $($projectDir.Name)/index.ts"
        }
        else {
            Write-Host "- Skipped $($projectDir.Name)/index.ts (already updated or different format)"
        }
    }
    else {
        Write-Host "- No index.ts found in $($projectDir.Name)"
    }
}

Write-Host ""
Write-Host "Done! Updated project files to use lazy image loading."
