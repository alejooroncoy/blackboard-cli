import { z } from 'zod';

export const reviewUnpublishedCaseId = z.enum([
  'review-film-in-journal',
  'review-book-in-newspaper',
  'review-tv-episode-on-website',
  'manuscript-unpublished',
  'manuscript-in-preparation',
  'manuscript-submitted',
  'informal-preprint-or-repository',
  'informal-eric',
]);

export type ReviewUnpublishedCaseId = z.infer<typeof reviewUnpublishedCaseId>;

export interface Apa7VerifiedReviewUnpublishedCase {
  id: ReviewUnpublishedCaseId;
  label: string;
  manualExample: number;
  manualSection: '10.7' | '10.8';
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
  parentheticalCitation: '(Autor de la obra citada, Año)',
  narrativeCitation: 'Autor de la obra citada (Año)',
  refuseWhen: [
    'No se verificó quién escribió la reseña o el manuscrito.',
    'Se infirieron el estado editorial, el tipo de obra, sus responsables o la fuente.',
    'Se añadió una revista, DOI, URL, archivo o número de documento inexistente.',
  ],
};

const reviewBase = { ...shared, manualSection: '10.7' as const, parentheticalCitation: '(Revisor, Año); (Revisor & Revisor, Año); (Primer revisor et al., Año) con tres o más revisores', narrativeCitation: 'Revisor (Año); Revisor y Revisor (Año); Primer revisor et al. (Año) con tres o más revisores' };
const unpublishedBase = { ...shared, manualSection: '10.8' as const, parentheticalCitation: '(Autor, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores', narrativeCitation: 'Autor (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores' };
const completeManuscriptAuthors = 'Un autor: Autor, A. A.; dos: Autor, A. A., & Autor, B. B.; de 3 a 20: Autor, A. A., Autor, B. B., Autor, C. C., …, & Autor final, Z. Z. (incluye todos); 21 o más: autores 1–19, …, Último autor';
const completeManuscriptAuthorRule = 'Conserva la lista completa y ordenada de autores conforme a los límites del elemento autor de APA.';
const completeReviewers = 'Un revisor: Revisor, A. A.; dos: Revisor, A. A., & Revisor, B. B.; de 3 a 20: Revisor, A. A., Revisor, B. B., Revisor, C. C., …, & Revisor final, Z. Z. (incluye todos); 21 o más: revisores 1–19, …, Último revisor';

export const reviewUnpublishedCases: Record<ReviewUnpublishedCaseId, Apa7VerifiedReviewUnpublishedCase> = {
  'review-film-in-journal': {
    ...reviewBase, id: 'review-film-in-journal', label: 'Reseña de película publicada en revista científica', manualExample: 67, manualPrintedPages: '341',
    requiredMetadata: ['autores de la reseña', 'año', 'título de la reseña', 'título de la película', 'director', 'revista', 'volumen/número/páginas', 'DOI/URL'],
    referenceTemplate: `${completeReviewers} (Año). Título de la reseña [Reseña de la película Título, de D. Director, Dir.]. Revista, volumen(número), páginas. DOI/URL`,
    rules: ['Conserva la lista completa y ordenada de revisores conforme a los límites del elemento autor de APA.', 'Usa el formato de revista científica porque allí se publicó la reseña.', 'La obra reseñada y su responsable se describen entre corchetes.'],
  },
  'review-book-in-newspaper': {
    ...reviewBase, id: 'review-book-in-newspaper', label: 'Reseña de libro publicada en periódico', manualExample: 68, manualPrintedPages: '341',
    requiredMetadata: ['revisor', 'fecha completa', 'título de la reseña', 'título y autor del libro', 'periódico', 'URL o página'],
    referenceTemplate: `${completeReviewers} (Año, día de mes). Título de la reseña [Reseña del libro Título, de A. Autor]. Periódico, p. x o pp. xx–xx para versión impresa. URL para versión en línea`,
    rules: ['Usa el formato de periódico.', 'En la versión impresa incluye la página o el intervalo de páginas y omite la URL; en la versión en línea incluye la URL y omite las páginas si no existen.', 'No añade una designación de rol después del autor de un libro reseñado.'],
  },
  'review-tv-episode-on-website': {
    ...reviewBase, id: 'review-tv-episode-on-website', label: 'Reseña de episodio de televisión publicada en sitio web', manualExample: 69, manualPrintedPages: '341',
    requiredMetadata: ['revisor', 'fecha completa', 'título de la reseña', 'episodio', 'guionista/director u otros responsables', 'sitio', 'URL'],
    referenceTemplate: `${completeReviewers} (Año, día de mes). Título de la reseña [Reseña del episodio de serie de TV “Título del episodio”, de G. Guionista & D. Director, Dir.]. Nombre del sitio. URL`,
    rules: ['Usa el formato de página web.', 'En la descripción de la obra conserva los roles relevantes; el título del programa se escribe como título dentro de la descripción.'],
  },
  'manuscript-unpublished': {
    ...unpublishedBase, id: 'manuscript-unpublished', label: 'Manuscrito inédito', manualExample: 70, manualPrintedPages: '342',
    requiredMetadata: ['autores', 'año de terminación', 'título', 'departamento', 'universidad o institución'],
    referenceTemplate: `${completeManuscriptAuthors} (Año). Título [Manuscrito inédito]. Departamento, Universidad.`,
    rules: [completeManuscriptAuthorRule, 'Solo está en posesión de los autores.', 'Incluye departamento e institución cuando puedan verificarse.', 'Un manuscrito disponible públicamente en línea se trata como publicación informal.'],
  },
  'manuscript-in-preparation': {
    ...unpublishedBase, id: 'manuscript-in-preparation', label: 'Manuscrito en preparación', manualExample: 71, manualPrintedPages: '342',
    requiredMetadata: ['autores', 'año del borrador', 'título', 'departamento', 'universidad o institución'],
    referenceTemplate: `${completeManuscriptAuthors} (Año). Título [Manuscrito en preparación]. Departamento, Universidad.`,
    rules: [completeManuscriptAuthorRule, 'El estado editorial se describe después del título, no en el elemento fecha.', 'Si está disponible en línea, se trata como publicación informal.'],
  },
  'manuscript-submitted': {
    ...unpublishedBase, id: 'manuscript-submitted', label: 'Manuscrito presentado para publicación', manualExample: 72, manualPrintedPages: '342-343',
    requiredMetadata: ['autores', 'año del manuscrito', 'título', 'departamento', 'universidad o institución'],
    referenceTemplate: `${completeManuscriptAuthors} (Año). Título [Manuscrito presentado para su publicación]. Departamento, Universidad.`,
    rules: [completeManuscriptAuthorRule, 'No nombra la revista a la que se presentó.', 'Si es aceptado, pasa al caso de artículo en prensa.', 'Si el texto está disponible públicamente en línea, se trata como publicación informal.'],
  },
  'informal-preprint-or-repository': {
    ...unpublishedBase, id: 'informal-preprint-or-repository', label: 'Obra informal en archivo de preimpresión o repositorio', manualExample: 73, manualPrintedPages: '343',
    requiredMetadata: ['autores', 'año', 'título', 'nombre del archivo o repositorio', 'DOI/URL'],
    referenceTemplate: `${completeManuscriptAuthors} (Año). Título. Nombre del archivo o repositorio. DOI/URL`,
    rules: [completeManuscriptAuthorRule, 'Puede ser un preprint no revisado por pares o el manuscrito aceptado del autor; no presupone ninguno de los dos.', 'Cuando exista la versión final publicada, se prefiere y se actualiza la referencia.'],
  },
  'informal-eric': {
    ...unpublishedBase, id: 'informal-eric', label: 'Obra publicada informalmente en ERIC', manualExample: 74, manualPrintedPages: '343',
    requiredMetadata: ['autor', 'año', 'título', 'número de documento ERIC', 'ERIC', 'URL'],
    referenceTemplate: `${completeManuscriptAuthors} (Año). Título (N.º de documento ERIC). ERIC. URL`,
    rules: ['Incluye el número asignado por ERIC entre paréntesis después del título.'],
  },
};

export function getReviewUnpublishedCase(id: ReviewUnpublishedCaseId): Apa7VerifiedReviewUnpublishedCase {
  return reviewUnpublishedCases[id];
}
