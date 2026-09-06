import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { registerAcademicTools as registerAcademicToolsWithAuthorization } from '../src/providers/academic/apa7-mcp-tools.js';
import { audiovisualAudioCases } from '../src/providers/academic/apa7-audiovisual-audio-cases.js';
import { bookCases } from '../src/providers/academic/apa7-book-cases.js';
import { chapterEntryCases } from '../src/providers/academic/apa7-chapter-entry-cases.js';
import { dataSoftwareTestCases } from '../src/providers/academic/apa7-data-software-test-cases.js';
import { periodicalCases } from '../src/providers/academic/apa7-periodical-cases.js';
import { peruLegalCases } from '../src/providers/academic/apa7-peru-legal-cases.js';
import { reportConferenceThesisCases } from '../src/providers/academic/apa7-report-conference-thesis-cases.js';
import { reviewUnpublishedCases } from '../src/providers/academic/apa7-review-unpublished-cases.js';
import { visualSocialWebCases } from '../src/providers/academic/apa7-visual-social-web-cases.js';

function registerAcademicTools(server: any, options: { authorize: () => boolean | Promise<boolean> } = { authorize: () => true }) {
  return registerAcademicToolsWithAuthorization(server, options);
}

test('APA 7 case contracts guard optional metadata and every author cardinality', () => {
  const cases: any[] = Object.values({
    ...bookCases,
    ...chapterEntryCases,
    ...periodicalCases,
    ...reportConferenceThesisCases,
    ...reviewUnpublishedCases,
    ...dataSoftwareTestCases,
    ...audiovisualAudioCases,
    ...visualSocialWebCases,
    ...peruLegalCases,
  });

  for (const item of cases) {
    const metadata = item.requiredMetadata.join(' ');
    const contract = `${metadata} ${item.rules.join(' ')}`;
    if (/lista completa|incluye todos|conserva todos|todos los autores|todos los ponentes/i.test(contract)
      && /tres o más/.test(item.parentheticalCitation)) {
      assert.match(item.referenceTemplate, /de 3 a 20:/i, item.id);
      assert.match(item.referenceTemplate, /21 o más:.*1–19.*Último/i, item.id);
    }

    if (/si existe|si existen|si corresponde|si aplica|si se conoce|si difiere|solo si/i.test(metadata)) {
      const optionalGuard = `${item.referenceTemplate} ${item.rules.join(' ')}`;
      assert.match(optionalGuard, /solo si|si no |cuando |omite|omít|sin |únicamente|de lo contrario/i, item.id);
    }

    if ((item.optionalMetadata ?? []).some((field: string) => /URL oficial/i.test(field))) {
      assert.match(item.referenceTemplate, /URL oficial, solo si existe/i, item.id);
    }
  }
});

test('APA 7 quick reference never leaves a book URL or DOI as an unconditional placeholder', async () => {
  const quickReference = await readFile('.agents/skills/apa7-campus/references/apa7-quick-reference.md', 'utf8');
  assert.match(quickReference, /Con DOI o URL pública:/);
  assert.match(quickReference, /impreso o en base académica común sin localizador:/);
  assert.match(quickReference, /Artículo científico \| Con DOI:.*sin DOI con URL pública:.*impreso o base académica común sin localizador:/);
});

test('APA 7 guidance exposes a journal template when the host authorizes access', async () => {
  const tools = new Map<string, any>();
  const server = {
    registerTool(name: string, config: unknown, handler: unknown) {
      tools.set(name, { config, handler });
    },
  };

  registerAcademicTools(server as any);

  const tool = tools.get('campus_apa7_guidance');
  assert.ok(tool);
  assert.equal(tool.config.annotations.readOnlyHint, true);
  const result = await tool.handler({ topic: 'reference', sourceType: 'journal-article' });
  const content = JSON.parse(result.content[0].text);
  assert.match(content.template, /https:\/\/doi.org/);
  assert.match(content.template, /si existe DOI/);
  assert.match(content.template, /omite DOI y URL/);
  assert.match(content.template, /\*Revista, volumen\*\(número\)/);
  assert.match(content.templateNotation, /cursiva/);
  assert.match(content.safety, /No inventes/);
});

test('reference templates preserve APA italics with explicit Markdown notation', async () => {
  let handler: any;
  registerAcademicTools({
    registerTool(_name: string, _config: unknown, registeredHandler: unknown) {
      handler = registeredHandler;
    },
  } as any);

  for (const sourceType of [
    'book', 'book-chapter', 'journal-article', 'webpage', 'report', 'thesis',
    'newspaper-article', 'video-webinar', 'podcast', 'social-media', 'software',
  ]) {
    const result = await handler({ topic: 'reference', sourceType });
    const content = JSON.parse(result.content[0].text);
    assert.match(content.template, /\*[^*]+\*/, `missing italics for ${sourceType}`);
  }

  const report = JSON.parse((await handler({ topic: 'reference', sourceType: 'report' })).content[0].text);
  assert.match(report.template, /N.º de informe xxx, solo si existe/);
  assert.match(report.template, /omite por completo ese paréntesis/);
  assert.match(report.template, /solo si difiere del autor/);
  const webpage = JSON.parse((await handler({ topic: 'reference', sourceType: 'webpage' })).content[0].text);
  assert.match(webpage.template, /\(Año\), \(Año, mes\), \(Año, día de mes\) o \(s\. f\.\)/);
  assert.match(webpage.template, /No inventes mes ni día/);
  assert.match(webpage.template, /sitio, solo si difiere del autor/);
  const software = JSON.parse((await handler({ topic: 'reference', sourceType: 'software' })).content[0].text);
  const book = JSON.parse((await handler({ topic: 'reference', sourceType: 'book' })).content[0].text);
  const chapter = JSON.parse((await handler({ topic: 'reference', sourceType: 'book-chapter' })).content[0].text);
  assert.match(chapter.template, /E\. Editor & F\. Editor \(Eds\.\)/);
  assert.doesNotMatch(chapter.template, /E\. Editor, & F\. Editor/);
  const thesis = JSON.parse((await handler({ topic: 'reference', sourceType: 'thesis' })).content[0].text);
  const podcast = JSON.parse((await handler({ topic: 'reference', sourceType: 'podcast' })).content[0].text);
  const social = JSON.parse((await handler({ topic: 'reference', sourceType: 'social-media' })).content[0].text);
  assert.match(podcast.template, /Serie completa:.*Año inicial–Año final/);
  assert.match(podcast.template, /Episodio:.*N.º de episodio, solo si existe/);
  assert.match(social.template, /Publicación individual:.*Perfil, página o historia destacada que cambia:/);
  assert.match(social.template, /Recuperado el día de mes de año/);
  assert.match(software.template, /tienda, solo si difiere del autor/);
  assert.match(book.template, /omite DOI y URL/);
  assert.match(chapter.template, /DOI si existe.*URL pública.*omite DOI y URL/);
  assert.match(chapter.template, /G\. Editor \(Eds\.\)/);
  assert.match(thesis.template, /Inédita:.*En base de datos:.*En repositorio:/);
  assert.match(thesis.template, /N.º de publicación, solo si existe/);
});

test('APA 7 catalogues only advertise selectors accepted by their topic', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);

  const format = JSON.parse((await handler({ topic: 'format' })).content[0].text);
  assert.ok(format.availableFormatRules.length > 0);
  assert.equal(format.availableVerifiedCases, undefined);
  assert.equal(format.availableCitationRules, undefined);

  const citation = JSON.parse((await handler({ topic: 'citation' })).content[0].text);
  assert.ok(citation.availableCitationRules.length > 0);
  assert.ok(citation.availableVerifiedCases.length > 0);
  assert.ok(citation.availablePeruLegalCases.length > 0);
  assert.equal(citation.availableReferenceRules, undefined);

  const selected = JSON.parse((await handler({ topic: 'format', formatRuleId: 'paper-title' })).content[0].text);
  assert.equal(Object.keys(selected).some(key => key.startsWith('available')), false);
});

test('every verified case describes how to recover required reference italics', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'reference' })).content[0].text);

  for (const caseId of catalogue.availableVerifiedCases) {
    const result = JSON.parse((await handler({ topic: 'reference', caseId })).content[0].text);
    assert.match(result.case.referenceFormatting.encoding, /texto plano/);
    assert.ok(result.case.referenceFormatting.italicize.length > 0, `missing italics metadata for ${caseId}`);
  }
});

test('APA 7 case formatting distinguishes blog and untitled visual works', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);

  const blog = JSON.parse((await handler({ topic: 'reference', caseId: 'blog-post' })).content[0].text).case.referenceFormatting;
  assert.match(blog.italicize.join(' '), /título de la entrada/);
  assert.match(blog.doNotItalicize.join(' '), /nombre del blog/);
  const websiteReview = JSON.parse((await handler({ topic: 'reference', caseId: 'review-tv-episode-on-website' })).content[0].text).case.referenceFormatting;
  assert.match(websiteReview.italicize.join(' '), /título de la reseña/);
  assert.match(websiteReview.doNotItalicize.join(' '), /título del episodio/);

  for (const caseId of ['artwork-museum-or-museum-site', 'clip-art-or-stock-image', 'map', 'photograph', 'slides-or-lecture-notes']) {
    const formatting = JSON.parse((await handler({ topic: 'reference', caseId })).content[0].text).case.referenceFormatting;
    assert.match(formatting.italicize.join(' '), /título real/);
    assert.match(formatting.doNotItalicize.join(' '), /descripción entre corchetes/, caseId);
  }
});

test('APA 7 guidance keeps unresolved placeholders out of final references', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const missing = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'periodical-missing-information' })).content[0].text);
  assert.match(missing.safety, /solo en plantillas provisionales/);
  assert.match(missing.safety, /nunca los dejes en una referencia final/);
  assert.match(missing.safety, /omisión o sustitución indicada por el caso/);
});

test('citation sourceType specializes personal communications without pretending media changes author-date rules', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);

  const personal = JSON.parse((await handler({ topic: 'citation', sourceType: 'personal-communication' })).content[0].text);
  assert.equal(personal.citationRule.id, 'personal-communication');
  assert.match(personal.citationRule.rules.join(' '), /fecha tan exacta/);

  const journal = JSON.parse((await handler({ topic: 'citation', sourceType: 'journal-article' })).content[0].text);
  assert.match(journal.sourceTypeNote, /no cambia por sí solo la cita autor-fecha/);
});

test('Peruvian legal profiles are honored from citation and reference topics', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);

  for (const topic of ['citation', 'reference']) {
    const result = JSON.parse((await handler({
      topic,
      peruLegalCaseId: 'peru-law-or-legislative-decree',
    })).content[0].text);
    assert.equal(result.legalCase.id, 'peru-law-or-legislative-decree');
    assert.match(result.legalCase.referenceTemplate, /Diario Oficial El Peruano/);
  }
});

test('APA 7 guidance reports entitlement denial without sending users through login again', async () => {
  let handler: any;
  registerAcademicTools({
    registerTool(_name: string, _config: unknown, registeredHandler: unknown) {
      handler = registeredHandler;
    },
  } as any, { authorize: async () => false });

  await assert.rejects(
    () => handler({ topic: 'citation' }),
    /required entitlement.*Signing in again does not grant access/,
  );
});

test('APA 7 guidance fails closed when an untyped host omits authorization', async () => {
  let handler: any;
  (registerAcademicToolsWithAuthorization as any)({
    registerTool(_name: string, _config: unknown, registeredHandler: unknown) {
      handler = registeredHandler;
    },
  });

  await assert.rejects(() => handler({ topic: 'citation' }), /host has not configured authorization/);
});

test('personal communication guidance requests the caller\'s exact date', async () => {
  let handler: any;
  registerAcademicTools({
    registerTool(_name: string, _config: unknown, registeredHandler: unknown) {
      handler = registeredHandler;
    },
  } as any);

  const result = await handler({ topic: 'reference', sourceType: 'personal-communication' });
  const content = JSON.parse(result.content[0].text);
  assert.match(content.template, /\[fecha exacta\]/);
  assert.doesNotMatch(content.template, /2026/);
});

test('APA 7 guidance rejects selectors from another topic and conflicting selectors', async () => {
  let handler: any;
  registerAcademicTools({
    registerTool(_name: string, _config: unknown, registeredHandler: unknown) {
      handler = registeredHandler;
    },
  } as any);

  await assert.rejects(
    () => handler({ topic: 'format', citationRuleId: 'short-quote' }),
    /Selectors incompatible with topic "format": citationRuleId/,
  );
  await assert.rejects(
    () => handler({ topic: 'citation', caseId: 'journal-article', citationRuleId: 'short-quote' }),
    /Choose only one selector for topic "citation"/,
  );
});

test('APA 7 guidance returns usable content for every supported topic and source type', async () => {
  let handler: any;
  registerAcademicTools({
    registerTool(_name: string, _config: unknown, registeredHandler: unknown) {
      handler = registeredHandler;
    },
  } as any);

  for (const topic of ['principles-ethics', 'citation', 'reference', 'format', 'reporting', 'writing-style', 'bias-free-language', 'mechanics', 'table-figure', 'legal', 'publication', 'review', 'course-requirements']) {
    const result = await handler({ topic });
    const content = JSON.parse(result.content[0].text);
    assert.match(content.authority, /Biblioteca UPC/);
  }

  for (const sourceType of [
    'book', 'book-chapter', 'journal-article', 'webpage', 'report', 'thesis',
    'newspaper-article', 'video-webinar', 'podcast', 'social-media', 'software',
    'personal-communication', 'other',
  ]) {
    const result = await handler({ topic: 'reference', sourceType });
    const content = JSON.parse(result.content[0].text);
    assert.ok(content.template, `missing template for ${sourceType}`);
  }
});

test('APA 7 generic fallback never requires an invented locator', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const fallback = JSON.parse((await handler({ topic: 'reference', sourceType: 'other' })).content[0].text);
  assert.match(fallback.template, /Clasifica primero el tipo real de obra/);
  assert.match(fallback.template, /omite el localizador/);
});

test('APA 7 guidance covers every JARS reporting section 3.1 through 3.18', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'reporting' })).content[0].text);
  assert.equal(catalogue.availableReportingRules.length, 18);
  assert.match(catalogue.warning, /no prueban/i);
  const rules = await Promise.all(catalogue.availableReportingRules.map(async (reportingRuleId: string) =>
    JSON.parse((await handler({ topic: 'reporting', reportingRuleId })).content[0].text).reportingRule,
  ));
  assert.deepEqual(rules.map(rule => rule.manualSection), Array.from({ length: 18 }, (_, index) => `3.${index + 1}`));
  for (const rule of rules) {
    assert.equal(rule.status, 'verified');
    assert.ok(rule.appliesTo.length > 0);
    assert.ok(rule.rules.length > 0);
    assert.ok(rule.citationTreatment.length > 0);
    assert.ok(rule.referenceTreatment.length > 0);
    assert.ok(rule.refuseWhen.length >= 3);
  }
});

test('JARS guidance separates study reporting, citations and references without inventing evidence', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const method = JSON.parse((await handler({ topic: 'reporting', reportingRuleId: 'quantitative-method' })).content[0].text).reportingRule;
  const qualitative = JSON.parse((await handler({ topic: 'reporting', reportingRuleId: 'qualitative-findings' })).content[0].text).reportingRule;
  const mixed = JSON.parse((await handler({ topic: 'reporting', reportingRuleId: 'mixed-methods-reporting' })).content[0].text).reportingRule;
  assert.match(method.rules.join(' '), /tamaño muestral/);
  assert.match(method.citationTreatment.join(' '), /medida/);
  assert.match(method.referenceTreatment.join(' '), /software/);
  assert.match(method.refuseWhen.join(' '), /inventar una muestra/);
  assert.match(qualitative.citationTreatment.join(' '), /participantes/);
  assert.match(qualitative.referenceTreatment.join(' '), /entrevistas confidenciales.*no se listan/);
  assert.match(mixed.rules.join(' '), /valor añade integrarlos/);
  assert.match(mixed.rules.join(' '), /no existe integración metodológica/);
});

test('APA 7 guidance covers every Spanish writing-style section 4.1 through 4.28', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'writing-style' })).content[0].text);
  assert.equal(catalogue.availableWritingStyleRules.length, 28);
  const rules = await Promise.all(catalogue.availableWritingStyleRules.map(async (writingStyleRuleId: string) =>
    JSON.parse((await handler({ topic: 'writing-style', writingStyleRuleId })).content[0].text).writingStyleRule,
  ));
  assert.deepEqual(rules.map(rule => rule.manualSection), Array.from({ length: 28 }, (_, index) => `4.${index + 1}`));
  for (const rule of rules) {
    assert.equal(rule.status, 'verified');
    assert.ok(rule.rules.length > 0);
    assert.ok(rule.citationTreatment.length > 0);
    assert.ok(rule.referenceTreatment.length > 0);
    assert.ok(rule.refuseWhen.length >= 3);
  }
});

test('Spanish writing guidance preserves attribution, identity and institutional integrity rules', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const gender = JSON.parse((await handler({ topic: 'writing-style', writingStyleRuleId: 'gender-pronouns' })).content[0].text).writingStyleRule;
  const passive = JSON.parse((await handler({ topic: 'writing-style', writingStyleRuleId: 'active-passive-voice' })).content[0].text).writingStyleRule;
  const editors = JSON.parse((await handler({ topic: 'writing-style', writingStyleRuleId: 'copyeditors-writing-centers' })).content[0].text).writingStyleRule;
  assert.match(gender.rules.join(' '), /No inventes género/);
  assert.match(passive.rules.join(' '), /permite ambas voces/);
  assert.match(editors.rules.join(' '), /integridad académica/);
  assert.match(editors.refuseWhen.join(' '), /trabajo intelectual/);
});

test('APA 7 guidance covers every bias-free-language section 5.1 through 5.10', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'bias-free-language' })).content[0].text);
  assert.equal(catalogue.availableBiasFreeLanguageRules.length, 10);
  const rules = await Promise.all(catalogue.availableBiasFreeLanguageRules.map(async (biasFreeLanguageRuleId: string) =>
    JSON.parse((await handler({ topic: 'bias-free-language', biasFreeLanguageRuleId })).content[0].text).biasFreeLanguageRule,
  ));
  assert.deepEqual(rules.map(rule => rule.manualSection), Array.from({ length: 10 }, (_, index) => `5.${index + 1}`));
  for (const rule of rules) {
    assert.equal(rule.status, 'verified');
    assert.ok(rule.rules.length > 0);
    assert.ok(rule.citationTreatment.length > 0);
    assert.ok(rule.referenceTreatment.length > 0);
    assert.ok(rule.refuseWhen.length >= 3);
  }
});

test('Bias-free-language guidance never infers identity or turns participants into references', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const gender = JSON.parse((await handler({ topic: 'bias-free-language', biasFreeLanguageRuleId: 'gender' })).content[0].text).biasFreeLanguageRule;
  const race = JSON.parse((await handler({ topic: 'bias-free-language', biasFreeLanguageRuleId: 'racial-ethnic-identity' })).content[0].text).biasFreeLanguageRule;
  const participants = JSON.parse((await handler({ topic: 'bias-free-language', biasFreeLanguageRuleId: 'research-participation' })).content[0].text).biasFreeLanguageRule;
  assert.match(gender.rules.join(' '), /no los uses como sinónimos/i);
  assert.match(gender.refuseWhen.join(' '), /asignarlos/);
  assert.match(race.refuseWhen.join(' '), /apellido, fotografía, idioma o nacionalidad/);
  assert.match(participants.referenceTreatment.join(' '), /No incluyas participantes confidenciales/);
  assert.match(participants.citationTreatment.join(' '), /no reciben citas autor-fecha/);
});

test('APA 7 guidance covers every mechanics section 6.1 through 6.52', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'mechanics' })).content[0].text);
  assert.equal(catalogue.availableMechanicsRules.length, 52);
  const rules = await Promise.all(catalogue.availableMechanicsRules.map(async (mechanicsRuleId: string) =>
    JSON.parse((await handler({ topic: 'mechanics', mechanicsRuleId })).content[0].text).mechanicsRule,
  ));
  assert.deepEqual(rules.map(rule => rule.manualSection), Array.from({ length: 52 }, (_, index) => `6.${index + 1}`));
  for (const rule of rules) {
    assert.equal(rule.status, 'verified');
    assert.ok(rule.rules.length > 0);
    assert.ok(rule.citationTreatment.length > 0);
    assert.ok(rule.referenceTreatment.length > 0);
    assert.ok(rule.refuseWhen.length >= 3);
  }
});

test('Mechanics guidance preserves quotation, DOI, statistical and list semantics', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const period = JSON.parse((await handler({ topic: 'mechanics', mechanicsRuleId: 'period' })).content[0].text).mechanicsRule;
  const quotes = JSON.parse((await handler({ topic: 'mechanics', mechanicsRuleId: 'quotation-marks' })).content[0].text).mechanicsRule;
  const decimals = JSON.parse((await handler({ topic: 'mechanics', mechanicsRuleId: 'decimal-fractions' })).content[0].text).mechanicsRule;
  const lists = JSON.parse((await handler({ topic: 'mechanics', mechanicsRuleId: 'list-guidelines' })).content[0].text).mechanicsRule;
  const italics = JSON.parse((await handler({ topic: 'mechanics', mechanicsRuleId: 'italics' })).content[0].text).mechanicsRule;
  assert.match(period.referenceTreatment.join(' '), /no añadas punto después de DOI o URL/i);
  assert.match(quotes.citationTreatment.join(' '), /Menos de 40 palabras/);
  assert.match(decimals.rules.join(' '), /no pueden superar 1/);
  assert.match(lists.citationTreatment.join(' '), /respalda solo ese elemento/);
  assert.match(italics.rules.join(' '), /coma después del título de una publicación periódica/);
});

test('APA 7 guidance covers every publication-process section 12.1 through 12.24', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'publication' })).content[0].text);
  assert.equal(catalogue.availablePublicationRules.length, 24);
  assert.match(catalogue.warning, /obligaciones distintas/);
  const rules = await Promise.all(catalogue.availablePublicationRules.map(async (publicationRuleId: string) =>
    JSON.parse((await handler({ topic: 'publication', publicationRuleId })).content[0].text).publicationRule,
  ));
  assert.deepEqual(rules.map(rule => rule.manualSection), Array.from({ length: 24 }, (_, index) => `12.${index + 1}`));
  for (const rule of rules) {
    assert.equal(rule.status, 'verified');
    assert.ok(rule.rules.length > 0);
    assert.ok(rule.citationTreatment.length > 0);
    assert.ok(rule.referenceTreatment.length > 0);
    assert.ok(rule.permissionTreatment.length > 0);
    assert.ok(rule.refuseWhen.length >= 3);
  }
});

test('Publication guidance separates citation, attribution, permission and legal jurisdiction', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const adaptation = JSON.parse((await handler({ topic: 'publication', publicationRuleId: 'reprint-adaptation-guidelines' })).content[0].text).publicationRule;
  const fairUse = JSON.parse((await handler({ topic: 'publication', publicationRuleId: 'permission-fair-use' })).content[0].text).publicationRule;
  const correction = JSON.parse((await handler({ topic: 'publication', publicationRuleId: 'correction-notice' })).content[0].text).publicationRule;
  assert.match(adaptation.rules.join(' '), /obligaciones distintas/);
  assert.match(adaptation.permissionTreatment.join(' '), /Citar no concede permiso/);
  assert.match(fairUse.rules.join(' '), /derecho estadounidense/);
  assert.match(fairUse.permissionTreatment.join(' '), /Para Perú/);
  assert.match(correction.referenceTreatment.join(' '), /propia entrada/);
});

test('APA 7 guidance covers every principles-and-ethics section 1.1 through 1.25', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'principles-ethics' })).content[0].text);
  assert.equal(catalogue.availablePrinciplesEthicsRules.length, 25);
  const rules = await Promise.all(catalogue.availablePrinciplesEthicsRules.map(async (principlesEthicsRuleId: string) =>
    JSON.parse((await handler({ topic: 'principles-ethics', principlesEthicsRuleId })).content[0].text).principlesEthicsRule,
  ));
  assert.deepEqual(rules.map(rule => rule.manualSection), Array.from({ length: 25 }, (_, index) => `1.${index + 1}`));
  for (const rule of rules) {
    assert.equal(rule.status, 'verified');
    assert.ok(rule.rules.length > 0);
    assert.ok(rule.citationTreatment.length > 0);
    assert.ok(rule.referenceTreatment.length > 0);
    assert.ok(rule.refuseWhen.length >= 3);
  }
});

test('Ethics guidance distinguishes plagiarism, data reuse, authorship and confidentiality', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const plagiarism = JSON.parse((await handler({ topic: 'principles-ethics', principlesEthicsRuleId: 'plagiarism-self-plagiarism' })).content[0].text).principlesEthicsRule;
  const duplicate = JSON.parse((await handler({ topic: 'principles-ethics', principlesEthicsRuleId: 'duplicate-piecemeal-publication' })).content[0].text).principlesEthicsRule;
  const authors = JSON.parse((await handler({ topic: 'principles-ethics', principlesEthicsRuleId: 'publication-credit' })).content[0].text).principlesEthicsRule;
  const confidential = JSON.parse((await handler({ topic: 'principles-ethics', principlesEthicsRuleId: 'confidentiality-protection' })).content[0].text).principlesEthicsRule;
  assert.match(plagiarism.rules.join(' '), /aunque exista referencia/);
  assert.match(plagiarism.refuseWhen.join(' '), /evadir detección/);
  assert.match(duplicate.citationTreatment.join(' '), /mismos datos/);
  assert.match(authors.rules.join(' '), /autoría honoraria/);
  assert.match(confidential.refuseWhen.join(' '), /reidentificación/);
});

test('APA 7 guidance covers every legal-reference section 11.1 through 11.12', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'legal' })).content[0].text);
  assert.equal(catalogue.availableLegalRules.length, 12);
  const rules = await Promise.all(catalogue.availableLegalRules.map(async (legalRuleId: string) =>
    JSON.parse((await handler({ topic: 'legal', legalRuleId })).content[0].text).legalRule,
  ));
  assert.deepEqual(rules.map(rule => rule.manualSection), Array.from({ length: 12 }, (_, index) => `11.${index + 1}`));
  for (const rule of rules) {
    assert.equal(rule.status, 'verified');
    assert.ok(rule.citationTreatment.length > 0);
    assert.ok(rule.referenceTreatment.length > 0);
    assert.ok(rule.peruApplicability.length > 0);
    assert.ok(rule.refuseWhen.length >= 3);
  }
  assert.match(rules.find(rule => rule.id === 'legal-versus-apa').rules.join(' '), /citaciones paralelas/);
  assert.match(rules.find(rule => rule.id === 'legal-in-text-citation').rules.join(' '), /título y año/);
  assert.match(rules.find(rule => rule.id === 'mexico-examples').peruApplicability.join(' '), /No aplicable por analogía/);
});

test('Campus exposes citation and reference handling for every Peruvian legal case', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'legal' })).content[0].text);
  assert.equal(catalogue.availablePeruLegalCases.length, 10);
  for (const peruLegalCaseId of catalogue.availablePeruLegalCases) {
    const item = JSON.parse((await handler({ topic: 'legal', peruLegalCaseId })).content[0].text).legalCase;
    assert.equal(item.status, 'verified-source-adaptation');
    assert.ok(item.requiredMetadata.length > 0);
    assert.ok(item.referenceTemplate.length > 0);
    assert.ok(item.parentheticalCitation.length > 0);
    assert.ok(item.narrativeCitation.length > 0);
    assert.ok(item.directQuoteLocator.length > 0);
    assert.ok(item.officialVerification.length > 0);
    assert.ok(item.refuseWhen.length >= 3);
  }
});

test('Peruvian legal profiles reject common hallucinations and preserve official identifiers', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const law = JSON.parse((await handler({ topic: 'legal', peruLegalCaseId: 'peru-law-or-legislative-decree' })).content[0].text).legalCase;
  const tc = JSON.parse((await handler({ topic: 'legal', peruLegalCaseId: 'peru-constitutional-court-decision' })).content[0].text).legalCase;
  const patent = JSON.parse((await handler({ topic: 'legal', peruLegalCaseId: 'peru-patent' })).content[0].text).legalCase;
  const treaty = JSON.parse((await handler({ topic: 'legal', peruLegalCaseId: 'peru-treaty' })).content[0].text).legalCase;
  assert.match(law.referenceTemplate, /Diario Oficial El Peruano/);
  assert.match(law.rules.join(' '), /texto único ordenado/);
  assert.match(law.parentheticalCitation, /para la norma completa/);
  assert.match(law.parentheticalCitation, /disposición específica verificada/);
  assert.match(tc.parentheticalCitation, /fundamento X/);
  assert.match(tc.parentheticalCitation, /para la decisión completa/);
  assert.match(tc.rules.join(' '), /Distingue sentencia, auto y resolución/);
  assert.match(patent.rules.join(' '), /año de concesión, no de solicitud/);
  assert.match(patent.parentheticalCitation, /Inventor & Inventor/);
  assert.match(patent.parentheticalCitation, /tres o más inventores/);
  assert.match(patent.referenceTemplate, /Inventor, C\. C\./);
  assert.match(patent.rules.join(' '), /lista completa y ordenada de inventores/);
  assert.match(treaty.rules.join(' '), /firma, aprobación, ratificación y entrada en vigor/);
});

test('APA 7 guidance exposes verified common table and figure rules', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'table-figure' })).content[0].text);
  assert.equal(catalogue.availableTableFigureRules.length, 36);
  for (const tableFigureRuleId of catalogue.availableTableFigureRules) {
    const rule = JSON.parse((await handler({ topic: 'table-figure', tableFigureRuleId })).content[0].text).tableFigureRule;
    assert.equal(rule.status, 'verified');
    assert.match(rule.manualSection, /^7\./);
    assert.ok(rule.rules.length > 0);
    assert.ok(rule.citationTreatment.length > 0);
    assert.ok(rule.referenceTreatment.length > 0);
    assert.ok(rule.permissionTreatment.length > 0);
    assert.ok(rule.refuseWhen.length >= 3);
  }
});

test('APA 7 guidance covers table construction through section 7.21', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'table-figure' })).content[0].text);
  assert.equal(catalogue.availableTableFigureRules.length, 36);
  const components = JSON.parse((await handler({ topic: 'table-figure', tableFigureRuleId: 'table-components' })).content[0].text).tableFigureRule;
  const body = JSON.parse((await handler({ topic: 'table-figure', tableFigureRuleId: 'table-body' })).content[0].text).tableFigureRule;
  const notes = JSON.parse((await handler({ topic: 'table-figure', tableFigureRuleId: 'table-notes' })).content[0].text).tableFigureRule;
  assert.match(components.rules.join(' '), /número, título, encabezados, cuerpo y notas/);
  assert.match(body.citationTreatment.join(' '), /celdas siguen APA/);
  assert.match(notes.rules.join(' '), /nota general, notas específicas y nota de probabilidad/);
  assert.match(notes.permissionTreatment.join(' '), /no sustituye el permiso/);
  const confidence = JSON.parse((await handler({ topic: 'table-figure', tableFigureRuleId: 'table-confidence-intervals' })).content[0].text).tableFigureRule;
  const borders = JSON.parse((await handler({ topic: 'table-figure', tableFigureRuleId: 'table-borders-shading' })).content[0].text).tableFigureRule;
  const longWide = JSON.parse((await handler({ topic: 'table-figure', tableFigureRuleId: 'long-wide-tables' })).content[0].text).tableFigureRule;
  const relationships = JSON.parse((await handler({ topic: 'table-figure', tableFigureRuleId: 'table-relationships' })).content[0].text).tableFigureRule;
  const checklist = JSON.parse((await handler({ topic: 'table-figure', tableFigureRuleId: 'table-checklist' })).content[0].text).tableFigureRule;
  const samples = JSON.parse((await handler({ topic: 'table-figure', tableFigureRuleId: 'sample-tables' })).content[0].text).tableFigureRule;
  assert.match(confidence.rules.join(' '), /95% o 99%/);
  assert.match(borders.rules.join(' '), /No uses líneas verticales/);
  assert.match(longWide.rules.join(' '), /repite la fila de encabezados/);
  assert.match(relationships.rules.join(' '), /no uses Tabla 1A y Tabla 1B/);
  assert.match(checklist.rules.join(' '), /p < \.001/);
  assert.match(samples.rules.join(' '), /datos cualitativos y métodos mixtos/);
});

test('APA 7 guidance covers every figure section 7.22 through 7.36', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'table-figure' })).content[0].text);
  const sections = await Promise.all(catalogue.availableTableFigureRules.slice(21).map(async (tableFigureRuleId: string) =>
    JSON.parse((await handler({ topic: 'table-figure', tableFigureRuleId })).content[0].text).tableFigureRule,
  ));
  assert.deepEqual(sections.map(rule => rule.manualSection), Array.from({ length: 15 }, (_, index) => `7.${index + 22}`));
  const image = sections.find(rule => rule.id === 'figure-image');
  const photo = sections.find(rule => rule.id === 'photographs');
  const radiological = sections.find(rule => rule.id === 'radiological-data');
  const checklist = sections.find(rule => rule.id === 'figure-checklist');
  assert.match(image.rules.join(' '), /No dependas solo del color/);
  assert.match(image.rules.join(' '), /8 y 14 puntos/);
  assert.match(photo.permissionTreatment.join(' '), /consentimiento.*derechos de autor/);
  assert.match(radiological.rules.join(' '), /espacio de coordenadas/);
  assert.match(checklist.permissionTreatment.join(' '), /atribución.*permiso o consentimiento/);
});

test('APA 7 separates visual attribution, bibliography and copyright permission', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const rule = JSON.parse((await handler({ topic: 'table-figure', tableFigureRuleId: 'reprinted-adapted-table-figure' })).content[0].text).tableFigureRule;
  assert.match(rule.rules.join(' '), /nota de la tabla o figura/);
  assert.match(rule.referenceTreatment.join(' '), /entrada completa/);
  assert.match(rule.permissionTreatment.join(' '), /no equivale a obtener autorización/);
  assert.match(rule.refuseWhen.join(' '), /imagen en internet/);
});

test('APA 7 guidance distinguishes professional and student paper requirements', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'format' })).content[0].text);
  assert.equal(catalogue.availableFormatRules.length, 28);
  const professional = JSON.parse((await handler({ topic: 'format', formatRuleId: 'professional-paper-required-elements' })).content[0].text).formatRule;
  const student = JSON.parse((await handler({ topic: 'format', formatRuleId: 'student-paper-required-elements' })).content[0].text).formatRule;
  const titlePage = JSON.parse((await handler({ topic: 'format', formatRuleId: 'title-page' })).content[0].text).formatRule;
  assert.equal(professional.status, 'verified');
  assert.match(professional.rules.join(' '), /título abreviado/);
  assert.match(student.rules.join(' '), /No suele incluir título abreviado/);
  assert.match(student.rules.join(' '), /docente o la institución/);
  assert.match(titlePage.rules.join(' '), /número y nombre del curso/);
});

test('APA 7 guidance covers every manuscript-format section 2.1 through 2.28', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'format' })).content[0].text);
  assert.equal(catalogue.availableFormatRules.length, 28);
  for (const formatRuleId of catalogue.availableFormatRules) {
    const rule = JSON.parse((await handler({ topic: 'format', formatRuleId })).content[0].text).formatRule;
    assert.equal(rule.status, 'verified');
    assert.match(rule.manualSection, /^2\./);
    assert.ok(rule.rules.length > 0, `missing rules for ${formatRuleId}`);
    assert.ok(rule.citationReferenceImpact.length > 0, `missing citation/reference impact for ${formatRuleId}`);
    assert.ok(rule.refuseWhen.length >= 3, `missing refusal guards for ${formatRuleId}`);
  }
  const running = JSON.parse((await handler({ topic: 'format', formatRuleId: 'running-head' })).content[0].text).formatRule;
  const notes = JSON.parse((await handler({ topic: 'format', formatRuleId: 'footnotes' })).content[0].text).formatRule;
  const appendix = JSON.parse((await handler({ topic: 'format', formatRuleId: 'appendices' })).content[0].text).formatRule;
  assert.match(running.rules.join(' '), /máximo de 50 caracteres/);
  assert.match(notes.citationReferenceImpact.join(' '), /no sustituye la cita autor-fecha/);
  assert.match(appendix.rules.join(' '), /Tabla D1/);
});

test('APA 7 physical-format rules preserve allowed variants and exact heading levels', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const typography = JSON.parse((await handler({ topic: 'format', formatRuleId: 'typography' })).content[0].text).formatRule;
  const spacing = JSON.parse((await handler({ topic: 'format', formatRuleId: 'line-spacing' })).content[0].text).formatRule;
  const margins = JSON.parse((await handler({ topic: 'format', formatRuleId: 'margins' })).content[0].text).formatRule;
  const headings = JSON.parse((await handler({ topic: 'format', formatRuleId: 'heading-levels' })).content[0].text).formatRule;
  assert.match(typography.rules.join(' '), /Calibri 11/);
  assert.match(typography.refuseWhen.join(' '), /No es correcto afirmar.*única/);
  assert.match(spacing.rules.join(' '), /tabla.*espacio sencillo, 1\.5 o doble/);
  assert.match(margins.rules.join(' '), /2\.54 cm/);
  assert.match(headings.rules.join(' '), /Nivel 5/);
  assert.match(headings.rules.join(' '), /sin saltar niveles/);
});

test('APA 7 title, byline and affiliation rules reject invented identity details', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  for (const formatRuleId of ['paper-title', 'author-byline', 'author-affiliation']) {
    const rule = JSON.parse((await handler({ topic: 'format', formatRuleId })).content[0].text).formatRule;
    assert.match(rule.manualSection, /^2\./);
    assert.ok(rule.rules.length > 0);
    assert.ok(rule.citationReferenceImpact.length > 0);
    assert.ok(rule.refuseWhen.length >= 3);
  }
  const byline = JSON.parse((await handler({ topic: 'format', formatRuleId: 'author-byline' })).content[0].text).formatRule;
  const affiliation = JSON.parse((await handler({ topic: 'format', formatRuleId: 'author-affiliation' })).content[0].text).formatRule;
  assert.match(byline.rules.join(' '), /Omite títulos profesionales/);
  assert.match(affiliation.rules.join(' '), /no incluyas más de dos/);
});

test('APA 7 guidance exposes every verified case with citations and refusal guards', async () => {
  let handler: any;
  registerAcademicTools({
    registerTool(_name: string, _config: unknown, registeredHandler: unknown) {
      handler = registeredHandler;
    },
  } as any);

  const catalogue = JSON.parse((await handler({ topic: 'reference' })).content[0].text);
  assert.equal(catalogue.availableVerifiedCases.length, 114);

  for (const caseId of catalogue.availableVerifiedCases) {
    const result = JSON.parse((await handler({ topic: 'reference', caseId })).content[0].text);
    assert.equal(result.case.status, 'verified');
    assert.ok(result.case.requiredMetadata.length > 0, `missing metadata for ${caseId}`);
    assert.ok(result.case.referenceTemplate, `missing reference for ${caseId}`);
    assert.ok(result.case.parentheticalCitation, `missing parenthetical citation for ${caseId}`);
    assert.ok(result.case.narrativeCitation, `missing narrative citation for ${caseId}`);
    assert.ok(result.case.refuseWhen.length >= 3, `missing refusal guards for ${caseId}`);
  }
});

test('APA 7 guidance distinguishes signed and unsigned editorials', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const editorial = JSON.parse((await handler({ topic: 'reference', caseId: 'periodical-editorial' })).content[0].text);
  assert.equal(editorial.case.manualExample, 19);
  assert.match(editorial.case.referenceTemplate, /\[Editorial\]/);
  assert.match(editorial.case.referenceTemplate, /Sin firma: Título \[Editorial\]\. \(Año\)/);
  assert.match(editorial.case.parentheticalCitation, /Sin firma: \(“Título abreviado”, Año\)/);
  assert.match(editorial.case.rules.join(' '), /no está firmado/);
});

test('APA 7 guidance uses ampersand in a two-author parenthetical citation and reference', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const result = JSON.parse((await handler({ topic: 'reference', caseId: 'journal-doi' })).content[0].text);
  assert.match(result.case.referenceTemplate, / & /);
  assert.match(result.case.parentheticalCitation, /\(Autor & Autor, Año\)/);
  assert.match(result.case.narrativeCitation, /Autor y Autor \(Año\)/);
  assert.match(result.case.parentheticalCitation, /tres o más autores/);

  const noDoi = JSON.parse((await handler({ topic: 'citation', caseId: 'journal-no-doi-public-url' })).content[0].text);
  assert.match(noDoi.case.parentheticalCitation, /\(Autor & Autor, Año\)/);
  assert.match(noDoi.case.parentheticalCitation, /tres o más autores/);

  const mixedAuthors = JSON.parse((await handler({ topic: 'citation', caseId: 'journal-individual-group-authors' })).content[0].text);
  assert.match(mixedAuthors.case.referenceTemplate, /Autor personal, B\. B\./);
  assert.match(mixedAuthors.case.referenceTemplate, /Nombre exacto del grupo, Autor personal, A\. A\., & Autor personal, B\. B\./);
  assert.match(mixedAuthors.case.parentheticalCitation, /dos autores totales/);
  assert.match(mixedAuthors.case.parentheticalCitation, /tres o más autores personales y grupales en total/);
  assert.match(mixedAuthors.case.narrativeCitation, /Primer responsable acreditado et al\./);
  assert.match(mixedAuthors.case.rules.join(' '), /número total de autores/);
  assert.match(mixedAuthors.case.rules.join(' '), /exactamente en el orden acreditado/);
});

test('APA 7 guidance covers all 18 verified book and reference-work examples', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'reference' })).content[0].text);
  const bookCases = catalogue.availableVerifiedCases.filter((id: string) => id.startsWith('book-') || [
    'diagnostic-manual', 'dictionary-thesaurus-encyclopedia', 'anthology', 'religious-work',
    'ancient-greek-roman-work', 'shakespeare-work',
  ].includes(id));
  assert.equal(bookCases.length, 18);

  const translated = JSON.parse((await handler({ topic: 'citation', caseId: 'book-translated-republication' })).content[0].text);
  assert.match(translated.case.parentheticalCitation, /Año original\/Año reedición/);
  assert.match(translated.case.parentheticalCitation, /tres o más autores/);
  assert.match(translated.case.referenceTemplate, /dos: T\. Traductor & U\. Traductor, Trads\./);
  assert.match(translated.case.referenceTemplate, /21 o más: traductores 1–19/);
  assert.match(translated.case.rules.join(' '), /lista completa de traductores acreditados/);
  const authored = JSON.parse((await handler({ topic: 'citation', caseId: 'book-author-doi' })).content[0].text);
  assert.match(authored.case.parentheticalCitation, /Autor & Autor/);
  assert.match(authored.case.parentheticalCitation, /tres o más autores/);
  const edited = JSON.parse((await handler({ topic: 'citation', caseId: 'book-edited-doi-multiple-publishers' })).content[0].text);
  assert.match(edited.case.parentheticalCitation, /Editor & Editor/);
  assert.match(edited.case.parentheticalCitation, /tres o más editores/);
  const authoredWithEditor = JSON.parse((await handler({ topic: 'reference', caseId: 'book-author-editor-on-cover' })).content[0].text).case;
  assert.match(authoredWithEditor.requiredMetadata.join(' '), /edición desde la segunda/);
  assert.match(authoredWithEditor.referenceTemplate, /\(E\. Editor, Ed\.; edición, solo desde la segunda\)/);
  const dictionary = JSON.parse((await handler({ topic: 'reference', caseId: 'dictionary-thesaurus-encyclopedia' })).content[0].text);
  assert.match(dictionary.case.rules.join(' '), /fecha de recuperación/);
  assert.match(dictionary.case.requiredMetadata.join(' '), /edición\/versión si existe/);
  assert.match(dictionary.case.referenceTemplate, /Sin edición\/versión:/);
  assert.match(dictionary.case.referenceTemplate, /\(Ed\.\).*\(Eds\.\)/);
  assert.match(dictionary.case.referenceTemplate, /Con DOI\/URL:.*Impreso o base académica común sin localizador:/);
  assert.match(dictionary.case.rules.join(' '), /Distingue el autor grupal de los editores/);
  const foreignBook = JSON.parse((await handler({ topic: 'reference', caseId: 'book-other-language' })).content[0].text).case;
  assert.match(foreignBook.referenceTemplate, /Con DOI:.*Con URL pública sin DOI:.*sin localizador/);
  assert.match(foreignBook.rules.join(' '), /Prefiere DOI/);
  const anthology = JSON.parse((await handler({ topic: 'reference', caseId: 'anthology' })).content[0].text).case;
  assert.match(anthology.referenceTemplate, /Con DOI\/URL:.*sin localizador/);
  assert.match(anthology.rules.join(' '), /termina en la editorial/);
  const religious = JSON.parse((await handler({ topic: 'citation', caseId: 'religious-work' })).content[0].text).case;
  const multivolume = JSON.parse((await handler({ topic: 'reference', caseId: 'book-multivolume-single-volume' })).content[0].text).case;
  const ancient = JSON.parse((await handler({ topic: 'citation', caseId: 'ancient-greek-roman-work' })).content[0].text).case;
  assert.match(religious.parentheticalCitation, /\(\*Título\*,/);
  assert.match(religious.narrativeCitation, /^\*Título\*/);
  assert.match(religious.parentheticalCitation, /Año versión\) si no corresponde un año original/);
  assert.match(religious.referenceTemplate, /con traductor:.*con edición:.*con ambos:/i);
  assert.match(religious.referenceTemplate, /Obra original publicada.*URL\./);
  assert.match(ancient.referenceTemplate, /nota antes de la URL final/);
  assert.match(religious.rules.join(' '), /Omite el traductor, la edición o todo el paréntesis/);
  assert.match(religious.rules.join(' '), /No inventes un año original/);
  assert.match(multivolume.referenceTemplate, /\(Ed\.\).*\(Eds\.\)/);
  assert.match(multivolume.referenceTemplate, /Autor, C\. C\./);
  assert.match(multivolume.rules.join(' '), /lista completa de autores/);
  assert.match(multivolume.rules.join(' '), /lista completa en posición de autor/);
  const multivolumeChapter = JSON.parse((await handler({ topic: 'reference', caseId: 'chapter-multivolume-work' })).content[0].text).case;
  assert.match(multivolumeChapter.referenceTemplate, /Con título propio:.*edición, solo si existe.*Sin título propio: Título general \(edición, solo si existe; Vol\. x, pp\. xx-xx\)/);
  const stableEntry = JSON.parse((await handler({ topic: 'reference', caseId: 'reference-entry-group-author' })).content[0].text).case;
  assert.match(stableEntry.referenceTemplate, /Entrada estable o archivada:.*URL/);
  assert.match(stableEntry.referenceTemplate, /Entrada que cambia continuamente sin archivo:.*Recuperado/);
  assert.match(ancient.parentheticalCitation, /fecha original es exacta/);
  assert.match(ancient.parentheticalCitation, /ca\. Año original.*si es aproximada/);
  assert.match(ancient.referenceTemplate, /Con traductor.*Con editor:/);
  assert.match(ancient.rules.join(' '), /\(Trad\.\).*\(Ed\.\)/);
  const shakespeare = JSON.parse((await handler({ topic: 'citation', caseId: 'shakespeare-work' })).content[0].text).case;
  assert.match(shakespeare.referenceTemplate, /Con editor:.*Con traductor:/);
  assert.equal((shakespeare.referenceTemplate.match(/Obra original publicada en Año original/g) ?? []).length, 2);
  assert.match(shakespeare.referenceTemplate, /dos: E\. E\. Editor & F\. F\. Editor, Eds\./);
  assert.match(shakespeare.referenceTemplate, /21 o más: editores 1–19/);
  assert.match(shakespeare.referenceTemplate, /21 o más: traductores 1–19/);
  assert.doesNotMatch(shakespeare.referenceTemplate, /\(Ed\.\)\)/);
  assert.match(shakespeare.rules.join(' '), /lista completa de editores o traductores acreditados/);
  assert.match(ancient.rules.join(' '), /omítelo ante una fecha exacta verificada/);
});

test('APA 7 edited works preserve the complete editor list and plural role', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  for (const caseId of ['book-edited-doi-multiple-publishers', 'book-edited-no-doi-database-or-print', 'book-edited-electronic-public-url', 'anthology']) {
    const edited = JSON.parse((await handler({ topic: 'reference', caseId })).content[0].text).case;
    assert.match(edited.referenceTemplate, /\(Eds\.\)/, caseId);
    assert.match(edited.rules.join(' '), /lista completa de editores/, caseId);
    if (caseId !== 'anthology') {
      assert.match(edited.requiredMetadata.join(' '), /edición desde la segunda/, caseId);
      assert.match(edited.referenceTemplate, /\(edición, solo desde la segunda\)/, caseId);
      assert.match(edited.rules.join(' '), /Incluye la edición desde la segunda/, caseId);
    }
  }
});

test('APA 7 authored books preserve every credited author', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  for (const caseId of ['book-author-doi', 'book-author-no-doi-database-or-print', 'book-author-electronic-public-url', 'book-other-language', 'book-translated-republication']) {
    const authored = JSON.parse((await handler({ topic: 'reference', caseId })).content[0].text).case;
    assert.match(authored.referenceTemplate, /Autor, C\. C\./, caseId);
    assert.match(authored.rules.join(' '), /lista completa de autores/, caseId);
  }
  const republished = JSON.parse((await handler({ topic: 'reference', caseId: 'book-republished' })).content[0].text).case;
  assert.match(republished.referenceTemplate, /\(Obra original publicada en Año original\)\. Añade DOI\/URL solo si corresponde al final/);
});

test('APA 7 electronic books omit audiobook-only fields unless applicable', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const electronic = JSON.parse((await handler({ topic: 'reference', caseId: 'book-author-electronic-public-url' })).content[0].text).case;
  assert.match(electronic.referenceTemplate, /Libro electrónico:.*Editorial\. URL\. Audiolibro:/);
  assert.match(electronic.referenceTemplate, /Libro electrónico:.*\(edición, solo desde la segunda\)/);
  assert.match(electronic.referenceTemplate, /Audiolibro:.*Narr\.; edición, solo desde la segunda/);
  assert.match(electronic.rules.join(' '), /únicamente cuando la versión consultada es un audiolibro/);
});

test('APA 7 standard journals preserve every credited author', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  for (const caseId of ['journal-doi', 'journal-no-doi-public-url', 'journal-no-doi-database-or-print', 'journal-elocator', 'journal-advance-online', 'journal-in-press', 'journal-other-language', 'journal-cochrane']) {
    const article = JSON.parse((await handler({ topic: 'reference', caseId })).content[0].text).case;
    assert.match(article.referenceTemplate, /Autor, C\. C\./, caseId);
    assert.match(article.rules.join(' '), /lista completa y ordenada de autores/, caseId);
  }
  const advanceOnline = JSON.parse((await handler({ topic: 'reference', caseId: 'journal-advance-online' })).content[0].text).case;
  assert.match(advanceOnline.requiredMetadata.join(' '), /DOI o URL pública si corresponde/);
  assert.match(advanceOnline.referenceTemplate, /Con URL pública sin DOI/);
  const translated = JSON.parse((await handler({ topic: 'reference', caseId: 'journal-translated-republication' })).content[0].text).case;
  assert.match(translated.referenceTemplate, /dos: A\. Traductor & B\. Traductor, Trads\./);
  assert.match(translated.referenceTemplate, /21 o más: traductores 1–19/);
  assert.match(translated.rules.join(' '), /lista completa de traductores acreditados/);
});

test('APA 7 guidance covers all 12 chapter and reference-entry examples', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'reference' })).content[0].text);
  const ids = catalogue.availableVerifiedCases.filter((id: string) => [
    'chapter-edited-doi', 'chapter-edited-no-doi-database-or-print', 'chapter-electronic-public-url',
    'chapter-other-language', 'chapter-translated-republication', 'chapter-reprinted-from-journal',
    'chapter-reprinted-from-book', 'chapter-multivolume-work', 'work-in-anthology',
    'reference-entry-group-author', 'reference-entry-individual-author', 'wikipedia-entry',
  ].includes(id));
  assert.equal(ids.length, 12);
  const chapter = JSON.parse((await handler({ topic: 'citation', caseId: 'chapter-edited-doi' })).content[0].text).case;
  assert.match(chapter.parentheticalCitation, /Autor & Autor/);
  assert.match(chapter.parentheticalCitation, /tres o más autores/);
  const translated = JSON.parse((await handler({ topic: 'citation', caseId: 'chapter-translated-republication' })).content[0].text).case;
  assert.match(translated.parentheticalCitation, /Autor & Autor/);
  assert.match(translated.parentheticalCitation, /Año original\/Año reedición/);
  assert.match(translated.referenceTemplate, /dos: T\. Traductor & U\. Traductor, Trads\./);
  assert.match(translated.referenceTemplate, /21 o más: traductores 1–19/);

  const wikipedia = JSON.parse((await handler({ topic: 'citation', caseId: 'wikipedia-entry' })).content[0].text);
  assert.match(wikipedia.case.rules.join(' '), /revisión archivada/);
  assert.match(wikipedia.case.referenceTemplate, /Recuperado el día de mes de año, de URL actual/);
  const individualReferenceEntry = JSON.parse((await handler({ topic: 'reference', caseId: 'reference-entry-individual-author' })).content[0].text).case;
  assert.match(individualReferenceEntry.requiredMetadata.join(' '), /edición o versión si existe/);
  assert.match(individualReferenceEntry.referenceTemplate, /Primera edición o sin edición declarada/);
  const reprint = JSON.parse((await handler({ topic: 'reference', caseId: 'chapter-reprinted-from-journal' })).content[0].text);
  assert.match(reprint.case.parentheticalCitation, /Año original\/Año reimpresión/);
});

test('APA 7 chapter containers preserve multiple editors', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  for (const caseId of ['chapter-edited-doi', 'chapter-edited-no-doi-database-or-print', 'chapter-electronic-public-url', 'chapter-other-language', 'chapter-translated-republication', 'chapter-reprinted-from-journal', 'chapter-reprinted-from-book', 'chapter-multivolume-work']) {
    const chapter = JSON.parse((await handler({ topic: 'reference', caseId })).content[0].text).case;
    assert.match(chapter.referenceTemplate, /\(Eds\.\)/, caseId);
  }
  for (const caseId of ['chapter-edited-doi', 'chapter-edited-no-doi-database-or-print', 'chapter-electronic-public-url']) {
    const chapter = JSON.parse((await handler({ topic: 'reference', caseId })).content[0].text).case;
  assert.match(chapter.referenceTemplate, /E\. E\. Editor & F\. F\. Editor \(Eds\.\)/, caseId);
    assert.match(chapter.referenceTemplate, /edición y volumen: edición, Vol\. x, pp\. xx-xx; solo edición: edición, pp\. xx-xx; solo volumen: Vol\. x, pp\. xx-xx/, caseId);
  }
});

test('APA 7 edited chapters preserve every credited chapter author', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  for (const caseId of ['chapter-edited-doi', 'chapter-edited-no-doi-database-or-print', 'chapter-electronic-public-url', 'chapter-reprinted-from-journal']) {
    const chapter = JSON.parse((await handler({ topic: 'reference', caseId })).content[0].text).case;
    assert.match(chapter.referenceTemplate, /Autor, C\. C\./, caseId);
    assert.match(chapter.rules.join(' '), /lista completa y ordenada de autores del capítulo/, caseId);
  }
  for (const caseId of ['chapter-other-language', 'chapter-translated-republication', 'chapter-reprinted-from-book', 'chapter-multivolume-work']) {
    const chapter = JSON.parse((await handler({ topic: 'reference', caseId })).content[0].text).case;
    assert.match(chapter.referenceTemplate, /de 3 a 20:/i, caseId);
    assert.match(chapter.referenceTemplate, /21 o más:.*1–19.*Último/i, caseId);
  }
  const foreignChapter = JSON.parse((await handler({ topic: 'reference', caseId: 'chapter-other-language' })).content[0].text).case;
  assert.match(foreignChapter.referenceTemplate, /Con DOI:.*Con URL pública sin DOI:.*sin localizador/);
  assert.match(foreignChapter.rules.join(' '), /Prefiere DOI/);
});

test('APA 7 anthology work makes an earlier publication date optional', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const work = JSON.parse((await handler({ topic: 'reference', caseId: 'work-in-anthology' })).content[0].text).case;
  assert.match(work.parentheticalCitation, /Año antología\).*si no hubo publicación anterior/);
  assert.match(work.referenceTemplate, /solo si hubo una publicación anterior verificada\)\. Añade DOI\/URL solo si corresponde al final/);
  assert.match(work.rules.join(' '), /No inventes un año original/);
});

test('APA 7 guidance covers reports, conferences and theses through example 66', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'reference' })).content[0].text);
  const cases = await Promise.all([
    'report-government-or-organization', 'report-individual-authors-in-organization', 'report-series',
    'report-working-group', 'annual-report', 'code-of-ethics', 'grant-award', 'issue-brief',
    'policy-brief', 'press-release', 'conference-session', 'conference-paper-presentation',
    'conference-poster-presentation', 'symposium-contribution', 'thesis-unpublished',
    'thesis-database', 'thesis-online-not-database',
  ].map(async caseId => JSON.parse((await handler({ topic: 'reference', caseId })).content[0].text).case));
  assert.equal(cases.length, 17);
  assert.equal(catalogue.availableVerifiedCases.length, 114);
  assert.match(cases.find(item => item.id === 'grant-award').rules.join(' '), /solicitud de subvención no recuperable/);
  assert.match(cases.find(item => item.id === 'symposium-contribution').rules.join(' '), /actas publicadas/);
  assert.match(cases.find(item => item.id === 'symposium-contribution').referenceTemplate, /C\. Coordinador & D\. Coordinador \(Coordinadores\)/);
  assert.match(cases.find(item => item.id === 'thesis-database').referenceTemplate, /Nombre de la base de datos/);

  for (const id of ['report-series', 'conference-session', 'conference-paper-presentation', 'conference-poster-presentation']) {
    const item = cases.find(candidate => candidate.id === id);
    assert.ok(item);
    assert.match(item.parentheticalCitation, /tres o más/);
    assert.match(item.parentheticalCitation, / & /);
  }
  const organization = cases.find(candidate => candidate.id === 'report-government-or-organization');
  assert.ok(organization);
  assert.match(organization.parentheticalCitation, /Entidad & Entidad/);
  assert.match(organization.parentheticalCitation, /tres o más entidades autoras/);
  assert.match(organization.referenceTemplate, /dos: Entidad autora, & Entidad autora/);
  assert.match(organization.referenceTemplate, /de 3 a 20: Entidad autora, Entidad autora, Entidad autora/);
  assert.match(organization.referenceTemplate, /Con número:.*Sin número:.*Impreso o base académica común sin localizador:/);
  assert.match(organization.requiredMetadata.join(' '), /URL\/DOI si corresponde/);
  for (const id of ['conference-session', 'conference-paper-presentation', 'conference-poster-presentation', 'symposium-contribution']) {
    const conference = cases.find(candidate => candidate.id === id);
    assert.ok(conference);
    assert.match(conference.referenceTemplate, /meses distintos: Año, día de mes–día de mes; años distintos: Año, día de mes–Año, día de mes/, id);
  }
  assert.match(organization.referenceTemplate, /21 o más: entidades autoras 1–19/);
  assert.match(organization.rules.join(' '), /todas las agencias coautoras/);
  for (const id of ['report-individual-authors-in-organization', 'report-series']) {
    const report = cases.find(candidate => candidate.id === id);
    assert.ok(report);
    assert.match(report.referenceTemplate, /Autor, C\. C\./, id);
    assert.match(report.rules.join(' '), /lista completa de autores/, id);
  }
  const symposium = cases.find(candidate => candidate.id === 'symposium-contribution');
  assert.ok(symposium);
  assert.match(symposium.parentheticalCitation, /tres o más autores/);
  assert.match(symposium.referenceFormatting.italicize.join(' '), /título del simposio contenedor/);
  assert.match(symposium.referenceFormatting.italicize.join(' '), /no el título de la contribución/);
  assert.match(symposium.referenceTemplate, /\(Coordinadores\)/);
  assert.match(symposium.referenceTemplate, /C\. Coordinador, D\. Coordinador, & E\. Coordinador/);
  assert.match(symposium.rules.join(' '), /lista completa de coordinadores/);
  assert.match(symposium.referenceTemplate, /Autor, C\. C\./);
  assert.match(symposium.rules.join(' '), /lista completa y ordenada de autores de la contribución/);
  const session = cases.find(candidate => candidate.id === 'conference-session');
  assert.ok(session);
  assert.match(session.referenceTemplate, /Ponente, B\. B\./);
  assert.match(session.rules.join(' '), /lista completa de personas acreditadas/);
  for (const id of ['conference-paper-presentation', 'conference-poster-presentation']) {
    const presentation = cases.find(candidate => candidate.id === id);
    assert.ok(presentation);
    assert.match(presentation.referenceTemplate, /Autor, B\. B\./, id);
    assert.match(presentation.rules.join(' '), /lista completa de autores acreditados/, id);
  }
  for (const id of ['conference-session', 'conference-paper-presentation', 'conference-poster-presentation']) {
    const presentation = JSON.parse((await handler({ topic: 'reference', caseId: id })).content[0].text).case;
    assert.match(presentation.referenceTemplate, /dos:.*&/, id);
    assert.match(presentation.referenceTemplate, /de 3 a 20:.*incluye todos/, id);
    assert.match(presentation.referenceTemplate, /21 o más:.*1–19.*Último/, id);
  }
});

test('APA 7 special periodical issues preserve multiple editors', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const special = JSON.parse((await handler({ topic: 'reference', caseId: 'journal-special-section-issue' })).content[0].text).case;
  assert.match(special.referenceTemplate, /\(Eds\.\)/);
  assert.match(special.rules.join(' '), /lista completa de editores/);
});

test('APA 7 guidance covers reviews and unpublished or informally published works', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const review = JSON.parse((await handler({ topic: 'reference', caseId: 'review-film-in-journal' })).content[0].text).case;
  const submitted = JSON.parse((await handler({ topic: 'reference', caseId: 'manuscript-submitted' })).content[0].text).case;
  const eric = JSON.parse((await handler({ topic: 'reference', caseId: 'informal-eric' })).content[0].text).case;
  assert.equal(review.manualExample, 67);
  assert.match(review.referenceTemplate, /Reseña de la película/);
  assert.match(review.parentheticalCitation, /Revisor & Revisor/);
  assert.match(review.parentheticalCitation, /tres o más revisores/);
  assert.match(review.referenceTemplate, /Revisor, C\. C\./);
  assert.match(review.rules.join(' '), /lista completa y ordenada de revisores/);
  assert.match(submitted.rules.join(' '), /No nombra la revista/);
  assert.match(submitted.parentheticalCitation, /Autor & Autor/);
  assert.match(submitted.parentheticalCitation, /tres o más autores/);
  assert.match(eric.referenceTemplate, /documento ERIC/);
  for (const caseId of ['manuscript-unpublished', 'manuscript-in-preparation', 'manuscript-submitted', 'informal-preprint-or-repository']) {
    const manuscript = JSON.parse((await handler({ topic: 'reference', caseId })).content[0].text).case;
    assert.match(manuscript.referenceTemplate, /Autor, C\. C\./, caseId);
    assert.match(manuscript.rules.join(' '), /lista completa y ordenada de autores/, caseId);
  }
});

test('APA 7 newspaper book reviews distinguish print pages from online URLs', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const review = JSON.parse((await handler({ topic: 'reference', caseId: 'review-book-in-newspaper' })).content[0].text).case;
  assert.match(review.referenceTemplate, /p\. x o pp\. xx–xx para versión impresa/);
  assert.match(review.referenceTemplate, /URL para versión en línea/);
  assert.match(review.rules.join(' '), /incluye la página o el intervalo/);
});

test('APA 7 episode reviews preserve every credited contributor and role', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const review = JSON.parse((await handler({ topic: 'reference', caseId: 'review-tv-episode-on-website' })).content[0].text).case;
  assert.match(review.referenceTemplate, /de 3 a 20 responsables combinados/);
  assert.match(review.referenceTemplate, /21 o más: responsables 1–19/);
  assert.match(review.rules.join(' '), /lista completa de guionistas, director y otros responsables/);
});

test('APA 7 guidance covers datasets, software and tests through example 83', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const dataset = JSON.parse((await handler({ topic: 'reference', caseId: 'dataset-published' })).content[0].text).case;
  const software = JSON.parse((await handler({ topic: 'reference', caseId: 'specialized-software' })).content[0].text).case;
  const testRecord = JSON.parse((await handler({ topic: 'reference', caseId: 'test-database-record' })).content[0].text).case;
  const mobileApp = JSON.parse((await handler({ topic: 'reference', caseId: 'mobile-application' })).content[0].text).case;
  const mobileAppEntry = JSON.parse((await handler({ topic: 'reference', caseId: 'mobile-app-reference-entry' })).content[0].text).case;
  assert.equal(dataset.manualExample, 75);
  assert.match(dataset.rules.join(' '), /análisis secundarios/);
  assert.match(dataset.referenceTemplate, /solo si difiere del autor/);
  assert.match(dataset.referenceTemplate, /Elige una sola forma de título/);
  assert.match(dataset.referenceTemplate, /Identificador; Versión x\), seguido sin punto por \[Conjunto de datos/);
  assert.match(dataset.referenceTemplate, /Título del conjunto \(Identificador\); Título del conjunto \(Versión x\); o Título del conjunto \(Identificador; Versión x\)/);
  assert.match(dataset.rules.join(' '), /omite todo el paréntesis si no existe ninguno/);
  const foreignJournal = JSON.parse((await handler({ topic: 'reference', caseId: 'journal-other-language' })).content[0].text).case;
  assert.match(foreignJournal.referenceTemplate, /Con DOI:.*Sin DOI con URL pública:.*Impreso o base académica común sin localizador:/);
  assert.match(foreignJournal.requiredMetadata.join(' '), /DOI\/URL si corresponde/);
  assert.match(software.rules.join(' '), /distribución limitada/);
  assert.match(software.referenceTemplate, /solo si difiere del autor/);
  assert.match(mobileAppEntry.requiredMetadata.join(' '), /desarrollador o tienda si difiere del autor/);
  assert.match(mobileAppEntry.referenceTemplate, /Desarrollador o tienda, solo si difiere del autor/);
  assert.match(mobileAppEntry.rules.join(' '), /coincide con el autor, omite ese elemento/);
  assert.match(software.parentheticalCitation, /Autor & Autor/);
  assert.match(software.parentheticalCitation, /tres o más autores personales/);
  assert.match(dataset.parentheticalCitation, /Autor & Autor/);
  const rawData = JSON.parse((await handler({ topic: 'reference', caseId: 'raw-data-unpublished' })).content[0].text).case;
  const equipment = JSON.parse((await handler({ topic: 'reference', caseId: 'apparatus-or-equipment' })).content[0].text).case;
  assert.match(rawData.referenceTemplate, /o Entidad autora/);
  assert.match(rawData.rules.join(' '), /entidad en posición de autor/);
  assert.match(equipment.referenceTemplate, /Modelo x, solo si existe/);
  assert.match(equipment.rules.join(' '), /si no existe, omite todo el paréntesis/);
  assert.match(testRecord.rules.join(' '), /información descriptiva o administrativa única/);
  assert.match(testRecord.referenceTemplate, /Sigla\/código, solo si existe/);
  assert.match(testRecord.rules.join(' '), /Omite por completo el paréntesis de sigla o código/);
  assert.match(testRecord.parentheticalCitation, /tres o más autores/);
  assert.match(mobileApp.referenceTemplate, /Tienda o desarrollador verificado, solo si difiere del autor/);
  assert.match(mobileApp.rules.join(' '), /desarrollador cuando la distribuye directamente/);
  assert.match(software.parentheticalCitation, /Autor|Entidad/);
  const manual = JSON.parse((await handler({ topic: 'citation', caseId: 'test-manual' })).content[0].text).case;
  assert.match(manual.parentheticalCitation, /tres o más autores/);
  assert.match(manual.referenceTemplate, /\(edición, solo desde la segunda\)/);
  assert.match(manual.referenceTemplate, /Con DOI\/URL/);
  assert.match(manual.referenceTemplate, /Impreso o base académica común sin localizador/);
  assert.match(manual.rules.join(' '), /omítela para la primera/);
  for (const item of [dataset, software, testRecord, manual]) {
    assert.match(item.referenceTemplate, /Autor, C\. C\./);
    assert.match(item.rules.join(' '), /lista completa y ordenada de autores personales/);
  }
});

test('APA 7 guidance covers audiovisual and audio works through example 96', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const ted = JSON.parse((await handler({ topic: 'reference', caseId: 'ted-talk' })).content[0].text).case;
  const webinar = JSON.parse((await handler({ topic: 'reference', caseId: 'recorded-webinar' })).content[0].text).case;
  const interview = JSON.parse((await handler({ topic: 'reference', caseId: 'archived-radio-interview' })).content[0].text).case;
  const podcast = JSON.parse((await handler({ topic: 'reference', caseId: 'podcast-series' })).content[0].text).case;
  const song = JSON.parse((await handler({ topic: 'reference', caseId: 'song-or-track' })).content[0].text).case;
  const episode = JSON.parse((await handler({ topic: 'citation', caseId: 'television-episode-or-webisode' })).content[0].text).case;
  assert.match(episode.referenceTemplate, /dos guionistas y director:.*Guionista, H\. H\. \(Guionista\), & Director/);
  assert.doesNotMatch(episode.referenceTemplate, /Guionistas\).*&, & Director/);
  assert.match(episode.rules.join(' '), /un único & antes del último responsable/);
  const series = JSON.parse((await handler({ topic: 'citation', caseId: 'television-series' })).content[0].text).case;
  const film = JSON.parse((await handler({ topic: 'citation', caseId: 'film-or-video' })).content[0].text).case;
  assert.equal(ted.manualExample, 88);
  assert.match(ted.rules.join(' '), /En YouTube/);
  assert.match(webinar.rules.join(' '), /comunicación personal/);
  assert.match(interview.rules.join(' '), /persona entrevistada/);
  assert.match(interview.referenceTemplate, /Archivo físico sin URL/);
  assert.match(interview.rules.join(' '), /omite URL e institución\/museo/);
  assert.match(podcast.referenceTemplate, /Año único; Año inicial–Año final; o Año inicial–presente/);
  assert.match(podcast.referenceTemplate, /Responsable, T\. T\., …, & Responsable final/);
  assert.match(podcast.referenceTemplate, /21 o más:.*1–19.*Último responsable/);
  assert.match(podcast.rules.join(' '), /comenzó y terminó ese año/);
  assert.match(song.referenceTemplate, /solo cuando exista un año original verificado/);
  assert.match(song.rules.join(' '), /canción moderna o sin año original verificado/);
  assert.match(podcast.requiredMetadata.join(' '), /lista completa/);
  assert.match(podcast.parentheticalCitation, /tres o más responsables/);
  const podcastEpisode = JSON.parse((await handler({ topic: 'reference', caseId: 'podcast-episode' })).content[0].text).case;
  assert.match(podcastEpisode.requiredMetadata.join(' '), /lista completa/);
  assert.match(podcastEpisode.parentheticalCitation, /Responsable & Responsable/);
  assert.match(podcastEpisode.referenceTemplate, /Responsable, T\. T\., …, & Responsable final/);
  assert.match(podcastEpisode.referenceTemplate, /21 o más:.*1–19.*Último responsable/);
  assert.match(podcastEpisode.narrativeCitation, /et al\./);
  assert.match(episode.parentheticalCitation, /\(Guionista & Director, Año\)/);
  assert.match(episode.parentheticalCitation, /tres o más responsables acreditados/);
  assert.match(episode.narrativeCitation, /Guionista y Director \(Año\)/);
  assert.match(episode.referenceTemplate, /Productores ejecutivos/);
  assert.match(episode.referenceTemplate, /R\. Productor, …, & Z\. Productor final/);
  assert.match(episode.referenceTemplate, /21 o más:.*1–19.*Último productor/);
  assert.match(episode.referenceTemplate, /Añade URL solo si existe un localizador público específico/);
  assert.match(episode.rules.join(' '), /Omite la URL para una emisión o versión de streaming ordinaria/);
  assert.match(episode.rules.join(' '), /lista completa de productores ejecutivos/);
  assert.match(series.parentheticalCitation, /tres o más productores/);
  assert.match(series.referenceTemplate, /Productores ejecutivos/);
  assert.match(series.referenceTemplate, /Productor, R\. R\., …, & Productor final/);
  assert.match(series.referenceTemplate, /21 o más:.*1–19.*Último productor/);
  assert.match(series.rules.join(' '), /Incluye la lista completa/);
  assert.match(series.referenceTemplate, /Año único; Año inicial–Año final; o Año inicial–presente/);
  assert.match(series.rules.join(' '), /comenzó y terminó en ese mismo año/);
  assert.match(film.parentheticalCitation, /Director & Director/);
  assert.match(film.referenceTemplate, /Director, F\. F\., …, & Director final/);
  assert.match(film.referenceTemplate, /21 o más:.*1–19.*Último director/);
  assert.match(film.rules.join(' '), /lista completa de directores/);
  assert.match(film.referenceTemplate, /Añade URL solo cuando corresponda/);
  assert.match(film.rules.join(' '), /Omite la URL para una versión física o de streaming ordinario/);
  const translatedFilm = JSON.parse((await handler({ topic: 'reference', caseId: 'film-other-language' })).content[0].text).case;
  assert.match(translatedFilm.referenceTemplate, /Director, F\. F\., …, & Director final/);
  assert.match(translatedFilm.referenceTemplate, /21 o más:.*1–19.*Último director/);
  assert.match(translatedFilm.referenceTemplate, /Productora 1; Productora 2; conserva todas/);
  assert.match(translatedFilm.rules.join(' '), /todas las productoras/);
  assert.match(episode.referenceTemplate, /Responsable, R\. R\. \(Guionista y Director\)/);
  assert.match(episode.referenceTemplate, /dos guionistas y director: Guionista, G\. G\./);
  assert.match(episode.referenceTemplate, /de 3 a 20 responsables combinados: Guionista/);
  assert.match(episode.referenceTemplate, /21 o más responsables combinados: responsables 1–19/);
  assert.match(episode.referenceTemplate, /dos: P\. Productor & Q\. Productor \(Productores ejecutivos\)/);
  assert.match(episode.rules.join(' '), /una sola vez con ambos roles/);
  assert.match(film.parentheticalCitation, /tres o más directores/);
});

test('APA 7 guidance covers visual, social and web works through example 114', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const map = JSON.parse((await handler({ topic: 'reference', caseId: 'map' })).content[0].text).case;
  const tweet = JSON.parse((await handler({ topic: 'reference', caseId: 'tweet' })).content[0].text).case;
  const facebook = JSON.parse((await handler({ topic: 'reference', caseId: 'facebook-post' })).content[0].text).case;
  const news = JSON.parse((await handler({ topic: 'reference', caseId: 'webpage-news-site' })).content[0].text).case;
  const changing = JSON.parse((await handler({ topic: 'reference', caseId: 'webpage-retrieval-date' })).content[0].text).case;
  const infographic = JSON.parse((await handler({ topic: 'citation', caseId: 'infographic' })).content[0].text).case;
  const slides = JSON.parse((await handler({ topic: 'citation', caseId: 'slides-or-lecture-notes' })).content[0].text).case;
  const individualWebpage = JSON.parse((await handler({ topic: 'reference', caseId: 'webpage-individual-author' })).content[0].text).case;
  assert.equal(map.manualExample, 100);
  const artwork = JSON.parse((await handler({ topic: 'reference', caseId: 'artwork-museum-or-museum-site' })).content[0].text).case;
  assert.match(artwork.referenceTemplate, /para una obra consultada físicamente sin URL, termina después de la ubicación/);
  assert.match(artwork.rules.join(' '), /No inventes una URL/);
  assert.match(map.rules.join(' '), /dinámico/);
  assert.match(map.referenceTemplate, /Mapa estático o archivado con título:.*Fuente\. URL/);
  assert.match(map.referenceTemplate, /Mapa dinámico no archivado con título:.*Recuperado/);
  assert.match(map.referenceTemplate, /\[Mapa de descripción\]/);
  assert.doesNotMatch(map.referenceTemplate, /\[Descripción del mapa\] \[Mapa\]/);
  const photograph = JSON.parse((await handler({ topic: 'reference', caseId: 'photograph' })).content[0].text).case;
  assert.match(photograph.referenceTemplate, /\[Fotografía de descripción\]/);
  assert.doesNotMatch(photograph.referenceTemplate, /\[Descripción\] \[Fotografía\]/);
  assert.match(slides.referenceTemplate, /\[Diapositivas de PowerPoint o Notas de conferencia sobre descripción\]/);
  assert.match(tweet.rules.join(' '), /Cada emoji cuenta como una palabra/);
  assert.match(tweet.referenceTemplate, /Plataforma verificada/);
  assert.match(tweet.rules.join(' '), /solo cuando esa sea la plataforma real/);
  assert.match(facebook.referenceTemplate, /Solo texto:.*\[Actualización de estado\]/);
  assert.match(facebook.referenceTemplate, /Con imagen, infografía, video o enlace:/);
  assert.match(facebook.rules.join(' '), /para texto solo, omite toda esa descripción adicional/);
  assert.match(news.rules.join(' '), /no son ediciones de un periódico/);
  assert.match(changing.rules.join(' '), /no existe versión archivada/);
  assert.match(infographic.parentheticalCitation, /tres o más autores/);
  assert.match(slides.parentheticalCitation, /Autor & Autor/);
  assert.match(slides.parentheticalCitation, /tres o más autores/);
  assert.match(slides.referenceTemplate, /\(Año\), \(Año, mes\) o \(Año, día de mes\)/);
  assert.match(slides.rules.join(' '), /no inventes mes ni día/);
  assert.match(individualWebpage.referenceTemplate, /\(Año\), \(Año, mes\) o \(Año, día de mes\)/);
  assert.match(individualWebpage.referenceTemplate, /Nombre del sitio, solo si difiere del autor/);
  assert.match(individualWebpage.rules.join(' '), /Omite el nombre del sitio cuando coincide con el autor/);
  assert.match(individualWebpage.rules.join(' '), /No inventes el mes ni el día/);
  const groupWebpage = JSON.parse((await handler({ topic: 'reference', caseId: 'webpage-group-author' })).content[0].text).case;
  assert.match(groupWebpage.referenceTemplate, /\(Año\), \(Año, mes\) o \(Año, día de mes\)/);
  assert.match(groupWebpage.rules.join(' '), /No inventes el mes ni el día/);
});

test('APA 7 magazine dates preserve the precision actually published', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const magazine = JSON.parse((await handler({ topic: 'reference', caseId: 'magazine-article' })).content[0].text).case;
  assert.match(magazine.referenceTemplate, /\(Año\), \(Año, mes o estación\) o \(Año, día de mes\)/);
  assert.match(magazine.rules.join(' '), /No inventes mes ni día/);
});

test('APA 7 guidance exposes verified citation rules 8.1 through 8.36', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'citation' })).content[0].text);
  assert.equal(catalogue.availableCitationRules.length, 37);

  for (const citationRuleId of catalogue.availableCitationRules) {
    const result = JSON.parse((await handler({ topic: 'citation', citationRuleId })).content[0].text);
    assert.equal(result.citationRule.status, 'verified');
    assert.match(result.citationRule.manualSection, /^8\./);
    assert.ok(result.citationRule.rules.length > 0, `missing rules for ${citationRuleId}`);
    assert.ok(result.citationRule.referenceTreatment, `missing reference treatment for ${citationRuleId}`);
    assert.ok(result.citationRule.refuseWhen.length >= 3, `missing refusal guards for ${citationRuleId}`);
  }
});

test('APA 7 guidance distinguishes recoverable, personal and participant interviews', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const interview = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'interview-source' })).content[0].text).citationRule;
  const personal = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'personal-communication' })).content[0].text).citationRule;
  const classroom = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'classroom-intranet-source' })).content[0].text).citationRule;
  assert.match(interview.referenceTreatment, /Publicada: referencia del medio/);
  assert.match(personal.referenceTreatment, /No aparece/);
  assert.match(classroom.rules.join(' '), /público destinatario puede acceder/);
  assert.match(classroom.rules.join(' '), /URL de inicio de sesión/);
});

test('APA 7 guidance handles secondary sources without inventing a primary reference', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const secondary = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'primary-secondary-source' })).content[0].text).citationRule;
  assert.match(secondary.examples.join(' '), /como se cita en/);
  assert.match(secondary.referenceTreatment, /Solo la fuente secundaria consultada/);
  assert.match(secondary.refuseWhen.join(' '), /primaria no consultada/);
});

test('APA 7 guidance preserves special treatment for unrecorded Indigenous knowledge', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const rule = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'indigenous-traditional-knowledge' })).content[0].text).citationRule;
  assert.match(rule.rules.join(' '), /Si no están registrados/);
  assert.match(rule.rules.join(' '), /Obtén consentimiento/);
  assert.match(rule.referenceTreatment, /no registrado: sin referencia/);
});

test('APA 7 guidance covers author-date ambiguity and repeated citations', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const unknown = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'unknown-or-anonymous-author' })).content[0].text).citationRule;
  const repeated = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'repeated-narrative-year' })).content[0].text).citationRule;
  const sameDate = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'same-author-same-date' })).content[0].text).citationRule;
  assert.match(unknown.rules.join(' '), /solo cuando la fuente firma explícitamente/);
  assert.match(repeated.rules.join(' '), /no uses ibid/);
  assert.match(sameDate.examples.join(' '), /2020a/);
});

test('APA 7 guidance distinguishes short, block and participant quotations', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const short = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'short-quote' })).content[0].text).citationRule;
  const block = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'block-quote' })).content[0].text).citationRule;
  const participant = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'research-participant-quotation' })).content[0].text).citationRule;
  assert.match(short.whenToUse, /menos de 40/);
  assert.match(block.whenToUse, /40 palabras o más/);
  assert.match(block.rules.join(' '), /sin otro punto después/);
  assert.match(short.rules.join(' '), /puntuación que pertenece al fragmento original/);
  assert.match(short.rules.join(' '), /después de las comillas/);
  assert.match(participant.referenceTreatment, /No se incluye/);
  assert.match(participant.rules.join(' '), /No las trates como comunicaciones personales/);
});

test('APA 7 guidance keeps added emphasis inside a direct quotation', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const changes = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'quote-changes-requiring-explanation' })).content[0].text).citationRule;
  assert.match(changes.examples.join(' '), /\*enfatizada\* \[énfasis añadido\]”/);
});

test('APA 7 guidance refuses invented locators and separates citation from copyright permission', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const noPages = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'quote-without-page-numbers' })).content[0].text).citationRule;
  const permission = JSON.parse((await handler({ topic: 'citation', citationRuleId: 'permission-for-long-quotation' })).content[0].text).citationRule;
  assert.match(noPages.rules.join(' '), /No uses ubicaciones Kindle/);
  assert.match(noPages.refuseWhen.join(' '), /Se inventó una página/);
  assert.match(permission.rules.join(' '), /obligaciones distintas/);
  assert.match(permission.refuseWhen.join(' '), /citar equivale a tener permiso/);
});

test('APA 7 guidance exposes verified reference-list rules 9.1 through 9.52', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const catalogue = JSON.parse((await handler({ topic: 'reference' })).content[0].text);
  assert.equal(catalogue.availableReferenceRules.length, 52);

  for (const referenceRuleId of catalogue.availableReferenceRules) {
    const result = JSON.parse((await handler({ topic: 'reference', referenceRuleId })).content[0].text).referenceRule;
    assert.equal(result.status, 'verified');
    assert.match(result.manualSection, /^9\./);
    assert.ok(result.rules.length > 0, `missing rules for ${referenceRuleId}`);
    assert.ok(result.citationImpact.length > 0, `missing citation impact for ${referenceRuleId}`);
    assert.ok(result.referencePattern, `missing pattern for ${referenceRuleId}`);
    assert.ok(result.refuseWhen.length >= 3, `missing refusal guards for ${referenceRuleId}`);
  }
});

test('APA 7 reference rules preserve translations and original publication years', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const language = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'other-language-work' })).content[0].text).referenceRule;
  const translated = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'translated-work' })).content[0].text).referenceRule;
  const reprinted = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'reprinted-work' })).content[0].text).referenceRule;
  assert.match(language.rules.join(' '), /traduce solo el título de la parte/);
  assert.match(language.referencePattern, /\[Traducción del título\]/);
  assert.match(translated.citationImpact.join(' '), /año original y el de la traducción/);
  assert.match(reprinted.citationImpact.join(' '), /año.*original.*reimpresión/);
});

test('APA 7 reference-list rules cover formatting, ordering, annotations and meta-analysis', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const format = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'reference-list-format' })).content[0].text).referenceRule;
  const sameDate = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'same-author-same-date-order' })).content[0].text).referenceRule;
  const annotations = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'annotated-bibliography' })).content[0].text).referenceRule;
  const meta = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'meta-analysis-references' })).content[0].text).referenceRule;
  assert.match(format.rules.join(' '), /1\.27 cm/);
  assert.match(sameDate.rules.join(' '), /2020a, 2020b/);
  assert.match(annotations.rules.join(' '), /párrafo nuevo debajo/);
  assert.match(meta.rules.join(' '), /asterisco al inicio/);
  assert.match(meta.rules.join(' '), /no crees una lista aparte/);
});

test('APA 7 source rules choose DOI over URL and omit common databases', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const ids = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'when-to-include-doi-url' })).content[0].text).referenceRule;
  const database = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'database-archive-source' })).content[0].text).referenceRule;
  const periodical = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'periodical-source' })).content[0].text).referenceRule;
  assert.match(ids.rules.join(' '), /incluye solo DOI/);
  assert.match(ids.rules.join(' '), /ISBN e ISSN no se incluyen/);
  assert.match(ids.rules.join(' '), /localizador oficial actualizado/);
  assert.match(ids.rules.join(' '), /solo cuando la obra realmente carece de una fuente recuperable/);
  assert.match(database.rules.join(' '), /Omítela para obras ampliamente disponibles/);
  assert.match(database.refuseWhen.join(' '), /sesión, token/);
  assert.match(periodical.rules.join(' '), /coma que lo sigue también va en cursiva/);
  assert.match(periodical.rules.join(' '), /Excepción para blogs/);
  assert.match(periodical.rules.join(' '), /nombre del blog.*queda en redonda/);
});

test('APA 7 periodical rules omit rather than invent missing publication data', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const missing = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'periodical-missing-information' })).content[0].text).referenceRule;
  const article = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'article-number' })).content[0].text).referenceRule;
  const cochrane = JSON.parse((await handler({ topic: 'reference', caseId: 'journal-cochrane' })).content[0].text).case;
  const upToDate = JSON.parse((await handler({ topic: 'reference', caseId: 'journal-uptodate' })).content[0].text).case;
  assert.match(missing.rules.join(' '), /Omite volumen, número, páginas/);
  assert.match(missing.refuseWhen.join(' '), /inventó volumen/);
  assert.match(article.referencePattern, /Artículo eLocator/);
  assert.match(cochrane.referenceTemplate, /Año\(número de edición\), Artículo CD/);
  assert.ok(cochrane.requiredMetadata.includes('número de artículo CD'));
  assert.match(upToDate.referenceTemplate, /En E\. Editor \(Ed\.\), UpToDate/);
  assert.ok(upToDate.requiredMetadata.includes('editor acreditado'));
});

test('APA 7 generic newspaper template distinguishes print pages from online URLs', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const newspaper = JSON.parse((await handler({ topic: 'reference', sourceType: 'newspaper-article' })).content[0].text);
  assert.match(newspaper.template, /p\. x o pp\. xx–xx para versión impresa/);
  assert.match(newspaper.template, /URL para versión en línea/);
});

test('APA 7 no-source rule produces an in-text personal communication only', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const result = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'no-source' })).content[0].text).referenceRule;
  assert.match(result.referencePattern, /Sin entrada en referencias/);
  assert.match(result.citationImpact.join(' '), /comunicación personal/);
});

test('APA 7 author rules preserve 20 versus 21 author behavior', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const authors = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'author-element-format' })).content[0].text).referenceRule;
  assert.match(authors.rules.join(' '), /hasta 20 autores incluye todos/);
  assert.match(authors.rules.join(' '), /primeros 19/);
  assert.match(authors.refuseWhen.join(' '), /et al\./);
});

test('APA 7 date rules limit retrieval dates to changing unarchived works', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const retrieval = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'retrieval-date' })).content[0].text).referenceRule;
  const noDate = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'no-date' })).content[0].text).referenceRule;
  const dateDefinition = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'date-definition' })).content[0].text).referenceRule;
  assert.match(retrieval.rules.join(' '), /La mayoría de referencias no lleva/);
  assert.match(retrieval.rules.join(' '), /versiones estables archivadas/);
  assert.match(noDate.referencePattern, /\(s\. f\.\)/);
  assert.match(dateDefinition.rules.join(' '), /artículos de revista científica usa solo el año/);
  assert.match(dateDefinition.rules.join(' '), /magazines y periódicos/);
});

test('APA 7 title rules distinguish independent works from parts of a whole', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const title = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'title-element-format' })).content[0].text).referenceRule;
  const noTitle = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'no-title' })).content[0].text).referenceRule;
  assert.match(title.rules.join(' '), /no lleva cursiva ni comillas/);
  assert.match(title.rules.join(' '), /obra independiente/);
  assert.match(noTitle.referencePattern, /\[Descripción de la obra y medio\]/);
});

test('APA 7 reference rules do not confuse online access with webpage category', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const web = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'web-category-last-resort' })).content[0].text).referenceRule;
  const medium = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'online-versus-print' })).content[0].text).referenceRule;
  assert.match(web.rules.join(' '), /solo si no encaja mejor/);
  assert.match(web.rules.join(' '), /informe gubernamental/);
  assert.match(medium.rules.join(' '), /misma plantilla/);
});

test('APA 7 missing-data rule changes both the reference and its citation', async () => {
  let handler: any;
  registerAcademicTools({ registerTool(_n: string, _c: unknown, h: unknown) { handler = h; } } as any);
  const missing = JSON.parse((await handler({ topic: 'reference', referenceRuleId: 'four-reference-elements' })).content[0].text).referenceRule;
  assert.match(missing.rules.join(' '), /Sin autor/);
  assert.match(missing.rules.join(' '), /Sin fecha/);
  assert.match(missing.rules.join(' '), /Sin título/);
  assert.match(missing.citationImpact.join(' '), /\[Descripción de la obra\]/);
  assert.match(missing.refuseWhen.join(' '), /fabricar una entrada/);
});
