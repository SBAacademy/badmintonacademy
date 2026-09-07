# S&A Badminton Academy — Rebel Admin UI Component System

## Centralized Component Architecture
All components are implemented in [`s_a_admin/lib/core/components/rebel_components.dart`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/s_a_admin/lib/core/components/rebel_components.dart) and styled with tokens from [`s_a_admin/lib/core/theme/app_theme.dart`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/s_a_admin/lib/core/theme/app_theme.dart).

---

### Component Catalog

#### 1. `RebelCard`
- **Description**: Standard obsidian surface container with 1px border (`#232732`) and 12pt corner radius.
- **Props**: `child`, `padding`, `margin`, `color`, `borderColor`, `onTap`.
- **Usage**:
  ```dart
  RebelCard(
    onTap: () => viewDetail(),
    child: Text('Card Content'),
  )
  ```

#### 2. `RebelMetricCard`
- **Description**: High-impact operational KPI tile designed for 2x3 grids.
- **Props**: `label`, `value`, `icon`, `accentColor`, `onTap`.
- **Features**: Distinct top icon, 24px bold metric value, muted secondary label, subtle border highlight.

#### 3. `RebelButton`
- **Description**: Primary full-width CTA styled in electric lime (`#CCFF00`) with dark typography (`#0A0C0F`).
- **Props**: `label`, `onPressed`, `icon`, `isLoading`, `height`.
- **Height**: Defaults to 48pt for finger-friendly touch targets.

#### 4. `RebelSecondaryButton`
- **Description**: Dark obsidian button with border stroke (`#232732`) and white typography for secondary actions.
- **Props**: `label`, `onPressed`, `icon`, `height`.

#### 5. `RebelSearchField`
- **Description**: iPhone-native search bar with rounded obsidian container, magnifying glass icon, and clear (`×`) button.
- **Props**: `controller`, `hintText`, `onChanged`, `onClear`.

#### 6. `RebelFilterPill`
- **Description**: Segmented chip with rounded corners (20pt).
- **Active State**: Electric lime fill (`#CCFF00`) with dark black text.
- **Inactive State**: Dark surface (`#181C24`) with subtle border and muted text.

#### 7. `RebelSegmentedControl<T>`
- **Description**: iOS-style segmented pill selector.
- **Props**: `values`, `selectedValue`, `onSelected`, `labelBuilder`.
- **Styling**: Horizontal pill track with highlighted selection pill.

#### 8. `RebelStatusBadge`
- **Description**: Compact uppercase pill indicator for states (`NEW`, `PAID`, `TRIAL`, `ABSENT`).
- **Props**: `label`, `color`, `isFilled`.
- **Styling**: Uses 85% opacity tint with matching border and uppercase micro-typography (10-11px).

#### 9. `RebelAvatar`
- **Description**: Circular avatar supporting user photos or uppercase initials fallback.
- **Props**: `name`, `imageUrl`, `radius`, `backgroundColor`, `textColor`.

#### 10. `RebelSectionHeader`
- **Description**: Section label with optional right-aligned action link (e.g. `See All`).
- **Props**: `title`, `actionLabel`, `onAction`.

#### 11. `RebelBottomActionBar`
- **Description**: Sticky bottom bar respecting iOS home indicator safe areas (`SafeArea`).
- **Props**: `child`, `padding`, `backgroundColor`.

#### 12. `RebelEmptyState`
- **Description**: Centered illustration icon with headline and descriptive operational guidance.
- **Props**: `icon`, `title`, `message`, `action`.
