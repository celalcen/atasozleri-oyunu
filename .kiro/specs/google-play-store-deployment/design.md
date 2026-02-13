# Design Document: Google Play Store Deployment

## Overview

Bu design dokümanı, mevcut bir web uygulamasının TWA (Trusted Web Activity) teknolojisi kullanılarak Google Play Store'a deployment sürecini detaylandırır. Süreç Windows bilgisayarda gerçekleştirilecek ve şu ana bileşenleri içerir:

1. **Geliştirme Ortamı Kurulumu**: Android Studio ve gerekli SDK'ların kurulumu
2. **Web Uygulaması Deployment**: Localhost'tan production ortamına geçiş
3. **TWA Projesi Oluşturma**: Android Studio'da TWA projesi yapılandırması
4. **Güvenlik ve İmzalama**: Keystore oluşturma ve dijital imzalama
5. **Store Hazırlığı**: Google Play Console yapılandırması ve metadata hazırlama
6. **Yayınlama**: Test ve production deployment

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Windows Development Machine               │
│                                                               │
│  ┌──────────────────┐         ┌─────────────────────────┐   │
│  │  Android Studio  │────────▶│   TWA Android Project   │   │
│  │   + SDK Tools    │         │  - AndroidManifest.xml  │   │
│  └──────────────────┘         │  - build.gradle         │   │
│                                │  - Keystore (.jks)      │   │
│                                └─────────────────────────┘   │
│                                           │                   │
│                                           ▼                   │
│                                ┌─────────────────────┐       │
│                                │  Signed AAB/APK     │       │
│                                └─────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
                        ┌──────────────────────────────────┐
                        │   Google Play Console            │
                        │  - App Listing                   │
                        │  - Testing Tracks                │
                        │  - Production Release            │
                        └──────────────────────────────────┘
                                           │
                                           ▼
                        ┌──────────────────────────────────┐
                        │   Production Web App             │
                        │  - HTTPS URL                     │
                        │  - assetlinks.json               │
                        │  - PWA Manifest                  │
                        └──────────────────────────────────┘
```

### Component Interaction Flow

```
User Action → Android Studio → TWA Project → Build System → Signed AAB
                                                                  │
                                                                  ▼
                                                    Google Play Console
                                                                  │
                                                                  ▼
                                                    Digital Asset Links
                                                      Verification
                                                                  │
                                                                  ▼
                                                    Production Web App
```


## Components and Interfaces

### 1. Development Environment Setup

**Android Studio Installation**
- Component: Android Studio IDE
- Version: Latest stable release (Hedgehog 2023.1.1 veya üzeri)
- Required SDK Components:
  - Android SDK Platform 33 (Android 13) veya üzeri
  - Android SDK Build-Tools
  - Android SDK Platform-Tools
  - Android SDK Command-line Tools

**System Requirements Validator**
```
Interface: SystemRequirementsChecker
Methods:
  - checkRAM(): boolean
    Input: None
    Output: true if >= 8GB RAM available
    
  - checkDiskSpace(): boolean
    Input: None
    Output: true if >= 8GB free disk space
    
  - checkJavaVersion(): boolean
    Input: None
    Output: true if Java 11 or higher installed
```

### 2. Web Application Deployment

**Hosting Service Integration**
- Recommended Services: Firebase Hosting, Netlify, Vercel
- Requirements:
  - HTTPS support (mandatory for TWA)
  - Custom domain support (optional)
  - Static file hosting

**PWA Requirements Validator**
```
Interface: PWAValidator
Methods:
  - validateManifest(url: string): ValidationResult
    Input: Production URL
    Output: {
      hasManifest: boolean,
      manifestPath: string,
      manifestValid: boolean,
      errors: string[]
    }
    
  - validateServiceWorker(url: string): ValidationResult
    Input: Production URL
    Output: {
      hasServiceWorker: boolean,
      serviceWorkerPath: string,
      serviceWorkerValid: boolean
    }
    
  - validateHTTPS(url: string): boolean
    Input: Production URL
    Output: true if URL uses HTTPS protocol
```

### 3. TWA Project Configuration

**Project Structure**
```
twa-project/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml
│   │       ├── res/
│   │       │   ├── values/
│   │       │   │   └── strings.xml
│   │       │   └── mipmap/
│   │       │       └── ic_launcher.png
│   │       └── java/
│   ├── build.gradle
│   └── release/
│       └── app-release.aab
├── build.gradle
└── gradle.properties
```

**AndroidManifest.xml Configuration**
```xml
<manifest>
  <application>
    <activity android:name="com.google.androidbrowserhelper.trusted.LauncherActivity">
      <meta-data
        android:name="android.support.customtabs.trusted.DEFAULT_URL"
        android:value="https://your-production-url.com" />
      
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
      
      <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
          android:scheme="https"
          android:host="your-production-url.com" />
      </intent-filter>
    </activity>
  </application>
</manifest>
```

**build.gradle Configuration**
```gradle
dependencies {
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
}

android {
    defaultConfig {
        applicationId "com.example.twa"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
}
```

**Project Configuration Validator**
```
Interface: TWAProjectValidator
Methods:
  - validateBuildGradle(filePath: string): ValidationResult
    Input: Path to build.gradle
    Output: {
      hasTWADependency: boolean,
      dependencyVersion: string,
      isValid: boolean
    }
    
  - validateManifest(filePath: string): ValidationResult
    Input: Path to AndroidManifest.xml
    Output: {
      hasDefaultURL: boolean,
      defaultURL: string,
      hasIntentFilter: boolean,
      hasAutoVerify: boolean
    }
```

### 4. Digital Asset Links

**assetlinks.json Structure**
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.example.twa",
    "sha256_cert_fingerprints": [
      "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
    ]
  }
}]
```

**Keystore Manager**
```
Interface: KeystoreManager
Methods:
  - generateKeystore(params: KeystoreParams): KeystoreResult
    Input: {
      alias: string,
      password: string,
      validity: number (days),
      outputPath: string
    }
    Output: {
      keystorePath: string,
      sha256Fingerprint: string,
      success: boolean
    }
    
  - extractFingerprint(keystorePath: string, password: string): string
    Input: Keystore file path and password
    Output: SHA-256 fingerprint string
```

**Asset Links Validator**
```
Interface: AssetLinksValidator
Methods:
  - validateAssetLinks(url: string, packageName: string, fingerprint: string): ValidationResult
    Input: Production URL, Android package name, SHA-256 fingerprint
    Output: {
      fileExists: boolean,
      fileAccessible: boolean,
      packageNameMatches: boolean,
      fingerprintMatches: boolean,
      isValid: boolean
    }
```


### 5. Build and Signing System

**Build Configuration**
```
Interface: BuildManager
Methods:
  - buildAPK(projectPath: string, keystoreConfig: KeystoreConfig): BuildResult
    Input: {
      projectPath: string,
      keystorePath: string,
      keystorePassword: string,
      keyAlias: string,
      keyPassword: string
    }
    Output: {
      apkPath: string,
      success: boolean,
      buildLog: string[]
    }
    
  - buildAAB(projectPath: string, keystoreConfig: KeystoreConfig): BuildResult
    Input: Same as buildAPK
    Output: {
      aabPath: string,
      success: boolean,
      buildLog: string[]
    }
    
  - verifySignature(filePath: string): SignatureInfo
    Input: APK or AAB file path
    Output: {
      isSigned: boolean,
      signerCertificate: string,
      sha256Fingerprint: string
    }
```

**Gradle Build Commands**
```bash
# APK Build
./gradlew assembleRelease

# AAB Build
./gradlew bundleRelease

# Verify Signature
jarsigner -verify -verbose -certs app-release.aab
```

### 6. Google Play Console Integration

**Store Listing Data Model**
```
Interface: StoreListingData
Properties:
  - appName: string (max 50 characters)
  - shortDescription: string (max 80 characters)
  - fullDescription: string (max 4000 characters)
  - category: AppCategory
  - screenshots: Screenshot[] (min 2, max 8)
  - icon: Image (512x512 PNG)
  - featureGraphic: Image (1024x500 PNG/JPG)
  - privacyPolicyURL: string
  - contactEmail: string

Methods:
  - validate(): ValidationResult
    Output: {
      isValid: boolean,
      errors: string[]
    }
```

**Screenshot Requirements**
```
Interface: Screenshot
Properties:
  - filePath: string
  - width: number
  - height: number
  - format: 'PNG' | 'JPG'

Constraints:
  - Minimum dimensions: 1080x1920 or 1920x1080
  - Maximum file size: 8MB
  - Supported formats: PNG, JPG
```

**Release Track Manager**
```
Interface: ReleaseTrackManager
Methods:
  - createInternalTest(aabPath: string, releaseNotes: string): ReleaseResult
    Input: AAB file path and release notes
    Output: {
      trackId: string,
      testLink: string,
      success: boolean
    }
    
  - addTestUsers(trackId: string, emails: string[]): boolean
    Input: Track ID and tester email addresses
    Output: Success status
    
  - promoteToProduction(trackId: string): boolean
    Input: Track ID from testing
    Output: Success status
```

### 7. Version Management

**Version Configuration**
```
Interface: VersionManager
Methods:
  - incrementVersionCode(currentCode: number): number
    Input: Current versionCode
    Output: Incremented versionCode (currentCode + 1)
    
  - validateVersionName(versionName: string): boolean
    Input: Version name string
    Output: true if matches semantic versioning (e.g., "1.0.0")
    
  - updateBuildGradle(filePath: string, versionCode: number, versionName: string): boolean
    Input: build.gradle path and new version values
    Output: Success status
```

**Semantic Versioning Format**
```
Pattern: MAJOR.MINOR.PATCH
Examples:
  - 1.0.0 (initial release)
  - 1.0.1 (patch update)
  - 1.1.0 (minor update)
  - 2.0.0 (major update)
```

## Data Models

### KeystoreConfig
```typescript
interface KeystoreConfig {
  keystorePath: string;
  keystorePassword: string;
  keyAlias: string;
  keyPassword: string;
  validity: number; // days
}
```

### BuildResult
```typescript
interface BuildResult {
  success: boolean;
  outputPath: string;
  buildLog: string[];
  errors: string[];
  buildTime: number; // milliseconds
}
```

### ValidationResult
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

### DeploymentConfig
```typescript
interface DeploymentConfig {
  productionURL: string;
  packageName: string;
  appName: string;
  versionCode: number;
  versionName: string;
  keystoreConfig: KeystoreConfig;
  storeListingData: StoreListingData;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing the acceptance criteria, I identified the following testable properties. I've eliminated redundancy by:
- Combining file format and location checks into comprehensive validation properties
- Merging version management checks into single properties
- Consolidating image dimension validations

The following properties provide unique validation value without logical redundancy:

### Property 1: System Requirements Validation
*For any* Windows system, if RAM is less than 8GB or free disk space is less than 8GB, then the system requirements check should fail and prevent Android Studio installation.
**Validates: Requirements 1.4**

### Property 2: HTTPS Protocol Enforcement
*For any* production URL, the URL must use HTTPS protocol, otherwise the deployment validation should fail.
**Validates: Requirements 2.1**

### Property 3: URL Accessibility Validation
*For any* production URL, an HTTP GET request should return a successful response (status code 200-299), confirming the URL is accessible.
**Validates: Requirements 2.2**

### Property 4: PWA Manifest Validation
*For any* production URL, the URL should serve a valid manifest.json file at the root or specified path, and the manifest should contain required PWA fields (name, short_name, start_url, display, icons).
**Validates: Requirements 2.3**

### Property 5: Service Worker Presence
*For any* production URL claiming PWA support, a service worker registration should be detectable in the page source or via the Service Worker API.
**Validates: Requirements 2.3**

### Property 6: TWA Dependency Validation
*For any* build.gradle file in a TWA project, the file should contain the androidbrowserhelper dependency with a valid version number (format: x.y.z where x, y, z are integers).
**Validates: Requirements 3.2**

### Property 7: Manifest URL Configuration
*For any* AndroidManifest.xml file in a TWA project, the file should contain a meta-data element with name "android.support.customtabs.trusted.DEFAULT_URL" and a valid HTTPS URL as the value.
**Validates: Requirements 3.3**

### Property 8: Build Success Validation
*For any* TWA project with valid configuration, running the Gradle build command should exit with code 0 (success) and produce an output file in the expected location.
**Validates: Requirements 3.4**

### Property 9: Keystore Fingerprint Generation
*For any* keystore file created with valid parameters, extracting the SHA-256 fingerprint using keytool should produce a 64-character hexadecimal string (32 bytes represented as hex).
**Validates: Requirements 4.1**

### Property 10: Asset Links File Accessibility
*For any* production URL, the assetlinks.json file should be accessible at the path /.well-known/assetlinks.json and return a valid JSON response.
**Validates: Requirements 4.2**

### Property 11: Asset Links Content Validation
*For any* assetlinks.json file, parsing the JSON should succeed and the structure should contain required fields: relation array, target object with namespace, package_name, and sha256_cert_fingerprints array.
**Validates: Requirements 4.3**

### Property 12: Keystore Password Protection
*For any* keystore file, attempting to access it without the correct password should fail, confirming the keystore is password-protected.
**Validates: Requirements 5.1**

### Property 13: Keystore File Format Validation
*For any* keystore file path, the file extension should be either .jks or .keystore.
**Validates: Requirements 5.2**

### Property 14: APK/AAB Signature Verification
*For any* signed APK or AAB file, running jarsigner verification should confirm the file is signed and return the signer certificate information.
**Validates: Requirements 5.3**

### Property 15: Build Output Format Validation
*For any* completed build process, the output directory should contain either an APK file (*.apk) or AAB file (*.aab) or both, depending on the build command used.
**Validates: Requirements 5.4**

### Property 16: Build Output Location Validation
*For any* successful release build, the signed output file should exist in the app/release/ directory relative to the project root.
**Validates: Requirements 5.5**

### Property 17: Screenshot Dimension Validation
*For any* set of screenshots for store listing, each screenshot should have dimensions of either 1080x1920 or 1920x1080 pixels, and the total count should be at least 2.
**Validates: Requirements 7.1**

### Property 18: App Icon Dimension Validation
*For any* app icon image, the dimensions should be exactly 512x512 pixels.
**Validates: Requirements 7.2**

### Property 19: Feature Graphic Dimension Validation
*For any* feature graphic image, the dimensions should be exactly 1024x500 pixels.
**Validates: Requirements 7.3**

### Property 20: Description Length Validation
*For any* store listing data, the short description length should not exceed 80 characters and the full description length should not exceed 4000 characters.
**Validates: Requirements 7.4**

### Property 21: Privacy Policy URL Validation
*For any* store listing data, the privacy policy URL should be a valid URL format (starting with http:// or https://) and should be accessible (return HTTP 200).
**Validates: Requirements 7.5**

### Property 22: Version Code Increment
*For any* version update, the new versionCode should be strictly greater than the previous versionCode (typically incremented by 1).
**Validates: Requirements 10.1**

### Property 23: Semantic Versioning Format
*For any* versionName string, it should match the semantic versioning pattern (MAJOR.MINOR.PATCH where each component is a non-negative integer, e.g., "1.0.0", "2.1.3").
**Validates: Requirements 10.2**


## Error Handling

### 1. Installation Errors

**Insufficient System Resources**
```
Error: System does not meet minimum requirements
Handling:
  - Check RAM: Display current RAM and required RAM (8GB)
  - Check Disk Space: Display available space and required space (8GB)
  - Provide clear error message with specific deficiency
  - Suggest: Close applications or free up disk space
```

**Android Studio Installation Failure**
```
Error: Android Studio installation failed
Handling:
  - Log installation error details
  - Check Windows compatibility
  - Verify installer integrity (checksum)
  - Suggest: Download installer again or check antivirus settings
```

### 2. Deployment Errors

**HTTPS Not Available**
```
Error: Production URL does not use HTTPS
Handling:
  - Reject deployment configuration
  - Display: "TWA requires HTTPS. Current URL: {url}"
  - Suggest: Configure SSL certificate or use hosting service with HTTPS
```

**PWA Requirements Not Met**
```
Error: manifest.json or service worker missing
Handling:
  - List missing components
  - Provide links to PWA documentation
  - Suggest: Add manifest.json and register service worker
```

**URL Not Accessible**
```
Error: Cannot reach production URL
Handling:
  - Display HTTP status code or network error
  - Suggest: Check URL spelling, DNS configuration, or firewall settings
  - Retry mechanism: Attempt 3 times with exponential backoff
```

### 3. Build Errors

**Gradle Build Failure**
```
Error: Build failed with errors
Handling:
  - Parse and display specific error messages from build log
  - Common issues:
    - Missing dependency: Suggest adding to build.gradle
    - SDK version mismatch: Display required vs. installed versions
    - Syntax error: Show file and line number
  - Provide link to full build log
```

**Signing Configuration Error**
```
Error: Keystore not found or invalid password
Handling:
  - Verify keystore file exists at specified path
  - If password incorrect: Allow 3 retry attempts
  - Suggest: Regenerate keystore if lost (note: cannot update existing app)
```

**Build Output Not Found**
```
Error: Expected output file not found after build
Handling:
  - Check build/outputs/apk/release/ and build/outputs/bundle/release/
  - Display actual directory contents
  - Suggest: Clean and rebuild project
```

### 4. Digital Asset Links Errors

**Fingerprint Mismatch**
```
Error: SHA-256 fingerprint in assetlinks.json does not match keystore
Handling:
  - Display expected fingerprint (from keystore)
  - Display actual fingerprint (from assetlinks.json)
  - Suggest: Update assetlinks.json with correct fingerprint
  - Provide command to extract fingerprint from keystore
```

**Asset Links File Not Accessible**
```
Error: Cannot access /.well-known/assetlinks.json
Handling:
  - Verify URL: {productionURL}/.well-known/assetlinks.json
  - Check HTTP status code
  - Suggest: 
    - Ensure file is uploaded to correct location
    - Check web server configuration for .well-known directory
    - Verify CORS settings if applicable
```

**Invalid JSON Format**
```
Error: assetlinks.json is not valid JSON
Handling:
  - Display JSON parsing error with line number
  - Suggest: Validate JSON using online validator
  - Provide correct JSON template
```

### 5. Store Listing Errors

**Image Dimension Mismatch**
```
Error: Image does not meet dimension requirements
Handling:
  - Display actual dimensions vs. required dimensions
  - Specify which image (icon, screenshot, feature graphic)
  - Suggest: Resize image using image editor
  - Provide recommended tools: GIMP, Photoshop, online resizers
```

**Description Length Exceeded**
```
Error: Description exceeds maximum length
Handling:
  - Display current length vs. maximum length
  - Show excess character count
  - Suggest: Edit description to fit within limit
```

**Invalid Privacy Policy URL**
```
Error: Privacy policy URL is invalid or not accessible
Handling:
  - Validate URL format
  - Test URL accessibility (HTTP GET request)
  - Display error: "URL returned status code {code}"
  - Suggest: Ensure privacy policy page is published and accessible
```

### 6. Version Management Errors

**Version Code Not Incremented**
```
Error: New versionCode must be greater than previous versionCode
Handling:
  - Display previous versionCode and attempted new versionCode
  - Suggest: Increment versionCode by at least 1
  - Auto-suggest: previousVersionCode + 1
```

**Invalid Semantic Version Format**
```
Error: versionName does not follow semantic versioning
Handling:
  - Display current versionName
  - Show expected format: MAJOR.MINOR.PATCH (e.g., "1.0.0")
  - Suggest valid version based on update type:
    - Bug fix: Increment PATCH
    - New feature: Increment MINOR
    - Breaking change: Increment MAJOR
```

### 7. Google Play Console Errors

**Upload Rejected**
```
Error: Google Play Console rejected the upload
Handling:
  - Display specific rejection reason from API response
  - Common issues:
    - Package name conflict: Suggest changing package name
    - Signature mismatch: Verify keystore is correct
    - Version code conflict: Increment version code
  - Provide link to Google Play Console error documentation
```

**Review Rejection**
```
Error: App rejected during review process
Handling:
  - Display rejection reason from Google
  - Common issues:
    - Policy violation: Review Google Play policies
    - Broken functionality: Test app thoroughly
    - Misleading content: Update store listing
  - Suggest: Address issues and resubmit
```

## Testing Strategy

### Dual Testing Approach

This project requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing

**Framework**: fast-check (for TypeScript/JavaScript) or Hypothesis (for Python)

**Configuration**:
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `Feature: google-play-store-deployment, Property {number}: {property_text}`

**Example Property Test Structure** (TypeScript with fast-check):
```typescript
import fc from 'fast-check';

// Feature: google-play-store-deployment, Property 2: HTTPS Protocol Enforcement
test('Production URLs must use HTTPS protocol', () => {
  fc.assert(
    fc.property(
      fc.webUrl(), // generates random URLs
      (url) => {
        const validator = new URLValidator();
        const result = validator.validateHTTPS(url);
        
        if (url.startsWith('https://')) {
          expect(result.isValid).toBe(true);
        } else {
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain('URL must use HTTPS protocol');
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing

**Framework**: Jest (for TypeScript/JavaScript) or pytest (for Python)

**Focus Areas**:
1. **Specific Examples**: Test known valid and invalid inputs
2. **Edge Cases**: Empty strings, null values, boundary conditions
3. **Error Conditions**: Invalid file paths, network failures, permission errors
4. **Integration Points**: File system operations, network requests, external tool invocations

**Example Unit Test Structure**:
```typescript
describe('KeystoreManager', () => {
  test('should generate keystore with valid parameters', () => {
    const manager = new KeystoreManager();
    const result = manager.generateKeystore({
      alias: 'my-key',
      password: 'secure-password',
      validity: 10000,
      outputPath: './test-keystore.jks'
    });
    
    expect(result.success).toBe(true);
    expect(result.keystorePath).toBe('./test-keystore.jks');
    expect(result.sha256Fingerprint).toMatch(/^[A-F0-9:]{95}$/);
  });
  
  test('should fail with invalid password', () => {
    const manager = new KeystoreManager();
    expect(() => {
      manager.generateKeystore({
        alias: 'my-key',
        password: '', // invalid: empty password
        validity: 10000,
        outputPath: './test-keystore.jks'
      });
    }).toThrow('Password cannot be empty');
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All 23 correctness properties must have corresponding property tests
- **Integration Tests**: End-to-end workflow tests for critical paths:
  1. Complete deployment flow (project creation → build → upload)
  2. Version update flow (increment version → rebuild → upload)
  3. Asset links verification flow (generate keystore → create assetlinks.json → verify)

### Testing Tools

**Validation Tools**:
- `keytool`: Keystore management and fingerprint extraction
- `jarsigner`: APK/AAB signature verification
- `aapt2`: Android resource inspection
- `bundletool`: AAB inspection and testing

**Automation Scripts**:
- PowerShell scripts for Windows automation
- Gradle tasks for build automation
- Node.js scripts for web validation (URL checks, JSON validation)

### Continuous Validation

**Pre-Build Checks**:
1. Validate system requirements
2. Verify production URL accessibility
3. Check PWA requirements
4. Validate assetlinks.json

**Post-Build Checks**:
1. Verify build output exists
2. Confirm file is signed
3. Validate version numbers
4. Check file size (AAB should be < 150MB for initial upload)

**Pre-Upload Checks**:
1. Validate all store listing assets
2. Verify image dimensions
3. Check description lengths
4. Confirm privacy policy URL accessibility

