# Script pour créer la solution web resource
# Utilisation: .\build-solution.ps1

param(
    [string]$Version = "1.0.0"
)

Write-Host "🔨 Construction de la solution JiraTrackers..." -ForegroundColor Cyan

# Étape 1: Construire l'app
Write-Host "`n📦 Compilation de l'application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur de compilation" -ForegroundColor Red
    exit 1
}

# Étape 2: Nettoyer l'ancien dossier solution
if (Test-Path "solution") {
    Write-Host "`n🗑️  Nettoyage de l'ancienne solution..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force solution
}

# Étape 3: Créer la structure
Write-Host "`n📁 Création de la structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force "solution/Other/WebResources" | Out-Null

# Étape 4: Copier les fichiers
Write-Host "`n📋 Copie des fichiers..." -ForegroundColor Yellow
Copy-Item -Path "dist/*" -Destination "solution/Other/WebResources/" -Recurse -Force

# Étape 5: Créer [Content_Types].xml
Write-Host "`n📋 Création de [Content_Types].xml..." -ForegroundColor Yellow
$contentTypesXml = @"
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml" />
  <Default Extension="css" ContentType="text/css" />
  <Default Extension="js" ContentType="application/javascript" />
  <Default Extension="html" ContentType="text/html" />
  <Default Extension="svg" ContentType="image/svg+xml" />
  <Override PartName="/solution.xml" ContentType="application/xml" />
  <Override PartName="/customizations.xml" ContentType="application/xml" />
</Types>
"@

$contentTypesXml | Out-File -Encoding UTF8 "solution/[Content_Types].xml"

# Étape 6: Créer solution.xml
$solutionXml = @"
<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <SolutionManifest>
    <UniqueName>JiraTrackersApp</UniqueName>
    <LocalizedNames>
      <LocalizedName description="Jira Trackers Web App" languageid="1033" />
    </LocalizedNames>
    <Descriptions>
      <Description description="React-based Jira ticket tracking application for Power Apps" languageid="1033" />
    </Descriptions>
    <Version>$Version</Version>
    <Managed>0</Managed>
    <Publisher>
      <UniqueName>JiraTrackersPublisher</UniqueName>
      <LocalizedNames>
        <LocalizedName description="Jira Trackers" languageid="1033" />
      </LocalizedNames>
      <SupportedLanguages>1033</SupportedLanguages>
    </Publisher>
    <RootComponents>
      <RootComponent type="61" schemaName="jiratracker_index_html" behaviour="0" />
      <RootComponent type="61" schemaName="jiratracker_css" behaviour="0" />
      <RootComponent type="61" schemaName="jiratracker_app_js" behaviour="0" />
    </RootComponents>
  </SolutionManifest>
</ImportExportXml>
"@

$solutionXml | Out-File -Encoding UTF8 "solution/solution.xml"

# Étape 7: Créer customizations.xml
$customizationsXml = @"
<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <WebResources>
    <WebResource>
      <Name>jiratracker_index_html</Name>
      <DisplayName>Jira Tracker Main Page</DisplayName>
      <Type>1</Type>
      <IsEnabled>1</IsEnabled>
      <FileName>index.html</FileName>
    </WebResource>
    <WebResource>
      <Name>jiratracker_css</Name>
      <DisplayName>Jira Tracker Styles</DisplayName>
      <Type>3</Type>
      <IsEnabled>1</IsEnabled>
      <FileName>assets/main.css</FileName>
    </WebResource>
    <WebResource>
      <Name>jiratracker_app_js</Name>
      <DisplayName>Jira Tracker Application</DisplayName>
      <Type>2</Type>
      <IsEnabled>1</IsEnabled>
      <FileName>assets/main.js</FileName>
    </WebResource>
  </WebResources>
</ImportExportXml>
"@

$customizationsXml | Out-File -Encoding UTF8 "solution/customizations.xml"

# Étape 8: Créer le ZIP
Write-Host "`n📦 Création du package ZIP..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipName = "JiraTrackersApp_$Version`_unmanaged.zip"
[System.IO.Compression.ZipFile]::CreateFromDirectory((Get-Item solution).FullName, $zipName, [System.IO.Compression.CompressionLevel]::Optimal, $false)

# Résumé
$size = [math]::Round((Get-Item $zipName).Length / 1024, 2)

Write-Host "`n✅ Solution créée avec succès!" -ForegroundColor Green
Write-Host "`n📦 Détails du package:"
Write-Host "   Nom: $zipName"
Write-Host "   Taille: $($size)KB"
Write-Host "`n📝 Prochaines étapes:"
Write-Host "   1. Accédez à https://make.powerapps.com"
Write-Host "   2. Solutions → Importer une solution"
Write-Host "   3. Sélectionnez $zipName"
Write-Host "   4. Suivez le guide d'importation"
