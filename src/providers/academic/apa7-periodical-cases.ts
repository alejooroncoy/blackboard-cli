import { z } from 'zod';

export const periodicalCaseId = z.enum([
  'journal-doi',
  'journal-no-doi-public-url',
  'journal-no-doi-database-or-print',
  'journal-21-plus-authors',
  'journal-individual-group-authors',
  'journal-elocator',
  'journal-advance-online',
  'journal-in-press',
  'journal-other-language',
  'journal-translated-republication',
  'journal-reprint',
  'journal-special-section-issue',
  'journal-cochrane',
  'journal-uptodate',
  'magazine-article',
  'newspaper-article',
  'blog-post',
  'periodical-comment',
  'periodical-editorial',
]);

export type PeriodicalCaseId = z.infer<typeof periodicalCaseId>;

export interface Apa7VerifiedCase {
  id: PeriodicalCaseId;
  label: string;
  manualExample: number;
  manualSection: '10.1';
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
  manualSection: '10.1' as const,
  status: 'verified' as const,
  parentheticalCitation: '(Autor, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores',
  narrativeCitation: 'Autor (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores',
  refuseWhen: [
    'No se verificó la identidad del autor o entidad.',
    'La fecha, el título o la publicación fueron completados por conjetura.',
    'Se presenta un DOI, URL, volumen, número, páginas o eLocator no encontrado en la fuente.',
  ],
};

const completeAuthorList = 'Un autor: Autor, A. A.; dos: Autor, A. A., & Autor, B. B.; de 3 a 20: Autor, A. A., Autor, B. B., Autor, C. C., …, & Autor final, Z. Z. (incluye todos); 21 o más: autores 1–19, …, Último autor';
const completeAuthorRule = 'Conserva la lista completa y ordenada de autores conforme a los límites del elemento autor de APA.';
const completePeriodicalEditors = 'Un editor: Editor, A. A. (Ed.); dos: Editor, A. A., & Editor, B. B. (Eds.); de 3 a 20: Editor, A. A., Editor, B. B., Editor, C. C., …, & Editor final, Z. Z. (Eds.; incluye todos); 21 o más: editores 1–19, …, Último editor (Eds.)';
const completeTranslatorList = 'Un traductor: A. Traductor (Trad.); dos: A. Traductor & B. Traductor (Trads.); de 3 a 20: A. Traductor, B. Traductor, C. Traductor, …, & Traductor final (Trads.; incluye todos); 21 o más: traductores 1–19, …, Último traductor (Trads.)';
const titlePositionTranslators = 'Un traductor: A. Traductor, Trad.; dos: A. Traductor & B. Traductor, Trads.; de 3 a 20: A. Traductor, B. Traductor, C. Traductor, …, & Traductor final, Trads.; 21 o más: traductores 1–19, …, Último traductor, Trads.';

export const periodicalCases: Record<PeriodicalCaseId, Apa7VerifiedCase> = {
  'journal-doi': {
    ...base, id: 'journal-doi', label: 'Artículo de revista científica con DOI', manualExample: 1, manualPrintedPages: '323',
    requiredMetadata: ['autores', 'año', 'título del artículo', 'revista', 'volumen/número/páginas o eLocator si existen', 'DOI verificado'],
    referenceTemplate: `${completeAuthorList} (Año). Título del artículo. Con volumen, número y páginas/eLocator: Título de la revista, volumen(número), páginas o eLocator. Sin número: Título de la revista, volumen, páginas o eLocator. Sin volumen: Título de la revista, (número), páginas o eLocator. Sin volumen ni número: Título de la revista, páginas o eLocator; omite también páginas/eLocator si no existen. https://doi.org/xxxxx`,
    parentheticalCitation: '(Autor, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores', narrativeCitation: 'Autor (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores',
    rules: [completeAuthorRule, 'El DOI se expresa como URL https://doi.org/...', 'Se omiten los elementos que realmente no existen.'],
  },
  'journal-no-doi-public-url': {
    ...base, id: 'journal-no-doi-public-url', label: 'Artículo sin DOI con URL pública ajena a una base de datos', manualExample: 2, manualPrintedPages: '323',
    requiredMetadata: ['autores', 'año', 'título', 'revista', 'volumen/número/páginas o eLocator si existen', 'URL pública'],
    referenceTemplate: `${completeAuthorList} (Año). Título del artículo. Con volumen, número y páginas/eLocator: Título de la revista, volumen(número), páginas o eLocator. Sin número: Título de la revista, volumen, páginas o eLocator. Sin volumen: Título de la revista, (número), páginas o eLocator. Sin volumen ni número: Título de la revista, páginas o eLocator; omite también páginas/eLocator si no existen. URL`,
    rules: [completeAuthorRule, 'Omite por completo el paréntesis del número cuando la revista no lo tenga.', 'Incluye la URL del artículo únicamente cuando es recuperable públicamente y no es la URL de una base de datos.'],
  },
  'journal-no-doi-database-or-print': {
    ...base, id: 'journal-no-doi-database-or-print', label: 'Artículo sin DOI de una base académica común o impreso', manualExample: 3, manualPrintedPages: '323',
    requiredMetadata: ['autores', 'año de publicación', 'título', 'revista científica', 'volumen/número/páginas si existen'],
    referenceTemplate: `${completeAuthorList} (Año). Título del artículo. Título de la revista científica, volumen(número), páginas; sin número: Título de la revista científica, volumen, páginas; sin volumen: Título de la revista científica, (número), páginas; sin volumen ni número: Título de la revista científica, páginas; omite también las páginas si no existen.`,
    rules: [completeAuthorRule, 'Usa solo el año para un artículo de revista científica, aunque el número muestre mes o estación.', 'Omite volumen, número y páginas individualmente cuando la publicación no los proporcione.', 'No incluye el nombre de la base de datos ni su URL.'],
  },
  'journal-21-plus-authors': {
    ...base, id: 'journal-21-plus-authors', label: 'Artículo con 21 o más autores', manualExample: 4, manualPrintedPages: '323',
    requiredMetadata: ['lista completa y ordenada de autores', 'año', 'título', 'revista', 'volumen/número/páginas o eLocator si existen', 'DOI/URL si corresponde'],
    referenceTemplate: 'Autores 1-19, ... Último autor. (Año). Título. Con volumen, número y páginas/eLocator: Revista, volumen(número), páginas o eLocator. Sin número: Revista, volumen, páginas o eLocator. Sin volumen: Revista, (número), páginas o eLocator. Sin volumen ni número: Revista, páginas o eLocator; omite también páginas/eLocator si no existen. Con DOI: añade https://doi.org/xxxxx. Sin DOI con URL pública: añade URL. Impreso o base académica común sin localizador: termina en los datos periódicos disponibles.',
    parentheticalCitation: '(Primer autor et al., Año)', narrativeCitation: 'Primer autor et al. (Año)',
    rules: ['En la referencia incluye los primeros 19 autores, puntos suspensivos y el último autor.', 'No coloca & antes del último autor después de los puntos suspensivos.', 'Omite volumen, número y páginas/eLocator individualmente cuando no existan.', 'Prefiere DOI y exprésalo como URL completa https://doi.org/...; omite DOI o URL cuando la fuente no tenga un localizador aplicable.'],
  },
  'journal-individual-group-authors': {
    ...base, id: 'journal-individual-group-authors', label: 'Artículo con autores personales y grupales', manualExample: 5, manualPrintedPages: '323',
    requiredMetadata: ['lista única y ordenada de autores personales y grupales', 'año', 'título', 'revista', 'volumen/número/páginas o eLocator si existen', 'DOI o URL pública si corresponde'],
    referenceTemplate: 'Uno o dos responsables: conserva la lista única en el orden acreditado y usa & antes del último, incluso si es entidad. De 3 a 20: incluye todos en ese mismo orden, por ejemplo Nombre exacto del grupo, Autor personal, A. A., & Autor personal, B. B. Con 21 o más: responsables 1–19, …, Último responsable. (Año). Título. Con volumen, número y páginas/eLocator: Revista, volumen(número), páginas o eLocator. Sin número: Revista, volumen, páginas o eLocator. Sin volumen: Revista, (número), páginas o eLocator. Sin volumen ni número: Revista, páginas o eLocator; omite también páginas/eLocator si no existen. Con DOI: añade https://doi.org/xxxxx. Con URL pública sin DOI: añade URL. Impreso o base académica común sin localizador: termina en los datos periódicos disponibles.',
    parentheticalCitation: '(Primer responsable acreditado & Segundo responsable acreditado, Año) cuando hay dos autores totales; por ejemplo, (Nombre del grupo & Autor personal, Año) si ese es el orden acreditado. (Primer responsable acreditado et al., Año) cuando hay tres o más autores personales y grupales en total', narrativeCitation: 'Primer responsable acreditado y Segundo responsable acreditado (Año) cuando hay dos autores totales; por ejemplo, Nombre del grupo y Autor personal (Año) si ese es el orden acreditado. Primer responsable acreditado et al. (Año) cuando hay tres o más autores personales y grupales en total',
    rules: ['Conserva una sola lista de autores personales y grupales exactamente en el orden acreditado; no traslada una entidad al final.', 'Calcula la cita por el número total de autores personales y grupales y usa el primer responsable acreditado para et al.', 'Omite volumen, número y páginas/eLocator individualmente cuando no existan.', 'Prefiere DOI y exprésalo como URL completa https://doi.org/...; usa URL pública si no hay DOI y omite ambos en una versión impresa o base académica común sin localizador.'],
  },
  'journal-elocator': {
    ...base, id: 'journal-elocator', label: 'Artículo con eLocator', manualExample: 6, manualPrintedPages: '324',
    requiredMetadata: ['autores', 'año', 'título', 'revista', 'volumen/número si existen', 'eLocator', 'DOI o URL pública si corresponde'],
    referenceTemplate: `${completeAuthorList} (Año). Título. Con volumen y número: Revista, volumen(número), Artículo eLocator. Sin número: Revista, volumen, Artículo eLocator. Sin volumen: Revista, (número), Artículo eLocator. Sin volumen ni número: Revista, Artículo eLocator. Con DOI: añade https://doi.org/xxxxx al final. Con URL pública sin DOI: añade URL al final. Impreso o base académica común sin localizador: termina en el eLocator.`,
    rules: [completeAuthorRule, 'Escribe Artículo antes del eLocator y no inventa un rango de páginas.', 'Omite volumen y número individualmente cuando no existan.', 'Prefiere DOI y exprésalo como URL completa https://doi.org/...; usa URL pública si no hay DOI y omite ambos en una versión impresa o base académica común sin localizador.'],
  },
  'journal-advance-online': {
    ...base, id: 'journal-advance-online', label: 'Artículo publicado anticipadamente en línea', manualExample: 7, manualPrintedPages: '324',
    requiredMetadata: ['autores', 'año', 'título', 'revista', 'estado de publicación anticipada', 'DOI o URL pública si corresponde'],
    referenceTemplate: `${completeAuthorList} (Año). Título. Revista. Publicación anticipada en línea. Con DOI: añade https://doi.org/xxxxx al final. Con URL pública sin DOI: añade URL al final.`,
    rules: [completeAuthorRule, 'Prefiere DOI y exprésalo como URL completa https://doi.org/...; si no existe pero el artículo es recuperable públicamente, usa la URL directa.', 'Debe sustituirse por la referencia de la versión final cuando esta exista.'],
  },
  'journal-in-press': {
    ...base, id: 'journal-in-press', label: 'Artículo en prensa', manualExample: 8, manualPrintedPages: '324',
    requiredMetadata: ['autores', 'título', 'revista', 'confirmación de aceptación/en prensa', 'DOI asignado, si existe'],
    referenceTemplate: `${completeAuthorList} (en prensa). Título. Revista. Si ya tiene DOI asignado: https://doi.org/xxxxx`,
    parentheticalCitation: '(Autor, en prensa); (Autor & Autor, en prensa); (Primer autor et al., en prensa) con tres o más autores', narrativeCitation: 'Autor (en prensa); Autor y Autor (en prensa); Primer autor et al. (en prensa) con tres o más autores',
    rules: [completeAuthorRule, 'No inventa año, volumen, número ni páginas todavía no publicados.', 'Incluye el DOI solo si ya fue asignado y lo conserva como URL completa https://doi.org/...; no lo sustituye por datos periódicos aún no publicados.'],
  },
  'journal-other-language': {
    ...base, id: 'journal-other-language', label: 'Artículo publicado en otro idioma', manualExample: 9, manualPrintedPages: '324',
    requiredMetadata: ['autores', 'año', 'título original', 'traducción del título al idioma del trabajo si corresponde', 'revista', 'volumen/número/páginas o eLocator si existen', 'DOI/URL si corresponde'],
    referenceTemplate: `${completeAuthorList} (Año). Título original [Traducción del título]. Con volumen, número y páginas/eLocator: Revista, volumen(número), páginas o eLocator. Sin número: Revista, volumen, páginas o eLocator. Sin volumen: Revista, (número), páginas o eLocator. Sin volumen ni número: Revista, páginas o eLocator; omite también páginas/eLocator si no existen. Con DOI: añade https://doi.org/xxxxx. Sin DOI con URL pública: añade la URL. Impreso o base académica común sin localizador: termina en los datos periódicos disponibles.`,
    rules: [completeAuthorRule, 'La traducción entre corchetes se añade cuando el idioma del artículo difiere del idioma del trabajo.', 'Omite volumen, número y páginas/eLocator individualmente cuando no existan.', 'Incluye DOI o URL únicamente cuando exista un localizador aplicable; omite ambos en impreso o base académica común.'],
  },
  'journal-translated-republication': {
    ...base, id: 'journal-translated-republication', label: 'Artículo reeditado en traducción', manualExample: 10, manualPrintedPages: '324',
    requiredMetadata: ['autor', 'año de reedición', 'año original', 'título', 'traductores', 'revista', 'volumen/número/páginas o eLocator si existen', 'DOI o URL pública si corresponde'],
    referenceTemplate: `${completeAuthorList} (Año reedición). Título (${titlePositionTranslators}). Con volumen, número y páginas/eLocator: Revista, volumen(número), páginas o eLocator. Sin número: Revista, volumen, páginas o eLocator. Sin volumen: Revista, (número), páginas o eLocator. Sin volumen ni número: Revista, páginas o eLocator; omite también páginas/eLocator si no existen. Con DOI: añade https://doi.org/xxxxx. Sin DOI con URL pública: añade URL. Impreso o base académica común sin localizador: termina en los datos periódicos disponibles. En todos los casos, finaliza con (Obra original publicada en Año original).`,
    parentheticalCitation: '(Autor, Año original/Año reedición); (Autor & Autor, Año original/Año reedición); (Primer autor et al., Año original/Año reedición) con tres o más autores', narrativeCitation: 'Autor (Año original/Año reedición); Autor y Autor (Año original/Año reedición); Primer autor et al. (Año original/Año reedición) con tres o más autores',
    rules: ['Conserva la lista completa de traductores acreditados y usa (Trad.) para uno o (Trads.) para varios.', 'Los dos años son obligatorios para la citación de la reedición consultada.', 'Omite volumen, número y páginas/eLocator individualmente cuando no existan.', 'Prefiere DOI y exprésalo como URL completa https://doi.org/...; usa URL pública si no hay DOI y omite ambos en una versión impresa o base académica común sin localizador.', 'La nota de obra original publicada va siempre al final, después del DOI o URL cuando exista.'],
  },
  'journal-reprint': {
    ...base, id: 'journal-reprint', label: 'Artículo reimpreso de otra fuente', manualExample: 11, manualPrintedPages: '324-325',
    requiredMetadata: ['autor', 'año de reimpresión', 'título', 'contenedor de la reimpresión: editores, libro, páginas y editorial si corresponde', 'año, revista, volumen/número, páginas o eLocator y DOI/URL si existe de la publicación original'],
    referenceTemplate: `${completeAuthorList} (Año reimpresión). Título. Reimpresión en libro: En ${completePeriodicalEditors}, Libro de la reimpresión (pp. xx-xx). Editorial. Reimpresión en publicación periódica: Revista de la reimpresión, volumen(número), páginas o eLocator. (Reimpreso de “Título del artículo”, Año original, Revista original, volumen[número], páginas o eLocator; con DOI: https://doi.org/xxxxx; sin DOI con URL pública: URL; sin localizador: termina después de las páginas o eLocator)`,
    parentheticalCitation: '(Autor, Año original/Año reimpresión); (Autor & Autor, Año original/Año reimpresión); (Primer autor et al., Año original/Año reimpresión) con tres o más autores', narrativeCitation: 'Autor (Año original/Año reimpresión); Autor y Autor (Año original/Año reimpresión); Primer autor et al. (Año original/Año reimpresión) con tres o más autores',
    rules: ['La referencia describe primero la versión realmente consultada y especifica su contenedor verificable: libro con editores, páginas y editorial, o publicación periódica con sus datos.', 'La nota de reimpresión identifica el artículo original con revista, volumen, número, páginas o eLocator y DOI/URL solo cuando exista un localizador aplicable.'],
  },
  'journal-special-section-issue': {
    ...base, id: 'journal-special-section-issue', label: 'Sección especial o edición especial', manualExample: 12, manualPrintedPages: '325',
    requiredMetadata: ['editores', 'año', 'título', 'tipo sección/edición', 'revista', 'volumen/número', 'páginas si es sección', 'DOI o URL pública si corresponde'],
    referenceTemplate: `${completePeriodicalEditors}. (Año). Título [Sección especial o Edición especial]. Revista, volumen(número), páginas solo si corresponde. Con DOI: añade https://doi.org/xxxxx al final. Con URL pública sin DOI: añade URL al final. Impreso o base académica común sin localizador: termina después de los datos periódicos.`,
    parentheticalCitation: '(Editor, Año); (Editor & Editor, Año); (Primer editor et al., Año) con tres o más editores', narrativeCitation: 'Editor (Año); Editor y Editor (Año); Primer editor et al. (Año) con tres o más editores',
    rules: ['Incluye la lista completa de editores y usa (Ed.) para uno o (Eds.) para varios.', 'Incluye páginas para una sección especial, no para una edición especial completa.', 'Prefiere DOI y exprésalo como URL completa https://doi.org/...; usa URL pública si no hay DOI y omite ambos en una versión impresa o base académica común sin localizador.', 'Un artículo individual dentro del especial usa el formato normal de artículo.'],
  },
  'journal-cochrane': {
    ...base, id: 'journal-cochrane', label: 'Artículo de Cochrane Database of Systematic Reviews', manualExample: 13, manualPrintedPages: '325',
    requiredMetadata: ['autores', 'año', 'título', 'número de edición', 'número de artículo CD', 'DOI'],
    referenceTemplate: `${completeAuthorList} (Año). Título. Cochrane Database of Systematic Reviews, Año(número de edición), Artículo CDxxxxxx. https://doi.org/xxxxx`,
    rules: [completeAuthorRule, 'Se presenta como artículo de publicación periódica.', 'Conserva el número de edición y el identificador de artículo CD verificados.', 'Expresa el DOI como URL completa https://doi.org/...'],
  },
  'journal-uptodate': {
    ...base, id: 'journal-uptodate', label: 'Artículo de UpToDate', manualExample: 14, manualPrintedPages: '325-326',
    requiredMetadata: ['autor', 'año de última actualización', 'título', 'editor acreditado', 'fecha de recuperación', 'URL'],
    referenceTemplate: `${completeAuthorList} (Año de última actualización). Título. En E. Editor (Ed.), UpToDate. Recuperado el día de mes de año, de URL`,
    rules: ['Incluye fecha de recuperación porque el contenido cambia y las versiones no se archivan.'],
  },
  'magazine-article': {
    ...base, id: 'magazine-article', label: 'Artículo de revista o magazine', manualExample: 15, manualPrintedPages: '326',
    requiredMetadata: ['autor', 'fecha disponible', 'título', 'revista', 'volumen/número/páginas si existen', 'DOI/URL si corresponde'],
    referenceTemplate: `${completeAuthorList} (Año), (Año, mes o estación) o (Año, día de mes), según la fecha publicada. Título. Con volumen, número y páginas: Revista, volumen(número), páginas. Solo volumen y páginas: Revista, volumen, páginas. Solo número y páginas: Revista, (número), páginas. Solo páginas: Revista, páginas. Con DOI: añade https://doi.org/xxxxx al final. Con URL pública sin DOI: añade URL al final.`,
    rules: ['Usa la precisión de fecha publicada por la revista: año, año y mes/estación, o fecha completa.', 'No inventes mes ni día y omite individualmente volumen, número, páginas y localizador cuando sean inexistentes.'],
  },
  'newspaper-article': {
    ...base, id: 'newspaper-article', label: 'Artículo de periódico', manualExample: 16, manualPrintedPages: '326',
    requiredMetadata: ['autor si se acredita', 'fecha completa', 'título', 'periódico', 'página o URL según versión'],
    referenceTemplate: `Con autor: ${completeAuthorList} (Año, día de mes). Título. Periódico, p. x para una página o pp. xx–xx para varias páginas en impreso. URL si es en línea. Sin autor acreditado: Título. (Año, día de mes). Periódico, p. x para una página o pp. xx–xx para varias páginas en impreso. URL si es en línea.`,
    parentheticalCitation: '(Autor, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores. Sin autor: (“Título abreviado”, Año)', narrativeCitation: 'Autor (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores. Sin autor: “Título abreviado” (Año)',
    rules: ['Sin autor acreditado, comienza la referencia por el título y usa título abreviado en la cita.', 'Un sitio web de noticias que no es un periódico se trata como página web, no como artículo de periódico.'],
  },
  'blog-post': {
    ...base, id: 'blog-post', label: 'Entrada de blog', manualExample: 17, manualPrintedPages: '326',
    requiredMetadata: ['autor', 'fecha completa', 'título de la entrada', 'nombre del blog', 'URL'],
    referenceTemplate: `${completeAuthorList} (Año, día de mes). Título de la entrada. Blog. URL`,
    rules: ['El nombre del blog ocupa el elemento fuente.'],
  },
  'periodical-comment': {
    ...base, id: 'periodical-comment', label: 'Comentario en una publicación periódica en línea', manualExample: 18, manualPrintedPages: '326',
    requiredMetadata: ['nombre real o usuario del comentarista', 'fecha completa', 'título o primeras 20 palabras', 'artículo comentado', 'publicación', 'URL'],
    referenceTemplate: 'Usuario. (Año, día de mes). Título o primeras 20 palabras [Comentario en el artículo “Título del artículo”]. Publicación. URL',
    parentheticalCitation: '(Usuario, Año)', narrativeCitation: 'Usuario (Año)',
    rules: ['Acredita al comentarista con el nombre mostrado.', 'La descripción entre corchetes identifica el artículo comentado.'],
  },
  'periodical-editorial': {
    ...base, id: 'periodical-editorial', label: 'Editorial de una publicación periódica', manualExample: 19, manualPrintedPages: '326-327',
    requiredMetadata: ['autor si está firmado', 'año o fecha', 'título', 'tipo de publicación periódica', 'volumen/número/páginas si existen', 'DOI/URL si corresponde'],
    referenceTemplate: `Con firma: ${completeAuthorList} (Año), (Año, mes o estación) o (Año, día de mes), según la fecha publicada. Título [Editorial]. Sin firma: Título [Editorial]. (Año), (Año, mes o estación) o (Año, día de mes), según la fecha publicada. En ambas formas, con volumen, número y páginas: Publicación, volumen(número), páginas. Sin número: Publicación, volumen, páginas. Sin volumen: Publicación, (número), páginas. Solo páginas: Publicación, páginas. Sin datos periódicos: Publicación. Con DOI: añade https://doi.org/xxxxx al final. Sin DOI con URL pública: añade URL. Sin localizador: termina en los datos periódicos disponibles.`,
    parentheticalCitation: 'Con firma: (Autor, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores. Sin firma: (“Título abreviado”, Año)',
    narrativeCitation: 'Con firma: Autor (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores. Sin firma: “Título abreviado” (Año)',
    rules: [
      'Usa el formato correspondiente al tipo de publicación periódica donde apareció.',
      'Añade [Editorial] después del título, salvo que la palabra Editorial ya forme parte del título.',
      'Si el editorial no está firmado, aplica las reglas de obra sin autor: el título pasa a la posición de autor y gobierna la cita en el texto.',
      'Omite individualmente volumen, número, páginas y localizador cuando la publicación no los proporcione.',
    ],
  },
};

export function getPeriodicalCase(id: PeriodicalCaseId): Apa7VerifiedCase {
  return periodicalCases[id];
}
