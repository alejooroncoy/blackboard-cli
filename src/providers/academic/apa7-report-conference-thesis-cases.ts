import { z } from 'zod';

export const reportConferenceThesisCaseId = z.enum([
  'report-government-or-organization',
  'report-individual-authors-in-organization',
  'report-series',
  'report-working-group',
  'annual-report',
  'code-of-ethics',
  'grant-award',
  'issue-brief',
  'policy-brief',
  'press-release',
  'conference-session',
  'conference-paper-presentation',
  'conference-poster-presentation',
  'symposium-contribution',
  'thesis-unpublished',
  'thesis-database',
  'thesis-online-not-database',
]);

export type ReportConferenceThesisCaseId = z.infer<typeof reportConferenceThesisCaseId>;

export interface Apa7VerifiedReportConferenceThesisCase {
  id: ReportConferenceThesisCaseId;
  label: string;
  manualExample: number;
  manualSection: '10.4' | '10.5' | '10.6';
  manualPrintedPages: string;
  status: 'verified';
  requiredMetadata: string[];
  referenceTemplate: string;
  parentheticalCitation: string;
  narrativeCitation: string;
  rules: string[];
  refuseWhen: string[];
}

const shared = {
  status: 'verified' as const,
  parentheticalCitation: '(Autor o entidad, Año)',
  narrativeCitation: 'Autor o entidad (Año)',
  refuseWhen: [
    'No se verificó el autor personal, grupal o el responsable principal.',
    'Se infirieron fecha, tipo de documento, institución, número o estado de publicación.',
    'Se añadió un DOI, URL, repositorio, base de datos o ubicación inexistente.',
  ],
};

const reportBase = { ...shared, manualSection: '10.4' as const };
const conferenceBase = { ...shared, manualSection: '10.5' as const };
const completeContributionAuthors = 'Un autor: Autor, A. A.; dos: Autor, A. A., & Autor, B. B.; de 3 a 20: Autor, A. A., Autor, B. B., Autor, C. C., …, & Autor final, Z. Z. (incluye todos); 21 o más: autores 1–19, …, Último autor';
const completeSessionContributors = 'Un ponente: Ponente, A. A.; dos: Ponente, A. A., & Ponente, B. B.; de 3 a 20: Ponente, A. A., Ponente, B. B., Ponente, C. C., …, & Ponente final, Z. Z. (incluye todos); 21 o más: ponentes 1–19, …, Último ponente';
const completeGroupAuthors = 'Una entidad: Entidad autora; dos: Entidad autora, & Entidad autora; de 3 a 20: Entidad autora, Entidad autora, Entidad autora, …, & Entidad autora final (incluye todas); 21 o más: entidades autoras 1–19, …, Última entidad autora';
const thesisBase = { ...shared, manualSection: '10.6' as const, parentheticalCitation: '(Autor, Año)', narrativeCitation: 'Autor (Año)' };

export const reportConferenceThesisCases: Record<ReportConferenceThesisCaseId, Apa7VerifiedReportConferenceThesisCase> = {
  'report-government-or-organization': {
    ...reportBase, id: 'report-government-or-organization', label: 'Reporte de agencia gubernamental u otra organización', manualExample: 50, manualPrintedPages: '335-336',
    requiredMetadata: ['autor o autores grupales exactos', 'año', 'título', 'número de reporte si existe', 'organismo superior/editorial si corresponde', 'URL/DOI'],
    referenceTemplate: `${completeGroupAuthors}. (Año). Con número: Título del reporte (N.º de reporte x). Organismo superior si no figura en el autor. Añade DOI/URL solo si existe. Sin número: Título del reporte. Organismo superior si no figura en el autor. Impreso o base académica común sin localizador: termina en el organismo superior o en el título.`,
    parentheticalCitation: '(Entidad, Año); (Entidad & Entidad, Año); (Primera entidad et al., Año) con tres o más entidades autoras', narrativeCitation: 'Entidad (Año); Entidad y Entidad (Año); Primera entidad et al. (Año) con tres o más entidades autoras',
    rules: ['Incluye todas las agencias coautoras en el orden acreditado.', 'Si autor y editorial son la misma entidad, omite la editorial.', 'Si un organismo superior no aparece en el nombre del autor grupal, inclúyelo como fuente.', 'Une dos agencias autoras con &; separa tres o más con comas y & antes de la última.', 'Omite el paréntesis de número cuando el reporte no tiene uno y el DOI/URL cuando no existe un localizador aplicable.'],
  },
  'report-individual-authors-in-organization': {
    ...reportBase, id: 'report-individual-authors-in-organization', label: 'Reporte de autores individuales en una organización', manualExample: 51, manualPrintedPages: '336',
    requiredMetadata: ['autores personales', 'año', 'título', 'agencia u organización editora', 'DOI o URL pública si corresponde'],
    referenceTemplate: `${completeContributionAuthors} (Año). Título del reporte. Agencia u organización. Con DOI: añade DOI al final. Con URL pública sin DOI: añade URL al final. Impreso o base académica común sin localizador: termina en la organización.`,
    parentheticalCitation: '(Autor, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores', narrativeCitation: 'Autor (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores',
    rules: ['Incluye la lista completa de autores personales en el orden acreditado; la organización aparece como fuente.', 'Prefiere DOI; usa URL pública si no hay DOI y omite ambos en una versión impresa o base académica común sin localizador.'],
  },
  'report-series': {
    ...reportBase, id: 'report-series', label: 'Reporte de autores individuales publicado en una serie', manualExample: 52, manualPrintedPages: '336',
    requiredMetadata: ['autores', 'año', 'título', 'nombre/número de serie o fascículo', 'organización', 'DOI o URL pública si corresponde'],
    referenceTemplate: `${completeContributionAuthors} (Año). Título del reporte (Nombre de la serie y número/fascículo). Organización. Con DOI: añade DOI al final. Con URL pública sin DOI: añade URL al final. Impreso o base académica común sin localizador: termina en la organización.`,
    parentheticalCitation: '(Autor, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores', narrativeCitation: 'Autor (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores',
    rules: ['Incluye la lista completa de autores en el orden acreditado.', 'La información identificadora de la serie se coloca entre paréntesis después del título.', 'Prefiere DOI; usa URL pública si no hay DOI y omite ambos en una versión impresa o base académica común sin localizador.'],
  },
  'report-working-group': {
    ...reportBase, id: 'report-working-group', label: 'Reporte de grupo de trabajo u otro grupo', manualExample: 53, manualPrintedPages: '336',
    requiredMetadata: ['nombre completo del grupo de trabajo', 'año', 'título', 'organización matriz si corresponde', 'DOI o URL pública si corresponde'],
    referenceTemplate: 'Nombre del grupo de trabajo. (Año). Título del reporte. Organización matriz, solo si corresponde. Con DOI: añade DOI al final. Con URL pública sin DOI: añade URL al final. Impreso o base académica común sin localizador: termina en la organización o título.',
    parentheticalCitation: '(Nombre del grupo, Año)', narrativeCitation: 'Nombre del grupo (Año)',
    rules: ['Conserva las mayúsculas del nombre propio del grupo dondequiera que aparezca.', 'No sustituye el grupo específico por la organización matriz.', 'Omite la organización matriz cuando no corresponda como fuente separada.', 'Prefiere DOI; usa URL pública si no hay DOI y omite ambos en una versión impresa o base académica común sin localizador.'],
  },
  'annual-report': {
    ...reportBase, id: 'annual-report', label: 'Reporte anual', manualExample: 54, manualPrintedPages: '336-337',
    requiredMetadata: ['entidad autora', 'año', 'título del reporte anual', 'DOI o URL pública si corresponde'],
    referenceTemplate: 'Entidad. (Año). Título del reporte anual. Con DOI: añade DOI al final. Con URL pública sin DOI: añade URL al final. Impreso o base académica común sin localizador: termina en el título.',
    parentheticalCitation: '(Entidad, Año)', narrativeCitation: 'Entidad (Año)',
    rules: ['Omite la editorial cuando es idéntica a la entidad autora.', 'Prefiere DOI; usa URL pública si no hay DOI y omite ambos en una versión impresa o base académica común sin localizador.'],
  },
  'code-of-ethics': {
    ...reportBase, id: 'code-of-ethics', label: 'Código de ética', manualExample: 55, manualPrintedPages: '337',
    requiredMetadata: ['entidad autora', 'año o fecha de la versión', 'título exacto', 'URL'],
    referenceTemplate: 'Entidad. (Año). Título del código de ética. URL',
    parentheticalCitation: '(Entidad, Año)', narrativeCitation: 'Entidad (Año)',
    rules: ['No repite la entidad como editorial cuando autor y editorial coinciden.', 'Usa la fecha correspondiente a la versión consultada.'],
  },
  'grant-award': {
    ...reportBase, id: 'grant-award', label: 'Subvención concedida', manualExample: 56, manualPrintedPages: '337',
    requiredMetadata: ['investigador principal', 'años inicial-final', 'título del proyecto', 'número de proyecto/subvención', 'entidad financiadora', 'URL recuperable'],
    referenceTemplate: 'Autor, A. A. (Investigador principal). (Año inicial–Año final). Título del proyecto (Proyecto N.º xxx) [Subvención]. Entidad financiadora. URL',
    parentheticalCitation: '(Autor, Año inicial–Año final)', narrativeCitation: 'Autor (Año inicial–Año final)',
    rules: ['Incluye el rol de investigador principal tras el nombre.', 'Usa la terminología oficial —número de proyecto o de subvención— y colócala entre paréntesis.', 'Una solicitud de subvención no recuperable se describe en la metodología y no se incluye en referencias.'],
  },
  'issue-brief': {
    ...reportBase, id: 'issue-brief', label: 'Informe temático (issue brief)', manualExample: 57, manualPrintedPages: '337',
    requiredMetadata: ['autor', 'año', 'título', 'número si existe', 'organización', 'DOI o URL pública si corresponde'],
    referenceTemplate: 'Con número: Autor, A. A. (Año). Título (Informe temático N.º x). Organización. Sin número: Autor, A. A. (Año). Título [Informe temático]. Organización. En ambos: añade DOI al final si existe; si no, URL pública cuando corresponda; impreso o base académica común sin localizador termina en la organización.',
    rules: ['Si tiene número, identifícalo entre paréntesis.', 'Si no tiene número, añade [Informe temático] después del título.', 'Prefiere DOI; usa URL pública si no hay DOI y omite ambos en una versión impresa o base académica común sin localizador.'],
  },
  'policy-brief': {
    ...reportBase, id: 'policy-brief', label: 'Informe de políticas', manualExample: 58, manualPrintedPages: '337',
    requiredMetadata: ['autor', 'año', 'título', 'organización', 'DOI o URL pública si corresponde'],
    referenceTemplate: 'Autor, A. A. (Año). Título [Informe de políticas]. Organización. Con DOI: añade DOI al final. Con URL pública sin DOI: añade URL al final. Impreso o base académica común sin localizador: termina en la organización.',
    rules: ['La descripción [Informe de políticas] aparece inmediatamente después del título.'],
  },
  'press-release': {
    ...reportBase, id: 'press-release', label: 'Comunicado de prensa', manualExample: 59, manualPrintedPages: '337',
    requiredMetadata: ['entidad o autor', 'fecha completa', 'título', 'URL'],
    referenceTemplate: 'Entidad. (Año, día de mes). Título [Comunicado de prensa]. URL',
    parentheticalCitation: '(Entidad, Año)', narrativeCitation: 'Entidad (Año)',
    rules: ['Incluye la fecha completa y la descripción [Comunicado de prensa].'],
  },
  'conference-session': {
    ...conferenceBase, id: 'conference-session', label: 'Sesión de congreso', manualExample: 60, manualPrintedPages: '338',
    requiredMetadata: ['todos los ponentes/contribuyentes', 'fechas completas del congreso', 'título', 'nombre del congreso', 'ubicación', 'DOI/URL si existe'],
    referenceTemplate: `${completeSessionContributors} (Mismo mes: Año, día–día de mes; meses distintos: Año, día de mes–día de mes; años distintos: Año, día de mes–Año, día de mes). Título [Sesión de congreso]. Nombre del congreso, Ciudad, región, país. Añade DOI/URL solo si existe.`,
    parentheticalCitation: '(Ponente, Año); (Ponente & Ponente, Año); (Primer ponente et al., Año) con tres o más ponentes', narrativeCitation: 'Ponente (Año); Ponente y Ponente (Año); Primer ponente et al. (Año) con tres o más ponentes',
    rules: ['Incluye la lista completa de personas acreditadas como contribuyentes, aunque no hayan estado físicamente presentes.', 'Usa las fechas del congreso completo y una ubicación verificable; repite mes y año en el segundo extremo cuando el rango los cruza.'],
  },
  'conference-paper-presentation': {
    ...conferenceBase, id: 'conference-paper-presentation', label: 'Presentación de escrito', manualExample: 61, manualPrintedPages: '338',
    requiredMetadata: ['todos los autores', 'fechas completas del congreso', 'título', 'nombre del congreso', 'ubicación', 'DOI/URL si existe'],
    referenceTemplate: `${completeContributionAuthors} (Mismo mes: Año, día–día de mes; meses distintos: Año, día de mes–día de mes; años distintos: Año, día de mes–Año, día de mes). Título [Presentación de escrito]. Nombre del congreso, Ciudad, región, país. Añade DOI/URL solo si existe.`,
    parentheticalCitation: '(Autor, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores', narrativeCitation: 'Autor (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores',
    rules: ['Incluye la lista completa de autores acreditados.', 'Conserva ambos meses y años de un rango de fechas cuando el congreso los cruza.', 'La etiqueta entre corchetes debe coincidir con la forma en que el congreso describió la presentación.'],
  },
  'conference-poster-presentation': {
    ...conferenceBase, id: 'conference-poster-presentation', label: 'Presentación de cartel', manualExample: 62, manualPrintedPages: '339',
    requiredMetadata: ['autores', 'fechas completas del congreso', 'título', 'nombre del congreso', 'ubicación', 'DOI/URL si existe'],
    referenceTemplate: `${completeContributionAuthors} (Mismo mes: Año, día–día de mes; meses distintos: Año, día de mes–día de mes; años distintos: Año, día de mes–Año, día de mes). Título [Presentación de cartel]. Nombre del congreso, Ciudad, región, país. Añade DOI/URL solo si existe.`,
    parentheticalCitation: '(Autor, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores', narrativeCitation: 'Autor (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores',
    rules: ['Incluye la lista completa de autores acreditados.', 'Conserva ambos meses y años de un rango de fechas cuando el congreso los cruza.', 'No usa el formato de artículo salvo que el trabajo esté publicado formalmente en actas o revista.'],
  },
  'symposium-contribution': {
    ...conferenceBase, id: 'symposium-contribution', label: 'Contribución en un simposio', manualExample: 63, manualPrintedPages: '339',
    requiredMetadata: ['autores de la contribución', 'fechas del congreso', 'título de la contribución', 'coordinadores', 'título del simposio', 'congreso', 'ubicación', 'DOI/URL si existe'],
    referenceTemplate: `${completeContributionAuthors} (Mismo mes: Año, día–día de mes; meses distintos: Año, día de mes–día de mes; años distintos: Año, día de mes–Año, día de mes). Título de la contribución. En C. Coordinador (Coordinador); C. Coordinador & D. Coordinador (Coordinadores); o C. Coordinador, D. Coordinador, & E. Coordinador (Coordinadores; conserva la lista completa si hay más), Título del simposio [Simposio]. Nombre del congreso, Ciudad, región, país. Añade DOI/URL solo si existe.`,
    parentheticalCitation: '(Autor, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores', narrativeCitation: 'Autor (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores',
    rules: ['Incluye la lista completa y ordenada de autores de la contribución conforme a los límites del elemento autor de APA.', 'Conserva ambos meses y años de un rango de fechas cuando el congreso los cruza.', 'Distingue autores de la contribución de coordinadores del simposio.', 'Incluye la lista completa de coordinadores y usa el rol plural cuando haya más de uno.', 'Las actas publicadas formalmente se referencian como artículo, libro editado o capítulo, según su publicación.'],
  },
  'thesis-unpublished': {
    ...thesisBase, id: 'thesis-unpublished', label: 'Disertación o tesis inédita', manualExample: 64, manualPrintedPages: '340',
    requiredMetadata: ['autor', 'año', 'título', 'tipo de tesis/disertación', 'institución que otorga el título'],
    referenceTemplate: 'Autor, A. A. (Año). Título [Disertación doctoral inédita o Tesis de maestría inédita]. Institución que otorga el título.',
    rules: ['Para una obra inédita, la institución aparece como fuente después de la descripción entre corchetes.', 'No inventa URL ni repositorio.'],
  },
  'thesis-database': {
    ...thesisBase, id: 'thesis-database', label: 'Disertación o tesis de una base de datos', manualExample: 65, manualPrintedPages: '340',
    requiredMetadata: ['autor', 'año', 'título', 'número de publicación si existe', 'tipo', 'institución', 'nombre de la base de datos'],
    referenceTemplate: 'Con número: Autor, A. A. (Año). Título (Publicación N.º xxx) [Disertación doctoral o Tesis de maestría, Institución]. Nombre de la base de datos. Sin número: Autor, A. A. (Año). Título [Disertación doctoral o Tesis de maestría, Institución]. Nombre de la base de datos.',
    rules: ['En una tesis publicada, la institución se incluye dentro de los corchetes después del título.', 'El número de publicación, si existe, precede a la descripción entre corchetes; omite todo ese paréntesis cuando no exista.'],
  },
  'thesis-online-not-database': {
    ...thesisBase, id: 'thesis-online-not-database', label: 'Disertación o tesis publicada en línea fuera de una base de datos', manualExample: 66, manualPrintedPages: '340',
    requiredMetadata: ['autor', 'año', 'título', 'tipo', 'institución', 'archivo o repositorio', 'URL'],
    referenceTemplate: 'Autor, A. A. (Año). Título [Tesis o disertación, Institución]. Nombre del archivo o repositorio. URL',
    rules: ['Distingue un repositorio o archivo institucional de una base de datos comercial.'],
  },
};

export function getReportConferenceThesisCase(id: ReportConferenceThesisCaseId): Apa7VerifiedReportConferenceThesisCase {
  return reportConferenceThesisCases[id];
}
