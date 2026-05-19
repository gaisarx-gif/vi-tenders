/**
 * Normalizer utility for Vision Tenders
 * Handles status mapping and organization name unification
 */

export type TenderStatus = 'New Tender' | 'Postponed' | 'Re-announcement' | 'Advance Notice';

export const STATUS_TO_AR: Record<string, string> = {
  'New Tender': 'طرح جديد',
  Postponed: 'تأجيل',
  'Re-announcement': 'إعادة طرح',
  'Advance Notice': 'تنويه',
};

/**
 * يوحد حالة المناقصة بناءً على المدخلات العربية أو الإنجليزية
 */
export function normalizeStatus(raw: string): TenderStatus {
  const s = (raw || '').trim().toLowerCase();

  const mapping: Record<string, TenderStatus> = {
    // New Tender
    'طرح جديد': 'New Tender',
    'مناقصة جديدة': 'New Tender',
    'new tender': 'New Tender',
    new: 'New Tender',
    ممارسة: 'New Tender',
    طرح: 'New Tender',

    // Postponed
    تأجيل: 'Postponed',
    مؤجل: 'Postponed',
    postponed: 'Postponed',
    delayed: 'Postponed',
    delay: 'Postponed',

    // Re-announcement
    'إعادة طرح': 'Re-announcement',
    إعادة: 'Re-announcement',
    're-announcement': 'Re-announcement',
    reannouncement: 'Re-announcement',
    're-tender': 'Re-announcement',

    // Advance Notice
    تنويه: 'Advance Notice',
    تنبيه: 'Advance Notice',
    'advance notice': 'Advance Notice',
    advance: 'Advance Notice',
  };

  if (mapping[s]) return mapping[s];

  // Partial matches
  if (s.includes('تأجيل') || s.includes('postpone')) return 'Postponed';
  if (s.includes('إعادة') || s.includes('re-announc')) return 'Re-announcement';
  if (s.includes('تنويه') || s.includes('advance')) return 'Advance Notice';

  console.warn(`[Normalizer] Unknown status: "${raw}". Defaulting to "New Tender".`);
  return 'New Tender';
}

interface OrgInfo {
  canonicalAr: string;
  canonicalEn: string;
  aliases: string[];
}

/**
 * خريطة الجهات الحكومية الكويتية الموحدة
 */
export const KNOWN_ORG_MAP: OrgInfo[] = [
  {
    canonicalAr: 'وزارة الأشغال العامة',
    canonicalEn: 'Ministry of Public Works',
    aliases: ['الاشغال', 'وزاره الاشغال', 'وزارة الاشغال', 'MPW'],
  },
  {
    canonicalAr: 'وزارة الكهرباء والماء والطاقة المتجددة',
    canonicalEn: 'Ministry of Electricity, Water and Renewable Energy',
    aliases: ['الكهرباء والماء', 'وزارة الكهرباء', 'وزاره الكهرباء', 'MEW'],
  },
  {
    canonicalAr: 'وزارة الصحة',
    canonicalEn: 'Ministry of Health',
    aliases: ['الصحة', 'وزاره الصحه', 'وزارة الصحه', 'MOH'],
  },
  {
    canonicalAr: 'وزارة التربية',
    canonicalEn: 'Ministry of Education',
    aliases: ['التربية', 'وزاره التربيه', 'وزارة التربيه', 'MOE'],
  },
  {
    canonicalAr: 'بلدية الكويت',
    canonicalEn: 'Kuwait Municipality',
    aliases: ['البلدية', 'بلديه الكويت', 'بلدية الكويت'],
  },
  {
    canonicalAr: 'المؤسسة العامة للرعاية السكنية',
    canonicalEn: 'Public Authority for Housing Welfare',
    aliases: ['السكنية', 'الرعاية السكنية', 'PAHW'],
  },
  {
    canonicalAr: 'شركة نفط الكويت',
    canonicalEn: 'Kuwait Oil Company',
    aliases: ['نفط الكويت', 'KOC'],
  },
  {
    canonicalAr: 'مؤسسة البترول الكويتية',
    canonicalEn: 'Kuwait Petroleum Corporation',
    aliases: ['البترول', 'KPC'],
  },
  {
    canonicalAr: 'الهيئة العامة للطرق والنقل البري',
    canonicalEn: 'Public Authority for Roads and Land Transport',
    aliases: ['الطرق', 'هيئة الطرق', 'PART'],
  },
  {
    canonicalAr: 'الإدارة العامة للطيران المدني',
    canonicalEn: 'Directorate General of Civil Aviation',
    aliases: ['الطيران المدني', 'DGCA'],
  },
  {
    canonicalAr: 'وزارة الدفاع',
    canonicalEn: 'Ministry of Defense',
    aliases: ['الدفاع', 'MOD'],
  },
  {
    canonicalAr: 'وزارة الداخلية',
    canonicalEn: 'Ministry of Interior',
    aliases: ['الداخلية', 'MOI'],
  },
  {
    canonicalAr: 'جامعة الكويت',
    canonicalEn: 'Kuwait University',
    aliases: ['الجامعة', 'KU'],
  },
  {
    canonicalAr: 'الهيئة العامة للتعليم التطبيقي والتدريب',
    canonicalEn: 'Public Authority for Applied Education and Training',
    aliases: ['التطبيقي', 'PAAET'],
  },
  {
    canonicalAr: 'الهيئة العامة للاتصالات وتقنية المعلومات',
    canonicalEn: 'Communication and Information Technology Regulatory Authority',
    aliases: ['الاتصالات', 'هيئة الاتصالات', 'CITRA'],
  },
  {
    canonicalAr: 'وزارة المالية',
    canonicalEn: 'Ministry of Finance',
    aliases: ['المالية', 'MOF'],
  },
  {
    canonicalAr: 'وزارة العدل',
    canonicalEn: 'Ministry of Justice',
    aliases: ['العدل', 'MOJ'],
  },
  {
    canonicalAr: 'وزارة الأوقاف والشؤون الإسلامية',
    canonicalEn: 'Ministry of Awqaf and Islamic Affairs',
    aliases: ['الأوقاف', 'الاوقاف'],
  },
  {
    canonicalAr: 'الهيئة العامة لشؤون الزراعة والثروة السمكية',
    canonicalEn: 'Public Authority for Agriculture and Fish Resources',
    aliases: ['الزراعة', 'هيئة الزراعة', 'PAAF'],
  },
  {
    canonicalAr: 'الهيئة العامة للبيئة',
    canonicalEn: 'Environment Public Authority',
    aliases: ['البيئة', 'هيئة البيئة', 'EPA'],
  },
  {
    canonicalAr: 'الهيئة العامة للقوى العاملة',
    canonicalEn: 'Public Authority for Manpower',
    aliases: ['القوى العاملة', 'PAM'],
  },
  {
    canonicalAr: 'بنك الائتمان الكويتي',
    canonicalEn: 'Kuwait Credit Bank',
    aliases: ['بنك الائتمان', 'KCB'],
  },
  {
    canonicalAr: 'بيت الزكاة',
    canonicalEn: 'Zakat House',
    aliases: ['الزكاة'],
  },
  {
    canonicalAr: 'الهيئة العامة لمكافحة الفساد',
    canonicalEn: 'Kuwait Anti-Corruption Authority',
    aliases: ['نزاهة', 'Nazaha'],
  },
  {
    canonicalAr: 'قوة الإطفاء العام',
    canonicalEn: 'Kuwait Fire Force',
    aliases: ['الإطفاء', 'الاطفاء', 'KFF'],
  },
  {
    canonicalAr: 'الهيئة العامة للشباب',
    canonicalEn: 'Public Authority for Youth',
    aliases: ['الشباب', 'PAY'],
  },
  {
    canonicalAr: 'الهيئة العامة للرياضة',
    canonicalEn: 'Public Authority for Sport',
    aliases: ['الرياضة', 'PAS'],
  },
  {
    canonicalAr: 'وزارة الإعلام',
    canonicalEn: 'Ministry of Information',
    aliases: ['الإعلام', 'الاعلام'],
  },
  {
    canonicalAr: 'وزارة المواصلات',
    canonicalEn: 'Ministry of Communications',
    aliases: ['المواصلات', 'MOC'],
  },
  {
    canonicalAr: 'الأمانة العامة للمجلس الأعلى للتخطيط والتنمية',
    canonicalEn: 'General Secretariat of the Supreme Council for Planning and Development',
    aliases: ['التخطيط', 'GSSCPD'],
  },
];

/**
 * يصحح الأخطاء الإملائية ويوحد أسماء الجهات
 */
export function normalizeOrgName(
  nameAr: string,
  nameEn: string,
): { canonicalAr: string; canonicalEn: string } {
  const cleanAr = String(nameAr || '')
    .replace(/وزاره/g, 'وزارة')
    .replace(/بلديه/g, 'بلدية')
    .replace(/هيئه/g, 'هيئة')
    .replace(/العامه/g, 'العامة')
    .trim();

  const cleanEn = String(nameEn || '').trim();

  for (const org of KNOWN_ORG_MAP) {
    // Check Arabic canonical and aliases
    if (cleanAr === org.canonicalAr || org.aliases.some((a) => cleanAr.includes(a))) {
      return { canonicalAr: org.canonicalAr, canonicalEn: org.canonicalEn };
    }
    // Check English canonical and aliases
    if (
      cleanEn.toLowerCase() === org.canonicalEn.toLowerCase() ||
      org.aliases.some((a) => cleanEn.toLowerCase() === a.toLowerCase())
    ) {
      return { canonicalAr: org.canonicalAr, canonicalEn: org.canonicalEn };
    }
  }

  return { canonicalAr: cleanAr || 'جهة غير معروفة', canonicalEn: cleanEn || 'Unknown Entity' };
}
