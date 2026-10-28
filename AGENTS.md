# Product context

Divvy is a group expense-sharing product, not a household-only tracker. Support friends, travel groups, roommates, families, events and other people sharing costs. A household is one valid use case; do not make it the default assumption for navigation, copy, data models or new functionality. Use Group/Groups terminology for the shared space.

Keep the frontend's branding aligned with divvy-mobile: the shared green/mint theme and the existing logo assets in public/brand.

Follow the feature-based structure and ownership documented in docs/ARCHITECTURE.md. Existing household route/storage references are compatibility adapters, not current product terminology; preserve them when needed for existing users.

Use the existing local shadcn/Base UI components for interface controls. For controlled dropdowns, prefer components/ui/form-select.tsx over raw HTML selects; keep Divvy theme tokens and accessible labels. Check existing components before installing or generating replacements.
