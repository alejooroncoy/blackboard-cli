import { z } from 'zod';

export const audiovisualAudioCaseId = z.enum([
  'film-or-video',
  'film-other-language',
  'television-series',
  'television-episode-or-webisode',
  'ted-talk',
  'recorded-webinar',
  'online-video',
  'music-album',
  'song-or-track',
  'podcast-series',
  'podcast-episode',
  'archived-radio-interview',
  'speech-audio-recording',
]);

export type AudiovisualAudioCaseId = z.infer<typeof audiovisualAudioCaseId>;

export interface Apa7VerifiedAudiovisualAudioCase {
  id: AudiovisualAudioCaseId;
  label: string;
  manualExample: number;
  manualSection: '10.12' | '10.13';
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
  parentheticalCitation: '(Responsable, Año)',
  narrativeCitation: 'Responsable (Año)',
  refuseWhen: [
    'No se verificó el rol que determina la autoría de este tipo de medio.',
    'Se infirieron fecha, versión, temporada, episodio, compañía o año original.',
    'Se añadió una URL, plataforma, productora, discográfica o archivo inexistente.',
  ],
};

const audiovisualBase = { ...shared, manualSection: '10.12' as const };
const audioBase = { ...shared, manualSection: '10.13' as const };

export const audiovisualAudioCases: Record<AudiovisualAudioCaseId, Apa7VerifiedAudiovisualAudioCase> = {
  'film-or-video': {
    ...audiovisualBase, id: 'film-or-video', label: 'Película o video', manualExample: 84, manualPrintedPages: '348-349',
    requiredMetadata: ['director o lista completa de directores, u otro rol equivalente verificable', 'año de la versión', 'título', 'descripción película/video y edición especial si importa', 'productora(s)', 'URL si corresponde'],
    referenceTemplate: 'Un director: Director, D. D. (Director); dos: Director, D. D., & Director, E. E. (Directores); de 3 a 20: Director, D. D., Director, E. E., Director, F. F., …, & Director final, Z. Z. (Directores; incluye todos); 21 o más: directores 1–19, …, Último director (Directores). (Año). Título [Película; información especial de versión si es necesaria]. Productora 1; Productora 2. Añade URL solo cuando corresponda a la versión recuperable consultada; de lo contrario, termina en la productora.',
    parentheticalCitation: '(Director, Año); (Director & Director, Año); (Primer director et al., Año) con tres o más directores', narrativeCitation: 'Director (Año); Director y Director (Año); Primer director et al. (Año) con tres o más directores',
    rules: ['El director ocupa la posición de autor; si es desconocido puede acreditarse un rol equivalente que facilite recuperar la obra.', 'Conserva la lista completa de directores conforme a los límites del elemento autor de APA y usa el rol plural para varios.', 'Omite la URL para una versión física o de streaming ordinario sin un localizador público específico de la obra.', 'No indica cine, DVD o streaming por defecto; añade detalles solo si la versión concreta es relevante.', 'Una cita textual de una obra audiovisual usa marca de tiempo real.'],
  },
  'film-other-language': {
    ...audiovisualBase, id: 'film-other-language', label: 'Película o video en otro idioma', manualExample: 85, manualPrintedPages: '349',
    requiredMetadata: ['director o lista completa de directores', 'año', 'título original', 'traducción del título', 'descripción', 'productora(s)', 'URL pública específica si corresponde'],
    referenceTemplate: 'Un director: Director, D. D. (Director); dos: Director, D. D., & Director, E. E. (Directores); de 3 a 20: Director, D. D., Director, E. E., Director, F. F., …, & Director final, Z. Z. (Directores; incluye todos); 21 o más: directores 1–19, …, Último director (Directores). (Año). Título original [Traducción del título] [Película]. Productora 1; Productora 2; conserva todas en el orden acreditado. Añade URL solo cuando exista un localizador público específico de la versión consultada; de lo contrario, termina en las productoras.',
    parentheticalCitation: '(Director, Año); (Director & Director, Año); (Primer director et al., Año) con tres o más directores', narrativeCitation: 'Director (Año); Director y Director (Año); Primer director et al. (Año) con tres o más directores',
    rules: ['Conserva la lista completa de directores conforme a los límites del elemento autor de APA y usa el rol plural para varios.', 'Conserva todas las productoras en el orden acreditado y sepáralas con punto y coma.', 'Añade entre corchetes la traducción del título cuando el idioma difiere del idioma del trabajo.', 'Añade URL solo para un localizador público específico de la versión consultada.'],
  },
  'television-series': {
    ...audiovisualBase, id: 'television-series', label: 'Serie de televisión completa', manualExample: 86, manualPrintedPages: '349',
    requiredMetadata: ['productores ejecutivos', 'años de emisión', 'título de la serie', 'productora(s)'],
    referenceTemplate: 'Un productor: Productor, P. P. (Productor ejecutivo); dos: Productor, P. P., & Productor, Q. Q. (Productores ejecutivos); de 3 a 20: Productor, P. P., Productor, Q. Q., Productor, R. R., …, & Productor final, Z. Z. (Productores ejecutivos; incluye todos); 21 o más: productores 1–19, …, Último productor (Productores ejecutivos). (Año único; Año inicial–Año final; o Año inicial–presente). Título de la serie [Serie de TV]. Productora(s).',
    parentheticalCitation: '(Productor, Año único o rango); (Productor & Productor, Año único o rango); (Primer productor et al., Año único o rango) con tres o más productores', narrativeCitation: 'Productor (Año único o rango); Productor y Productor (Año único o rango); Primer productor et al. (Año único o rango) con tres o más productores',
    rules: ['Los productores ejecutivos ocupan la posición de autor.', 'Incluye la lista completa y usa el rol plural cuando se acredita a más de un productor ejecutivo.', 'Usa un solo año si la serie comenzó y terminó en ese mismo año, un rango si abarcó varios años y “Año inicial–presente” si sigue en emisión.'],
  },
  'television-episode-or-webisode': {
    ...audiovisualBase, id: 'television-episode-or-webisode', label: 'Episodio de televisión o webisodio', manualExample: 87, manualPrintedPages: '349',
    requiredMetadata: ['guionistas', 'director del episodio', 'fecha completa', 'título', 'temporada y episodio si se publican', 'productores ejecutivos', 'serie', 'productora(s)', 'URL si corresponde'],
    referenceTemplate: 'Una persona con ambos roles: Responsable, R. R. (Guionista y Director). Personas distintas: un guionista y director: Guionista, G. G. (Guionista), & Director, D. D. (Director); dos guionistas y director: Guionista, G. G. (Guionista), Guionista, H. H. (Guionista), & Director, D. D. (Director); de 3 a 20 responsables combinados: Guionista, G. G. (Guionista), Guionista, H. H. (Guionista), Guionista, I. I. (Guionista), …, & Director, D. D. (Director; incluye todos); 21 o más responsables combinados: responsables 1–19, …, Director, D. D. (Director). (Año, día de mes). Con numeración publicada: Título (Temporada x, Episodio y) [Episodio de serie de TV]. Sin numeración publicada: Título [Episodio de serie de TV]. En un productor: P. Productor (Productor ejecutivo); dos: P. Productor & Q. Productor (Productores ejecutivos); de 3 a 20: P. Productor, Q. Productor, R. Productor, …, & Z. Productor final (Productores ejecutivos; incluye todos); 21 o más: productores 1–19, …, Último productor (Productores ejecutivos), Título de la serie. Productora(s). Añade URL solo si existe un localizador público específico; de lo contrario, termina en la productora.',
    parentheticalCitation: '(Responsable, Año) si una persona ocupa todos los roles; (Guionista & Director, Año) con dos responsables; (Primer responsable et al., Año) con tres o más responsables acreditados', narrativeCitation: 'Responsable (Año) si una persona ocupa todos los roles; Guionista y Director (Año) con dos responsables; Primer responsable et al. (Año) con tres o más responsables acreditados',
    rules: ['Si una persona desempeña guion y dirección, escríbela una sola vez con ambos roles; si son personas distintas, incluye cada responsable con su rol en una sola lista combinada y usa un único & antes del último responsable.', 'Incluye la lista completa de productores ejecutivos de la serie y usa el rol plural cuando corresponda.', 'Omite la URL para una emisión o versión de streaming ordinaria sin localizador público específico.', 'Incluye temporada y episodio entre paréntesis después del título solo cuando la serie los publique.', 'Distingue responsables del episodio de productores ejecutivos de la serie.'],
  },
  'ted-talk': {
    ...audiovisualBase, id: 'ted-talk', label: 'Charla TED', manualExample: 88, manualPrintedPages: '349-350',
    requiredMetadata: ['sitio donde se consultó', 'orador o cuenta que subió el video', 'fecha disponible', 'título', 'plataforma/productora', 'URL'],
    referenceTemplate: 'En TED: Orador, A. A. (Año, mes). Título [Video]. TED Conferences. URL. En YouTube: Cuenta que subió. (Año, día de mes). Título [Video]. YouTube. URL',
    parentheticalCitation: '(Orador, Año) si está en TED; (Cuenta, Año) si está en YouTube', narrativeCitation: 'Orador (Año) si está en TED; Cuenta (Año) si está en YouTube',
    rules: ['En la web de TED, el orador es autor.', 'En YouTube, el dueño de la cuenta que subió el video es autor; el orador puede mencionarse narrativamente sin cambiar la cita.'],
  },
  'recorded-webinar': {
    ...audiovisualBase, id: 'recorded-webinar', label: 'Seminario web grabado', manualExample: 89, manualPrintedPages: '350',
    requiredMetadata: ['instructor', 'año o fecha', 'título', 'organización', 'URL recuperable'],
    referenceTemplate: 'Instructor, I. I. (Año). Título [Seminario web]. Organización. URL',
    parentheticalCitation: '(Instructor, Año)', narrativeCitation: 'Instructor (Año)',
    rules: ['Este formato es solo para webinars grabados y recuperables.', 'Un webinar no grabado se cita como comunicación personal y no entra en referencias.'],
  },
  'online-video': {
    ...audiovisualBase, id: 'online-video', label: 'Video de YouTube u otro video en línea', manualExample: 90, manualPrintedPages: '350',
    requiredMetadata: ['persona o grupo que subió el video', 'nombre de usuario si existe', 'fecha completa', 'título', 'plataforma', 'URL'],
    referenceTemplate: 'Autor o grupo [Nombre de usuario, solo si existe]. (Año, día de mes). Título [Video]. Plataforma. URL',
    parentheticalCitation: '(Cuenta que subió, Año)', narrativeCitation: 'Cuenta que subió (Año)',
    rules: ['La cuenta que subió el video se acredita como autor aunque no haya creado la obra.', 'Omite por completo los corchetes del nombre de usuario cuando ese dato no exista.', 'Las contribuciones de otras personas pueden explicarse narrativamente, sin sustituir al autor de la referencia.', 'Las citas textuales usan una marca de tiempo verificable.'],
  },
  'music-album': {
    ...audioBase, id: 'music-album', label: 'Álbum de música', manualExample: 91, manualPrintedPages: '350-351',
    requiredMetadata: ['compositor para obra clásica o artista de grabación para moderna', 'año de versión', 'título', 'intérprete si es clásica', 'discográfica', 'año original si es clásica', 'URL solo si es único medio'],
    referenceTemplate: 'Clásica: Compositor. (Año versión). Título [Álbum grabado por Intérprete]. Discográfica. (Obra original publicada en Año). Moderna: Artista. (Año). Título [Álbum]. Discográfica. En cualquier variante, añade URL solo si es el único medio de recuperación.',
    parentheticalCitation: '(Compositor, Año original/Año versión) o (Artista, Año)', narrativeCitation: 'Compositor (Año original/Año versión) o Artista (Año)',
    rules: ['En música clásica, el compositor es autor y el intérprete se identifica después del título.', 'En música moderna, el artista que realizó la grabación es autor.', 'No indica Spotify, CD u otra plataforma salvo que identifique una versión relevante; añade URL solo cuando es el único medio de recuperación.'],
  },
  'song-or-track': {
    ...audioBase, id: 'song-or-track', label: 'Canción o pista', manualExample: 92, manualPrintedPages: '351',
    requiredMetadata: ['compositor clásico o artista de grabación', 'año', 'título de la canción', 'intérprete si difiere', 'álbum si existe', 'discográfica(s)', 'año original si corresponde', 'URL solo si es único medio'],
    referenceTemplate: 'Autor musical. (Año). Título de la canción [Canción; grabada por Intérprete si corresponde]. En Título del álbum, si existe. Discográfica(s). Añade (Obra original publicada en Año original) solo cuando exista un año original verificado. Añade URL al final solo si es el único medio de recuperación.',
    parentheticalCitation: '(Autor musical, Año original/Año versión o Año)', narrativeCitation: 'Autor musical (Año original/Año versión o Año)',
    rules: ['Omite el elemento álbum cuando la canción no pertenece a uno.', 'No añadas una nota de publicación original a una canción moderna o sin año original verificado.', 'Usa URL solo cuando esa ubicación es el único medio de recuperación.'],
  },
  'podcast-series': {
    ...audioBase, id: 'podcast-series', label: 'Pódcast completo', manualExample: 93, manualPrintedPages: '351',
    requiredMetadata: ['lista completa de anfitriones o productores ejecutivos acreditados', 'rol', 'años de publicación', 'título', 'tipo audio/video', 'productora', 'URL si se conoce'],
    referenceTemplate: 'Un responsable: Responsable, R. R. (Anfitrión o Productor ejecutivo); dos: Responsable, R. R., & Responsable, S. S. (Anfitriones o Productores ejecutivos); de 3 a 20: Responsable, R. R., Responsable, S. S., Responsable, T. T., …, & Responsable final, Z. Z. (Anfitriones o Productores ejecutivos; incluye todos); 21 o más: responsables 1–19, …, Último responsable (rol plural). (Año único; Año inicial–Año final; o Año inicial–presente). Título [Pódcast de audio o video]. Productora. URL, solo si se conoce.',
    parentheticalCitation: '(Responsable, Año único o rango); (Responsable & Responsable, Año único o rango); (Primer responsable et al., Año único o rango) con tres o más responsables', narrativeCitation: 'Responsable (Año único o rango); Responsable y Responsable (Año único o rango); Primer responsable et al. (Año único o rango) con tres o más responsables',
    rules: ['El anfitrión ocupa la posición de autor; alternativamente, usa la lista completa de productores ejecutivos conocidos.', 'Conserva todos los responsables acreditados del rol elegido y usa el rol plural cuando corresponda.', 'Usa un año único si el pódcast comenzó y terminó ese año, un rango si abarcó varios años y “Año inicial–presente” si continúa.', 'Incluye el rol y especifica si es pódcast de audio o video.', 'Si la URL se desconoce porque se accedió desde una aplicación, omítela.'],
  },
  'podcast-episode': {
    ...audioBase, id: 'podcast-episode', label: 'Episodio de pódcast', manualExample: 94, manualPrintedPages: '351',
    requiredMetadata: ['lista completa de anfitriones del episodio o productores ejecutivos acreditados', 'rol', 'fecha completa', 'título', 'número si existe', 'tipo audio/video', 'pódcast contenedor', 'productora', 'URL si se conoce'],
    referenceTemplate: 'Un responsable: Responsable, R. R. (Anfitrión o Productor ejecutivo); dos: Responsable, R. R., & Responsable, S. S. (Anfitriones o Productores ejecutivos); de 3 a 20: Responsable, R. R., Responsable, S. S., Responsable, T. T., …, & Responsable final, Z. Z. (Anfitriones o Productores ejecutivos; incluye todos); 21 o más: responsables 1–19, …, Último responsable (rol plural). (Año, día de mes). Título (N.º x, solo si existe) [Episodio de pódcast de audio o video]. En Título del pódcast. Productora. URL, solo si se conoce.',
    parentheticalCitation: '(Responsable, Año); (Responsable & Responsable, Año); (Primer responsable et al., Año) con tres o más responsables', narrativeCitation: 'Responsable (Año); Responsable y Responsable (Año); Primer responsable et al. (Año) con tres o más responsables',
    rules: ['Conserva todos los responsables acreditados del rol elegido y usa el rol plural cuando corresponda.', 'Omite el número si el pódcast no numera episodios.', 'Si la URL se desconoce por acceso desde una aplicación, omítela.'],
  },
  'archived-radio-interview': {
    ...audioBase, id: 'archived-radio-interview', label: 'Grabación de entrevista de radio en archivo', manualExample: 95, manualPrintedPages: '352',
    requiredMetadata: ['persona entrevistada', 'fecha completa', 'título', 'descripción entrevista', 'archivo', 'institución/museo si corresponde', 'URL si existe'],
    referenceTemplate: 'Archivo digital: Entrevistado, A. A. (Año, día de mes). Título [Entrevista]. Archivo; Institución o museo, solo si corresponde. URL. Archivo físico sin URL: Entrevistado, A. A. (Año, día de mes). Título [Entrevista]. Archivo; Institución o museo, solo si corresponde.',
    parentheticalCitation: '(Entrevistado, Año)', narrativeCitation: 'Entrevistado (Año)',
    rules: ['En entrevistas recuperadas desde archivos digitales o físicos, la persona entrevistada ocupa la posición de autor.', 'Para una colección física, omite URL e institución/museo cuando esos elementos no existan.'],
  },
  'speech-audio-recording': {
    ...audioBase, id: 'speech-audio-recording', label: 'Grabación de audio de un discurso', manualExample: 96, manualPrintedPages: '352',
    requiredMetadata: ['orador', 'fecha completa', 'título', 'descripción de grabación', 'sitio/archivo', 'URL'],
    referenceTemplate: 'Orador, A. A. (Año, día de mes). Título [Grabación de audio de un discurso]. Sitio o archivo. URL',
    parentheticalCitation: '(Orador, Año)', narrativeCitation: 'Orador (Año)',
    rules: ['El orador ocupa la posición de autor.', 'Una cita textual de audio utiliza una marca de tiempo real.'],
  },
};

export function getAudiovisualAudioCase(id: AudiovisualAudioCaseId): Apa7VerifiedAudiovisualAudioCase {
  return audiovisualAudioCases[id];
}
