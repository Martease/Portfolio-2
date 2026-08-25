# TypeScript Error Baseline (Pre-existing)

Date: 2026-08-25  
Command: `npx tsc --noEmit`  
Result: 38 errors in 10 files

This baseline records pre-existing TypeScript errors so future migration work can be compared against a known starting point. No files listed below were modified as part of this baseline capture.

## Error Categories

- TS18047: Nullability check missing (`possibly 'null'`)
- TS2307: Module resolution failure (`Cannot find module`)
- TS2339: Property access on incompatible inferred type (`{}` or `never`)
- TS2345: Argument type not assignable (`... not assignable to parameter of type 'never'`)
- TS2353: Excess/unknown object literal property

## Detailed Error Instances (1-38)

1. [app/(portal)/portal/accept-invite/page.tsx](app/(portal)/portal/accept-invite/page.tsx#L10) - TS18047 - Nullability check missing
2. [app/(portal)/portal/login/page.tsx](app/(portal)/portal/login/page.tsx#L22) - TS18047 - Nullability check missing
3. [app/(portal)/portal/projects/[projectId]/board/page.tsx](app/(portal)/portal/projects/[projectId]/board/page.tsx#L3) - TS2307 - Module resolution failure
4. [app/(portal)/portal/projects/[projectId]/board/page.tsx](app/(portal)/portal/projects/[projectId]/board/page.tsx#L4) - TS2307 - Module resolution failure
5. [app/(portal)/portal/projects/[projectId]/timeline/page.tsx](app/(portal)/portal/projects/[projectId]/timeline/page.tsx#L3) - TS2307 - Module resolution failure
6. [app/(portal)/portal/projects/[projectId]/timeline/page.tsx](app/(portal)/portal/projects/[projectId]/timeline/page.tsx#L4) - TS2307 - Module resolution failure
7. [app/(portal)/portal/projects/[projectId]/timeline/page.tsx](app/(portal)/portal/projects/[projectId]/timeline/page.tsx#L78) - TS2339 - Property access on incompatible inferred type
8. [app/(portal)/portal/projects/[projectId]/timeline/page.tsx](app/(portal)/portal/projects/[projectId]/timeline/page.tsx#L83) - TS2339 - Property access on incompatible inferred type
9. [components/DiscoveryForm.tsx](components/DiscoveryForm.tsx#L61) - TS18047 - Nullability check missing
10. [components/DiscoveryForm.tsx](components/DiscoveryForm.tsx#L62) - TS18047 - Nullability check missing
11. [lib/businessOsStore.ts](lib/businessOsStore.ts#L111) - TS2345 - Argument type not assignable
12. [lib/businessOsStore.ts](lib/businessOsStore.ts#L251) - TS2345 - Argument type not assignable
13. [pages/admin/leads.tsx](pages/admin/leads.tsx#L34) - TS2353 - Excess/unknown object literal property
14. [pages/api/back-office/export/crm.ts](pages/api/back-office/export/crm.ts#L21) - TS2339 - Property access on incompatible inferred type
15. [pages/api/back-office/export/crm.ts](pages/api/back-office/export/crm.ts#L22) - TS2339 - Property access on incompatible inferred type
16. [pages/api/back-office/export/crm.ts](pages/api/back-office/export/crm.ts#L23) - TS2339 - Property access on incompatible inferred type
17. [pages/api/back-office/export/crm.ts](pages/api/back-office/export/crm.ts#L24) - TS2339 - Property access on incompatible inferred type
18. [pages/api/back-office/export/crm.ts](pages/api/back-office/export/crm.ts#L25) - TS2339 - Property access on incompatible inferred type
19. [pages/api/back-office/export/crm.ts](pages/api/back-office/export/crm.ts#L26) - TS2339 - Property access on incompatible inferred type
20. [pages/api/back-office/export/crm.ts](pages/api/back-office/export/crm.ts#L27) - TS2339 - Property access on incompatible inferred type
21. [pages/api/back-office/export/crm.ts](pages/api/back-office/export/crm.ts#L28) - TS2339 - Property access on incompatible inferred type
22. [pages/api/back-office/export/crm.ts](pages/api/back-office/export/crm.ts#L29) - TS2339 - Property access on incompatible inferred type
23. [pages/api/back-office/export/crm.ts](pages/api/back-office/export/crm.ts#L30) - TS2339 - Property access on incompatible inferred type
24. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L21) - TS2339 - Property access on incompatible inferred type
25. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L22) - TS2339 - Property access on incompatible inferred type
26. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L23) - TS2339 - Property access on incompatible inferred type
27. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L24) - TS2339 - Property access on incompatible inferred type
28. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L25) - TS2339 - Property access on incompatible inferred type
29. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L26) - TS2339 - Property access on incompatible inferred type
30. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L27) - TS2339 - Property access on incompatible inferred type
31. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L28) - TS2339 - Property access on incompatible inferred type
32. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L29) - TS2339 - Property access on incompatible inferred type
33. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L30) - TS2339 - Property access on incompatible inferred type
34. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L31) - TS2339 - Property access on incompatible inferred type
35. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L32) - TS2339 - Property access on incompatible inferred type
36. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L33) - TS2339 - Property access on incompatible inferred type
37. [pages/api/back-office/export/projects.ts](pages/api/back-office/export/projects.ts#L34) - TS2339 - Property access on incompatible inferred type
38. [pages/api/submit-discovery.ts](pages/api/submit-discovery.ts#L104) - TS2353 - Excess/unknown object literal property

## Totals by Category

- TS18047: 4
- TS2307: 4
- TS2339: 26
- TS2345: 2
- TS2353: 2
