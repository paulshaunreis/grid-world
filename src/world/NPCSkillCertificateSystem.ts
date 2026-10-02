import type { NPCProfileRecord } from './NPCProfile';

export interface NPCSkillCertificate {
  id:string;
  npcId:string;
  skill:string;
  title:string;
  level:number;
  issuer:string;
  earnedAt:number;
  inGridValid:boolean;
  externalVerificationReady:boolean;
}

const THRESHOLDS = [25, 50, 75, 90] as const;

export class NPCSkillCertificateSystem {
  private certificates = new Map<string,NPCSkillCertificate[]>();

  sync(profile:NPCProfileRecord):NPCSkillCertificate[] {
    const existing = this.certificates.get(profile.id) ?? [];
    for (const [skill, rawValue] of Object.entries(profile.skills)) {
      const value = Math.max(0, Number(rawValue) || 0);
      for (const threshold of THRESHOLDS) {
        const id = profile.id + ':' + skill + ':' + threshold;
        if (value < threshold || existing.some(c => c.id === id)) continue;
        existing.push({
          id,
          npcId:profile.id,
          skill,
          title:skill.replace(/[-_]/g,' ') + ' · Level ' + threshold,
          level:threshold,
          issuer:'Grid World Skills Registry',
          earnedAt:Date.now(),
          inGridValid:true,
          // This is intentionally a readiness flag, not a claim of external accreditation.
          externalVerificationReady:false,
        });
      }
    }
    existing.sort((a,b)=>b.level-a.level || b.earnedAt-a.earnedAt);
    this.certificates.set(profile.id, existing);
    profile.certificates = existing.map(c => ({...c}));
    return profile.certificates;
  }

  get(profileId:string){ return (this.certificates.get(profileId) ?? []).map(c => ({...c})); }
}
