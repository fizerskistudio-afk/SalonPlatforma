import "server-only";

export {
  hasProductEntitlement,
  resolveProductFeatureDecision,
  resolveProductPackageAccess,
} from "./resolver";

export type {
  ProductFeatureBlocker,
  ProductFeatureDecision,
  ProductPackageAccess,
  ProductPackageAccessMode,
  ProductPackageAssignmentRow,
} from "./resolver";
