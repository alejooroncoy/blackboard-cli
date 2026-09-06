import { z } from 'zod';

export const bookCaseId = z.enum([
  'book-author-doi',
  'book-author-no-doi-database-or-print',
  'book-author-electronic-public-url',
  'book-author-editor-on-cover',
  'book-edited-doi-multiple-publishers',
  'book-edited-no-doi-database-or-print',
  'book-edited-electronic-public-url',
  'book-other-language',
  'book-translated-republication',
  'book-republished',
  'book-multivolume-single-volume',
  'book-in-series',
  'diagnostic-manual',
  'dictionary-thesaurus-encyclopedia',
  'anthology',
  'religious-work',
  'ancient-greek-roman-work',
  'shakespeare-work',
]);

export type BookCaseId = z.infer<typeof bookCaseId>;

export interface Apa7VerifiedBookCase {
  id: BookCaseId;
  label: string;
  manualExample: number;
  manualSection: '10.2';
  manualPrintedPages: string;
  status: 'verified';
  requiredMetadata: string[];
  referenceTemplate: string;
  parentheticalCitation: string;
  narrativeCitation: string;
  rules: string[];
  refuseWhen: string[];
}

const base = {
  manualSection: '10.2' as const,
  status: 'verified' as const,
  parentheticalCitation: '(Autor, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores',
  narrativeCitation: 'Autor (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores',
  refuseWhen: [
    'No se verificó el autor, editor o entidad responsable.',
    'La edición, volumen, traducción, narración o fecha original fue inferida.',
    'Se añadió una editorial, DOI, URL o fecha de recuperación inexistente.',
  ],
};

const completeAuthorList = 'Un autor: Autor, A. A.; dos: Autor, A. A., & Autor, B. B.; de 3 a 20: Autor, A. A., Autor, B. B., Autor, C. C., …, & Autor final, Z. Z. (incluye todos); 21 o más: autores 1–19, …, Último autor';
const completeAuthorRule = 'Incluye la lista completa de autores en el orden acreditado conforme a los límites del elemento autor de APA.';
const completeEditorList = 'Un editor: Editor, E. E. (Ed.); dos: Editor, E. E., & Editor, F. F. (Eds.); de 3 a 20: Editor, E. E., Editor, F. F., Editor, G. G., …, & Editor final, Z. Z. (Eds.; incluye todos); 21 o más: editores 1–19, …, Último editor (Eds.)';
const completeTranslatorList = 'Un traductor: T. Traductor (Trad.); dos: T. Traductor & U. Traductor (Trads.); de 3 a 20: T. Traductor, U. Traductor, V. Traductor, …, & Traductor final (Trads.; incluye todos); 21 o más: traductores 1–19, …, Último traductor (Trads.)';
const titlePositionEditors = 'Un editor: E. E. Editor, Ed.; dos: E. E. Editor & F. F. Editor, Eds.; de 3 a 20: E. E. Editor, F. F. Editor, G. G. Editor, …, & Z. Z. Editor final, Eds.; 21 o más: editores 1–19, …, Último editor, Eds.';
const titlePositionTranslators = 'Un traductor: T. Traductor, Trad.; dos: T. Traductor & U. Traductor, Trads.; de 3 a 20: T. Traductor, U. Traductor, V. Traductor, …, & Traductor final, Trads.; 21 o más: traductores 1–19, …, Último traductor, Trads.';

export const bookCases: Record<BookCaseId, Apa7VerifiedBookCase> = {
  'book-author-doi': {
    ...base, id: 'book-author-doi', label: 'Libro de autor con DOI', manualExample: 20, manualPrintedPages: '327',
    requiredMetadata: ['autores', 'año', 'título', 'edición desde la segunda', 'editorial', 'DOI verificado'],
    referenceTemplate: `${completeAuthorList} (Año). Título del libro (edición, solo desde la segunda). Editorial. https://doi.org/xxxxx`,
    rules: [completeAuthorRule, 'La edición se incluye desde la segunda; omite todo el paréntesis para la primera.', 'El DOI se expresa como URL.'],
  },
  'book-author-no-doi-database-or-print': {
    ...base, id: 'book-author-no-doi-database-or-print', label: 'Libro de autor sin DOI, de base académica común o impreso', manualExample: 21, manualPrintedPages: '327',
    requiredMetadata: ['autores', 'año', 'título', 'edición desde la segunda', 'editorial'],
    referenceTemplate: `${completeAuthorList} (Año). Título del libro (edición, solo desde la segunda). Editorial.`,
    rules: [completeAuthorRule, 'La edición se incluye desde la segunda; omite todo el paréntesis para la primera.', 'No incluye nombre ni URL de la base de datos.'],
  },
  'book-author-electronic-public-url': {
    ...base, id: 'book-author-electronic-public-url', label: 'Libro electrónico o audiolibro de autor sin DOI con URL pública', manualExample: 22, manualPrintedPages: '327-328',
    requiredMetadata: ['autores', 'año', 'título', 'edición desde la segunda', 'editorial', 'URL pública', 'narrador y formato solo si son relevantes'],
    referenceTemplate: `Libro electrónico: ${completeAuthorList} (Año). Título del libro (edición, solo desde la segunda). Editorial. URL. Audiolibro: ${completeAuthorList} (Año). Título del libro (N. Narrador, Narr.; edición, solo desde la segunda) [Audiolibro]. Editorial. URL`,
    rules: [completeAuthorRule, 'No incluye plataforma o dispositivo cuando el contenido coincide con el libro.', 'Incluye la edición desde la segunda; omite todo el paréntesis de edición para la primera.', 'Incluye narrador y [Audiolibro] únicamente cuando la versión consultada es un audiolibro; omite ambos en un libro electrónico ordinario.'],
  },
  'book-author-editor-on-cover': {
    ...base, id: 'book-author-editor-on-cover', label: 'Libro de autor con editor acreditado en portada', manualExample: 23, manualPrintedPages: '328',
    requiredMetadata: ['autor', 'año', 'título', 'editor acreditado', 'editorial'],
    referenceTemplate: `${completeAuthorList} (Año). Título del libro (E. Editor, Ed.). Editorial.`,
    rules: ['El autor, no el editor, determina la cita.', 'El editor aparece entre paréntesis después del título.'],
  },
  'book-edited-doi-multiple-publishers': {
    ...base, id: 'book-edited-doi-multiple-publishers', label: 'Libro editado con DOI y varias editoriales', manualExample: 24, manualPrintedPages: '328',
    requiredMetadata: ['editores', 'año', 'título', 'editoriales en orden', 'DOI'],
    referenceTemplate: `${completeEditorList}. (Año). Título del libro. Editorial 1; Editorial 2. DOI`,
    parentheticalCitation: '(Editor, Año); (Editor & Editor, Año); (Primer editor et al., Año) con tres o más editores', narrativeCitation: 'Editor (Año); Editor y Editor (Año); Primer editor et al. (Año) con tres o más editores',
    rules: ['Incluye la lista completa de editores y usa (Ed.) para uno o (Eds.) para varios.', 'Separa editoriales con punto y coma y conserva su orden.'],
  },
  'book-edited-no-doi-database-or-print': {
    ...base, id: 'book-edited-no-doi-database-or-print', label: 'Libro editado sin DOI, de base académica común o impreso', manualExample: 25, manualPrintedPages: '328',
    requiredMetadata: ['editores', 'año', 'título', 'editorial'],
    referenceTemplate: `${completeEditorList}. (Año). Título del libro. Editorial.`,
    parentheticalCitation: '(Editor, Año); (Editor & Editor, Año); (Primer editor et al., Año) con tres o más editores', narrativeCitation: 'Editor (Año); Editor y Editor (Año); Primer editor et al. (Año) con tres o más editores',
    rules: ['Incluye la lista completa de editores y usa (Ed.) para uno o (Eds.) para varios.', 'No incluye nombre ni URL de la base de datos.'],
  },
  'book-edited-electronic-public-url': {
    ...base, id: 'book-edited-electronic-public-url', label: 'Libro electrónico o audiolibro editado sin DOI con URL pública', manualExample: 26, manualPrintedPages: '328',
    requiredMetadata: ['editores', 'año', 'título', 'editorial', 'URL pública', 'formato si corresponde'],
    referenceTemplate: `${completeEditorList}. (Año). Título del libro [Formato, solo si corresponde]. Editorial. URL`,
    parentheticalCitation: '(Editor, Año); (Editor & Editor, Año); (Primer editor et al., Año) con tres o más editores', narrativeCitation: 'Editor (Año); Editor y Editor (Año); Primer editor et al. (Año) con tres o más editores',
    rules: ['Incluye la lista completa de editores y usa (Ed.) para uno o (Eds.) para varios.', 'No incluye la URL de una base de datos académica común.'],
  },
  'book-other-language': {
    ...base, id: 'book-other-language', label: 'Libro en otro idioma', manualExample: 27, manualPrintedPages: '329',
    requiredMetadata: ['autores', 'año', 'título original', 'traducción del título si el idioma difiere', 'volumen/edición si existe', 'editorial'],
    referenceTemplate: `${completeAuthorList} (Año). Título original [Traducción del título, solo si el idioma difiere] (volumen/edición, solo si existe). Editorial.`,
    rules: [completeAuthorRule, 'Añade la traducción del título entre corchetes cuando el idioma difiere del trabajo; omite los corchetes si no corresponde.', 'Omite por completo el paréntesis de volumen o edición cuando ninguno existe.'],
  },
  'book-translated-republication': {
    ...base, id: 'book-translated-republication', label: 'Libro reeditado en traducción', manualExample: 28, manualPrintedPages: '329',
    requiredMetadata: ['autores', 'año original', 'año de reedición', 'título', 'traductores', 'edición', 'editorial'],
    referenceTemplate: `${completeAuthorList} (Año reedición). Título (${titlePositionTranslators}; edición, solo desde la segunda). Editorial. (Obra original publicada en Año original)`,
    parentheticalCitation: '(Autor, Año original/Año reedición); (Autor & Autor, Año original/Año reedición); (Primer autor et al., Año original/Año reedición) con tres o más autores', narrativeCitation: 'Autor (Año original/Año reedición); Autor y Autor (Año original/Año reedición); Primer autor et al. (Año original/Año reedición) con tres o más autores',
    rules: [completeAuthorRule, 'Conserva la lista completa de traductores acreditados y usa (Trad.) para uno o (Trads.) para varios.', 'Conserva ambos años en la cita.'],
  },
  'book-republished': {
    ...base, id: 'book-republished', label: 'Libro, libro electrónico o audiolibro reeditado', manualExample: 29, manualPrintedPages: '329',
    requiredMetadata: ['autor', 'año original', 'año de reedición', 'título', 'editor/traductor/narrador si aplica', 'formato si aplica', 'editorial', 'DOI/URL si corresponde'],
    referenceTemplate: `${completeAuthorList} (Año reedición). Título (responsable, función, solo si se acredita) [Formato, solo si aplica]. Editorial. (Obra original publicada en Año original). Añade DOI/URL solo si corresponde al final.`,
    parentheticalCitation: '(Autor, Año original/Año reedición); (Autor & Autor, Año original/Año reedición); (Primer autor et al., Año original/Año reedición) con tres o más autores', narrativeCitation: 'Autor (Año original/Año reedición); Autor y Autor (Año original/Año reedición); Primer autor et al. (Año original/Año reedición) con tres o más autores',
    rules: ['Describe la versión efectivamente consultada.', 'Omite el paréntesis de responsable, los corchetes de formato y el localizador cuando esos elementos no correspondan.', 'Un audiolibro publicado en año diferente se trata como reedición.'],
  },
  'book-multivolume-single-volume': {
    ...base, id: 'book-multivolume-single-volume', label: 'Volumen de una obra de varios volúmenes', manualExample: 30, manualPrintedPages: '329',
    requiredMetadata: ['autores o editores del volumen', 'año', 'título general', 'número de volumen', 'título propio del volumen si existe', 'edición', 'editorial', 'DOI/URL'],
    referenceTemplate: `${completeAuthorList} (Año). Título general (edición, Vol. x) o Título general: Vol. x. Título del volumen. Editorial. DOI/URL; si el volumen se acredita a editores: ${completeEditorList}. (Año). Título y demás elementos.`,
    parentheticalCitation: '(Autor/Editor, Año); (Autor/Editor & Autor/Editor, Año); (Primer autor/editor et al., Año) con tres o más responsables', narrativeCitation: 'Autor/Editor (Año); Autor/Editor y Autor/Editor (Año); Primer autor/editor et al. (Año) con tres o más responsables',
    rules: [completeAuthorRule, 'Si el volumen no tiene título propio, el número va entre paréntesis sin cursiva.', 'Si tiene título propio, número y título siguen al título general.', 'Cuando el volumen se acredita a editores, incluye la lista completa en posición de autor y añade (Ed.) o (Eds.) según corresponda.'],
  },
  'book-in-series': {
    ...base, id: 'book-in-series', label: 'Libro perteneciente a una serie', manualExample: 31, manualPrintedPages: '329-330',
    requiredMetadata: ['autor', 'año', 'título', 'edición', 'editorial', 'DOI/URL'],
    referenceTemplate: `${completeAuthorList} (Año). Título del libro (edición, solo desde la segunda). Editorial. DOI/URL`,
    rules: ['Omite todo el paréntesis de edición para la primera edición.', 'No incluye el título de una serie de obras conceptualmente relacionadas.'],
  },
  'diagnostic-manual': {
    ...base, id: 'diagnostic-manual', label: 'Manual de diagnóstico (DSM, CIE)', manualExample: 32, manualPrintedPages: '330',
    requiredMetadata: ['autor grupal', 'año', 'título completo', 'edición', 'abreviatura si se usará', 'DOI/URL'],
    referenceTemplate: 'Entidad. (Año). Título completo del manual (edición, solo desde la segunda). DOI/URL',
    parentheticalCitation: '(Entidad, Año)', narrativeCitation: 'Entidad (Año)',
    rules: ['Si autor y editorial son iguales, omite la editorial.', 'La edición se incluye desde la segunda; omite todo el paréntesis para la primera.', 'Título, edición y abreviatura pueden introducirse en la primera mención del texto, pero no se abrevian en referencias.', 'Después de introducir el manual, repite la cita solo cuando sustenta directamente una afirmación.'],
  },
  'dictionary-thesaurus-encyclopedia': {
    ...base, id: 'dictionary-thesaurus-encyclopedia', label: 'Diccionario, tesauro o enciclopedia completos', manualExample: 33, manualPrintedPages: '330-331',
    requiredMetadata: ['autor grupal o editor', 'fecha o s. f.', 'título', 'edición/versión', 'editorial si corresponde', 'DOI/URL si existe', 'fecha de recuperación si cambia sin archivo'],
    referenceTemplate: `Con DOI/URL: Autor grupal. (Fecha o s. f.). Título de la obra (edición/versión). Editorial. DOI/URL; si se acredita a editores: ${completeEditorList}. (Fecha o s. f.). Título y demás elementos. Impreso o base académica común sin localizador: Autor grupal. (Fecha o s. f.). Título de la obra (edición/versión). Editorial. Añade fecha de recuperación solo si cambia sin archivo.`,
    parentheticalCitation: '(Autor/Editor, Fecha); (Autor/Editor & Autor/Editor, Fecha); (Primer autor/editor et al., Fecha) con tres o más responsables', narrativeCitation: 'Autor/Editor (Fecha); Autor/Editor y Autor/Editor (Fecha); Primer autor/editor et al. (Fecha) con tres o más responsables',
    rules: ['Distingue el autor grupal de los editores; para estos últimos incluye la lista completa y añade (Ed.) o (Eds.).', 'Omite DOI/URL en una obra impresa o de base académica común sin localizador.', 'Usa s. f. y fecha de recuperación para obras actualizadas continuamente sin versiones archivadas.', 'Omite fecha de recuperación para versiones estables o archivadas.'],
  },
  anthology: {
    ...base, id: 'anthology', label: 'Antología completa', manualExample: 34, manualPrintedPages: '331',
    requiredMetadata: ['editores de la antología', 'año de la antología', 'título', 'editorial', 'DOI/URL'],
    referenceTemplate: `${completeEditorList}. (Año). Título de la antología. Editorial. DOI/URL`,
    parentheticalCitation: '(Editor, Año); (Editor & Editor, Año); (Primer editor et al., Año) con tres o más editores', narrativeCitation: 'Editor (Año); Editor y Editor (Año); Primer editor et al. (Año) con tres o más editores',
    rules: ['Incluye la lista completa de editores y usa (Ed.) para uno o (Eds.) para varios.', 'Para una obra individual incluida en la antología se utiliza el caso de capítulo/obra incluida, no esta referencia global.'],
  },
  'religious-work': {
    ...base, id: 'religious-work', label: 'Obra religiosa', manualExample: 35, manualPrintedPages: '331',
    requiredMetadata: ['título de la obra', 'año de versión', 'traductores/edición si existen', 'editorial o URL', 'año original si corresponde'],
    referenceTemplate: 'Título de la obra. (Año de versión). Editorial/URL; con traductor: Título de la obra. (Año de versión). (T. Traductor, Trad.). Editorial/URL; con edición: Título de la obra. (Año de versión). (2.ª ed.). Editorial/URL; con ambos: Título de la obra. (Año de versión). (T. Traductor, Trad.; 2.ª ed.). Editorial/URL. Añade (Obra original publicada en Año original) solo cuando ese año se conoce y corresponde.',
    parentheticalCitation: '(*Título*, Año versión) si no corresponde un año original; (*Título*, Año original/Año versión) cuando ambos años están verificados', narrativeCitation: '*Título* (Año versión) si no corresponde un año original; *Título* (Año original/Año versión) cuando ambos años están verificados',
    rules: ['El título ocupa la posición de autor cuando no hay autor.', 'Omite el traductor, la edición o todo el paréntesis cuando esos datos no existan.', 'No inventes un año original: usa solo el año de la versión cuando el original sea desconocido o inaplicable.', 'Para libro, versículo o pasaje se añade el localizador canónico en el texto.'],
  },
  'ancient-greek-roman-work': {
    ...base, id: 'ancient-greek-roman-work', label: 'Obra griega o romana antigua', manualExample: 36, manualPrintedPages: '331',
    requiredMetadata: ['autor clásico', 'año de la versión consultada', 'título', 'traductor/editor', 'editorial/URL', 'fecha original o aproximada'],
    referenceTemplate: 'Con traductor: Autor. (Año versión). Título (T. Traductor, Trad.). Editorial/URL. Con editor: Autor. (Año versión). Título (E. Editor, Ed.). Editorial/URL. (Obra original publicada en Año antiguo exacto) o (Obra original publicada ca. Año antiguo aproximado)',
    parentheticalCitation: '(Autor, Año original/Año versión) si la fecha original es exacta; (Autor, ca. Año original/Año versión) si es aproximada', narrativeCitation: 'Autor (Año original/Año versión) si la fecha original es exacta; Autor (ca. Año original/Año versión) si es aproximada',
    rules: ['Usa (Trad.) si la edición acredita un traductor o (Ed.) si acredita un editor; no cambies el rol acreditado.', 'Usa ca. únicamente cuando la fecha original es aproximada; omítelo ante una fecha exacta verificada.', 'Las partes canónicas requieren su localizador propio en la cita.'],
  },
  'shakespeare-work': {
    ...base, id: 'shakespeare-work', label: 'Obra de Shakespeare u otra obra clásica con edición moderna', manualExample: 37, manualPrintedPages: '331',
    requiredMetadata: ['autor', 'año de edición consultada', 'título', 'editores/traductores', 'editorial', 'año original'],
    referenceTemplate: `Con editor: Autor. (Año edición). Título (${titlePositionEditors}). Editorial. Con traductor: Autor. (Año edición). Título (${titlePositionTranslators}). Editorial. (Obra original publicada en Año original)`,
    parentheticalCitation: '(Autor, Año original/Año edición)', narrativeCitation: 'Autor (Año original/Año edición)',
    rules: ['Conserva la lista completa de editores o traductores acreditados; usa (Ed.)/(Eds.) o (Trad.)/(Trads.) según corresponda, sin cambiar el rol acreditado.', 'Acto, escena, línea o pasaje se añade como localizador al citar una parte.'],
  },
};

export function getBookCase(id: BookCaseId): Apa7VerifiedBookCase {
  return bookCases[id];
}
