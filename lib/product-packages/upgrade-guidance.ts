import {
  getProductFeatureDefinition,
  getProductFeatureUpgradeCandidates,
  type ProductFeatureKey,
} from "./gates";
import {
  PRODUCT_PACKAGES,
  type ProductPackageDefinition,
  type ProductPackageKey,
} from "./registry";

export type ProductFeatureUpgradeAudience =
  | "tenant_admin"
  | "staff";

export type ProductFeatureUpgradeGuidance = {
  audience:
    ProductFeatureUpgradeAudience;
  featureKey:
    ProductFeatureKey;
  featureLabel: string;
  featureDescription: string;
  currentPackageKey:
    ProductPackageKey | null;
  currentPackage:
    ProductPackageDefinition | null;
  minimumPackage:
    ProductPackageDefinition | null;
  currentPackageLabel: string;
  requiredPackageLabel: string;
  eyebrow: string;
  currentPackageCaption: string;
  requiredPackageCaption: string;
  continuityNote: string;
  message: string;
};

export function getProductFeatureUpgradeGuidance(
  input: {
    audience:
      ProductFeatureUpgradeAudience;
    featureKey:
      ProductFeatureKey;
    currentPackageKey:
      ProductPackageKey | null;
  }
): ProductFeatureUpgradeGuidance {
  const feature =
    getProductFeatureDefinition(
      input.featureKey
    );

  const minimumPackage =
    getProductFeatureUpgradeCandidates(
      input.featureKey
    ).at(
      0
    ) ??
    null;

  const currentPackage =
    input.currentPackageKey
      ? PRODUCT_PACKAGES[
          input.currentPackageKey
        ]
      : null;

  const currentPackageLabel =
    currentPackage
      ?.name ??
    "Legacy full access";

  const requiredPackageLabel =
    minimumPackage
      ?.name ??
    "Paket po ponudi";

  const isStaff =
    input.audience ===
    "staff";

  return {
    audience:
      input.audience,
    featureKey:
      input.featureKey,
    featureLabel:
      feature.label,
    featureDescription:
      feature.description,
    currentPackageKey:
      input.currentPackageKey,
    currentPackage,
    minimumPackage,
    currentPackageLabel,
    requiredPackageLabel,
    eyebrow:
      isStaff
        ? "Staff funkcija nije uključena u paket salona"
        : "Funkcija nije uključena u trenutni paket",
    currentPackageCaption:
      isStaff
        ? "Trenutni paket salona"
        : "Trenutni paket",
    requiredPackageCaption:
      isStaff
        ? "Potreban paket"
        : "Minimalni paket",
    continuityNote:
      isStaff
        ? "Tvoj staff panel, rezervacije, napomene, odsustva i raspored ostaju dostupni. Promenu paketa potvrđuje vlasnik salona sa platform timom."
        : "Nijedan podatak nije obrisan i postojeće booking funkcije ostaju dostupne. Promenu paketa potvrđuje platform tim.",
    message:
      `Funkcija „${feature.label}“ nije uključena u paket salona. Potreban je paket ${requiredPackageLabel} ili viši.`,
  };
}
