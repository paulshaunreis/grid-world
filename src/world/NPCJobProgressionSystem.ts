import type { NPCProfileRecord } from './NPCProfile';
import { NPCSkillCertificateSystem } from './NPCSkillCertificateSystem';

const ROLE_SKILLS: Record<string,string> = {
  NAVIGATOR:'navigation', GARDENER:'horticulture', ARTISAN:'crafting', KEEPER:'stewardship', RANGER:'fieldcraft'
};

export class NPCJobProgressionSystem {
  readonly certificates = new NPCSkillCertificateSystem();

  award(profile: NPCProfileRecord, amount: number, skill?: string) {
    const xp = Math.max(0, amount);
    profile.experience += xp;
    const nextLevel = profile.level * 100;
    while (profile.experience >= nextLevel) {
      profile.experience -= nextLevel;
      profile.level += 1;
      profile.occupation.progression += 1;
    }
    const key = skill ?? ROLE_SKILLS[profile.role] ?? profile.role.toLowerCase();
    profile.skills[key] = Math.min(100, (profile.skills[key] ?? 1) + xp * .02);
    this.certificates.sync(profile);
    return profile;
  }

  certificatesFor(profile: NPCProfileRecord) { return this.certificates.sync(profile); }

  skillFor(profile: NPCProfileRecord) {
    const key = ROLE_SKILLS[profile.role] ?? profile.role.toLowerCase();
    return { name:key, value:profile.skills[key] ?? 1 };
  }
}
