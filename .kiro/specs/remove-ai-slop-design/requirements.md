# Requirements Document

## Introduction

Multi Kreasi Printing adalah aplikasi web management untuk bisnis percetakan yang memiliki berbagai role (Admin, Sales, Production, Finance). Aplikasi ini saat ini menggunakan elemen desain yang umum ditemukan pada template AI (AI slop) yang mengurangi kredibilitas dan profesionalitas aplikasi. Dokumen ini mendefinisikan requirements untuk menghilangkan elemen-elemen tersebut dan menggantinya dengan desain yang lebih profesional, unik, dan sesuai untuk aplikasi business management.

## Glossary

- **Design_System**: Sistem desain baru yang akan mengganti elemen AI slop dengan komponen profesional
- **UI_Component**: Komponen antarmuka pengguna seperti button, card, navigation
- **Color_Palette**: Skema warna yang digunakan dalam aplikasi
- **Typography_System**: Sistem font dan hierarki teks
- **Icon_System**: Sistem ikon yang digunakan untuk navigasi dan aksi
- **Layout_Component**: Komponen tata letak seperti sidebar, header, dashboard grid
- **Animation_System**: Sistem animasi dan transisi
- **Theme_Config**: File konfigurasi tema aplikasi

## Requirements

### Requirement 1: Remove AI Slop Typography

**User Story:** Sebagai pengguna aplikasi business management, saya ingin melihat typography yang profesional dan mudah dibaca, sehingga aplikasi terlihat kredibel dan nyaman digunakan untuk pekerjaan sehari-hari.

#### Acceptance Criteria

1. THE Design_System SHALL NOT use Inter, Geist, or Space Grotesk fonts
2. THE Typography_System SHALL use system fonts atau professional business fonts seperti IBM Plex Sans, Work Sans, atau Noto Sans
3. THE Typography_System SHALL define clear hierarchy dengan minimal 5 levels (heading 1-4, body)
4. WHEN rendering text content, THE UI_Component SHALL use consistent font weights (400, 500, 600, 700)
5. THE Typography_System SHALL maintain line height between 1.4 dan 1.6 untuk body text

### Requirement 2: Remove AI Slop Color Schemes

**User Story:** Sebagai pengguna aplikasi, saya ingin melihat skema warna yang profesional dan tidak berlebihan, sehingga fokus saya tidak terganggu saat bekerja.

#### Acceptance Criteria

1. THE Color_Palette SHALL NOT use purple and black color scheme
2. THE Color_Palette SHALL NOT use rainbow coloring
3. THE Color_Palette SHALL NOT use neon colors
4. THE Color_Palette SHALL NOT use basic pastel colors
5. THE Color_Palette SHALL use professional business colors seperti neutral grays, deep blues, atau earth tones
6. THE Color_Palette SHALL define maximum 3 primary semantic colors (primary, success, danger)
7. THE Color_Palette SHALL use neutral backgrounds (not pure white #FFFFFF)
8. WHEN displaying status indicators, THE UI_Component SHALL use subtle color variations

### Requirement 3: Replace Lucide Icons

**User Story:** Sebagai pengguna aplikasi, saya ingin melihat ikon yang unik dan tidak generik, sehingga aplikasi memiliki identitas visual yang kuat.

#### Acceptance Criteria

1. THE Icon_System SHALL NOT use Lucide icons library
2. THE Icon_System SHALL use alternative icon library seperti Phosphor Icons, Iconoir, atau custom SVG icons
3. THE Icon_System SHALL maintain consistent stroke width across all icons
4. WHEN rendering navigation items, THE Layout_Component SHALL display icons dengan consistent sizing (16px atau 20px)
5. THE Icon_System SHALL NOT use sparkle icons atau animated arrows

### Requirement 4: Remove Excessive Visual Effects

**User Story:** Sebagai pengguna aplikasi business, saya ingin interface yang clean dan tidak distraktif, sehingga saya dapat fokus pada data dan tugas.

#### Acceptance Criteria

1. THE UI_Component SHALL NOT use harsh gradients
2. THE UI_Component SHALL NOT use drop shadows exceeding 2px blur radius
3. THE UI_Component SHALL NOT use liquid glass effects
4. THE UI_Component SHALL NOT use radial orbs
5. THE UI_Component SHALL NOT use dot grids as background
6. WHEN displaying cards or containers, THE UI_Component SHALL use subtle borders atau flat surfaces
7. THE UI_Component SHALL use corner radius maximum 8px (not soft rounded corners)

### Requirement 5: Redesign Dashboard Layout

**User Story:** Sebagai user dengan role Owner atau Manager, saya ingin melihat dashboard layout yang tidak menggunakan layout template umum, sehingga dashboard terasa custom dan profesional.

#### Acceptance Criteria

1. THE Layout_Component SHALL NOT display 3 feature cards in a row
2. THE Layout_Component SHALL NOT use bento grid layout
3. THE Layout_Component SHALL NOT use terminal window mockups
4. THE Layout_Component SHALL use asymmetric grid atau data-first layout
5. WHEN displaying metrics, THE Layout_Component SHALL prioritize data density over visual decoration
6. THE Layout_Component SHALL display real production data (not fake testimonials)

### Requirement 6: Remove Marketing Clichés

**User Story:** Sebagai pengguna aplikasi internal business, saya ingin melihat interface yang business-focused tanpa elemen marketing, sehingga aplikasi terasa seperti professional tool bukan landing page.

#### Acceptance Criteria

1. THE UI_Component SHALL NOT use emojis in interface text
2. THE UI_Component SHALL NOT use "It's not X, it's Y" copywriting pattern
3. THE UI_Component SHALL NOT use checkmark bullets for feature lists
4. THE UI_Component SHALL NOT display 3 pricing tiers layout
5. WHEN displaying lists, THE UI_Component SHALL use simple bullets atau numbered lists
6. THE Layout_Component SHALL provide real product functionality (not marketing demos)

### Requirement 7: Implement Professional Sidebar Design

**User Story:** Sebagai pengguna yang mengakses berbagai halaman, saya ingin sidebar navigation yang professional dan efficient, sehingga navigasi terasa natural untuk business application.

#### Acceptance Criteria

1. THE Layout_Component SHALL NOT use colored left stripe on sidebar items
2. WHEN a navigation item is active, THE Layout_Component SHALL indicate state dengan background color atau border (not colored stripe)
3. THE Layout_Component SHALL use consistent spacing minimum 8px between menu items
4. THE Layout_Component SHALL display menu labels dengan font size minimum 14px
5. WHEN sidebar is collapsed, THE Layout_Component SHALL show tooltip on hover

### Requirement 8: Reduce Animation Overuse

**User Story:** Sebagai pengguna yang bekerja dengan aplikasi sepanjang hari, saya ingin animasi yang subtle dan tidak mengganggu, sehingga aplikasi terasa responsive tanpa distraktif.

#### Acceptance Criteria

1. THE Animation_System SHALL NOT use hover animations exceeding 200ms duration
2. THE Animation_System SHALL NOT use animated arrows atau sparkle animations
3. WHEN user hovers over interactive elements, THE UI_Component SHALL provide subtle feedback (maximum opacity atau scale change 5%)
4. THE Animation_System SHALL use easing function cubic-bezier untuk natural motion
5. THE Animation_System SHALL allow users to disable animations via system preferences (prefers-reduced-motion)

### Requirement 9: Improve Background and Surface Design

**User Story:** Sebagai pengguna yang menatap layar untuk waktu lama, saya ingin background yang nyaman untuk mata, sehingga tidak menyebabkan eye strain.

#### Acceptance Criteria

1. THE Design_System SHALL NOT use pure white (#FFFFFF) as main background
2. THE Design_System SHALL use neutral backgrounds seperti #F8F9FA, #FAFBFC, atau #F5F5F5
3. WHEN rendering cards atau panels, THE UI_Component SHALL use backgrounds dengan sufficient contrast (minimum WCAG AA)
4. THE Design_System SHALL define maximum 3 surface levels (base, raised, overlay)
5. THE UI_Component SHALL use consistent background colors across similar component types

### Requirement 10: Implement Professional Loading States

**User Story:** Sebagai pengguna yang menunggu data loading, saya ingin loading state yang informatif, sehingga saya tahu aplikasi sedang bekerja.

#### Acceptance Criteria

1. WHEN data is loading, THE UI_Component SHALL display skeleton loaders
2. THE UI_Component SHALL NOT use rainbow spinners atau neon loading indicators
3. THE UI_Component SHALL match skeleton shape dengan actual content structure
4. THE Animation_System SHALL use subtle pulse animation untuk skeleton loaders (1.5s duration)
5. WHEN loading completes, THE UI_Component SHALL transition smoothly tanpa jarring flash

### Requirement 11: Add Legal and Support Pages

**User Story:** Sebagai administrator aplikasi, saya ingin memiliki halaman legal yang required untuk aplikasi business, sehingga aplikasi memenuhi compliance requirements.

#### Acceptance Criteria

1. THE Design_System SHALL include Terms of Service page
2. THE Design_System SHALL include Privacy Policy page
3. THE Layout_Component SHALL provide footer dengan links ke legal pages
4. WHEN user navigates to legal pages, THE Layout_Component SHALL render content dalam readable format (not wall of text)
5. THE Design_System SHALL include Help atau Support page dengan contact information

### Requirement 12: Create Design Tokens Configuration

**User Story:** Sebagai developer yang maintain aplikasi, saya ingin design tokens yang terdefinisi dengan jelas, sehingga konsistensi visual mudah dijaga.

#### Acceptance Criteria

1. THE Theme_Config SHALL define all colors sebagai CSS custom properties atau TypeScript constants
2. THE Theme_Config SHALL define spacing scale (4px, 8px, 12px, 16px, 24px, 32px, 48px)
3. THE Theme_Config SHALL define typography scale dengan clear naming (text-xs, text-sm, text-base, text-lg, text-xl)
4. THE Theme_Config SHALL define shadow system dengan maximum 3 levels
5. WHEN developer uses design tokens, THE Theme_Config SHALL be imported dari single source file
6. THE Theme_Config SHALL define border radius tokens (sm: 4px, md: 6px, lg: 8px)

