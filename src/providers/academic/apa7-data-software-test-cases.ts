import { z } from 'zod';

export const dataSoftwareTestCaseId = z.enum([
  'dataset-published',
  'raw-data-unpublished',
  'specialized-software',
  'apparatus-or-equipment',
  'mobile-application',
  'mobile-app-reference-entry',
  'test-manual',
  'test-itself',
  'test-database-record',
]);

export type DataSoftwareTestCaseId = z.infer<typeof dataSoftwareTestCaseId>;

export interface Apa7VerifiedDataSoftwareTestCase {
  id: DataSoftwareTestCaseId;
  label: string;
  manualExample: number;
  manualSection: '10.9' | '10.10' | '10.11';
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
  parentheticalCitation: '(Autor o entidad, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores personales',
  narrativeCitation: 'Autor o entidad (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores personales',
  refuseWhen: [
    'No se verificó el creador, desarrollador o responsable de los datos o la prueba.',
    'Se infirieron el año, versión, modelo, número de registro o estado de publicación.',
    'Se añadió un DOI, URL, repositorio, tienda o base de datos inexistente.',
  ],
};

const dataBase = { ...shared, manualSection: '10.9' as const };
const softwareBase = { ...shared, manualSection: '10.10' as const };
const testBase = { ...shared, manualSection: '10.11' as const };
const completePersonalAuthors = 'Autor, A. A.; Autor, A. A., & Autor, B. B.; o Autor, A. A., Autor, B. B., & Autor, C. C.';
const completePersonalAuthorRule = 'Conserva la lista completa y ordenada de autores personales conforme a los límites del elemento autor de APA; usa el nombre completo si la autora es una entidad.';

export const dataSoftwareTestCases: Record<DataSoftwareTestCaseId, Apa7VerifiedDataSoftwareTestCase> = {
  'dataset-published': {
    ...dataBase, id: 'dataset-published', label: 'Conjunto de datos publicado', manualExample: 75, manualPrintedPages: '344',
    requiredMetadata: ['autores o entidad', 'año de publicación', 'título', 'identificador y versión si existen', 'descripción del conjunto', 'organización publicadora/archivo', 'DOI/URL'],
    referenceTemplate: `${completePersonalAuthors} o Entidad autora. (Año). Título del conjunto. Si existen identificador o versión: Título del conjunto (Identificador), (Versión x) o (Identificador; Versión x). [Conjunto de datos y libro de códigos, si corresponde]. Organización o archivo, solo si difiere del autor. DOI/URL`,
    rules: [completePersonalAuthorRule, 'Cita el conjunto cuando realizas análisis secundarios de datos públicos o archivas datos propios presentados por primera vez.', 'Incluye entre paréntesis únicamente el identificador y/o la versión que realmente existan; omite todo el paréntesis si no existe ninguno.', 'Incluye fecha de recuperación solo si el conjunto está diseñado para cambiar con el tiempo.'],
  },
  'raw-data-unpublished': {
    ...dataBase, id: 'raw-data-unpublished', label: 'Datos brutos no publicados', manualExample: 76, manualPrintedPages: '344',
    requiredMetadata: ['autor o entidad', 'año o rango de años de recolección', 'título o descripción', 'estado inédito', 'fuente institucional si se conoce'],
    referenceTemplate: 'Autor, A. A. (Año o Años). Título [Datos brutos inéditos]. Fuente institucional si se conoce.',
    rules: ['Si no existe título, usa una descripción entre corchetes que indique estado y enfoque de los datos.', 'Para datos no publicados, la fecha es el año o rango de años de recolección.', 'Incluye la institución al final solo cuando se conoce.'],
  },
  'specialized-software': {
    ...softwareBase, id: 'specialized-software', label: 'Software especializado o de distribución limitada', manualExample: 77, manualPrintedPages: '345',
    requiredMetadata: ['autores o entidad', 'año de la versión', 'título', 'versión', 'desarrollador/editor si difiere', 'URL'],
    referenceTemplate: `${completePersonalAuthors} o Entidad autora. (Año). Título (Versión x) [Software]. Desarrollador, solo si difiere del autor. URL`,
    rules: [completePersonalAuthorRule, 'Referencia software especializado o de distribución limitada y cualquier software que se haya parafraseado o citado.', 'El título va en cursiva en referencias, no cuando se menciona en el texto.', 'Si autor y desarrollador son iguales, omite el desarrollador.'],
  },
  'apparatus-or-equipment': {
    ...softwareBase, id: 'apparatus-or-equipment', label: 'Aparato o equipo', manualExample: 78, manualPrintedPages: '345-346',
    requiredMetadata: ['fabricante/autor', 'año', 'nombre', 'número de modelo si existe', 'descripción aparato/equipo/software', 'desarrollador si difiere', 'URL'],
    referenceTemplate: 'Fabricante. (Año). Nombre (Modelo x) [Aparato, Equipo o Aparato y software]. Desarrollador si difiere. URL',
    rules: ['Si incluye software, identifica ambos en la descripción.', 'Si el modelo no figura en el título, añádelo entre paréntesis después.', 'Omite la editorial/desarrollador cuando coincide con el autor.'],
  },
  'mobile-application': {
    ...softwareBase, id: 'mobile-application', label: 'Aplicación móvil', manualExample: 79, manualPrintedPages: '346',
    requiredMetadata: ['autor o desarrollador', 'año de la versión', 'nombre', 'versión', 'tienda o desarrollador', 'URL'],
    referenceTemplate: 'Autor o entidad. (Año). Nombre de la aplicación (Versión x) [Aplicación móvil]. Tienda o desarrollador verificado, solo si difiere del autor. URL',
    rules: ['Usa como fuente la tienda cuando allí se distribuye la aplicación o el desarrollador cuando la distribuye directamente; si coincide con el autor, omite ese elemento.', 'Usa el año de publicación de la versión consultada.', 'No confunde una aplicación completa con contenido publicado dentro de una red social.'],
  },
  'mobile-app-reference-entry': {
    ...softwareBase, id: 'mobile-app-reference-entry', label: 'Entrada en una obra de consulta de una aplicación móvil', manualExample: 80, manualPrintedPages: '346',
    requiredMetadata: ['autor de la entrada o de la obra', 'año', 'título de la entrada', 'nombre y versión de la aplicación', 'desarrollador o tienda', 'URL'],
    referenceTemplate: 'Autor. (Año). Título de la entrada. En Nombre de la aplicación (Versión x) [Aplicación móvil]. Desarrollador o tienda. URL',
    rules: ['Se estructura como entrada de una obra de consulta.', 'No inventa un autor individual cuando una entidad es responsable de toda la aplicación y sus entradas.'],
  },
  'test-manual': {
    ...testBase, id: 'test-manual', label: 'Manual de una prueba, escala o inventario', manualExample: 81, manualPrintedPages: '346',
    requiredMetadata: ['autores del manual', 'año', 'título completo', 'edición si existe', 'editorial', 'DOI/URL si corresponde'],
    referenceTemplate: `${completePersonalAuthors} (Año). Título del manual de la prueba. Editorial. DOI/URL`,
    parentheticalCitation: '(Autor, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores', narrativeCitation: 'Autor (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores',
    rules: [completePersonalAuthorRule, 'Prioriza la literatura de apoyo: si existe un manual, cita el manual y no la prueba por separado.', 'Usa el formato de libro de autor o editado que corresponda.'],
  },
  'test-itself': {
    ...testBase, id: 'test-itself', label: 'Prueba, escala o inventario en sí mismo', manualExample: 82, manualPrintedPages: '346-347',
    requiredMetadata: ['autor o entidad', 'año o s. f.', 'nombre exacto de la prueba', 'URL o fuente recuperable'],
    referenceTemplate: 'Autor o entidad. (Año o s. f.). Título de la prueba. URL',
    parentheticalCitation: '(Autor o entidad, Año o s. f.)', narrativeCitation: 'Autor o entidad (Año o s. f.)',
    rules: ['Cita la prueba misma solo si no existe manual ni otra literatura de apoyo.', 'En el texto, el nombre de la prueba usa mayúsculas de título y tipografía normal, no cursiva.'],
  },
  'test-database-record': {
    ...testBase, id: 'test-database-record', label: 'Registro de base de datos para una prueba', manualExample: 83, manualPrintedPages: '347',
    requiredMetadata: ['autores', 'año', 'nombre de la prueba', 'sigla/código si existe', 'descripción de registro', 'base de datos de pruebas', 'DOI/URL'],
    referenceTemplate: `${completePersonalAuthors} (Año). Nombre de la prueba (Sigla/código) [Registro de base de datos]. Base de datos de pruebas. DOI/URL`,
    parentheticalCitation: '(Autor, Año); (Autor & Autor, Año); (Primer autor et al., Año) con tres o más autores', narrativeCitation: 'Autor (Año); Autor y Autor (Año); Primer autor et al. (Año) con tres o más autores',
    rules: [completePersonalAuthorRule, 'Cita el registro solo cuando utilizas información descriptiva o administrativa única de ese registro.', 'Si no usas información única del registro, cita la literatura de apoyo disponible.', 'El nombre de la base se incluye para registros, no por el mero hecho de que la prueba pueda encontrarse allí.'],
  },
};

export function getDataSoftwareTestCase(id: DataSoftwareTestCaseId): Apa7VerifiedDataSoftwareTestCase {
  return dataSoftwareTestCases[id];
}
