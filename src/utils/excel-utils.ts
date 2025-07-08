// src/utils/excel-utils.ts

export function limpiarLineasCSV(contenido: string): string[] {
  return contenido
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && l.split(',').some(v => v.trim() !== ''));
}

export function extraerEncabezados(lineas: string[]): string[] {
  return lineas[0].split(',').map(h => h.trim());
}

export function procesarFilas(lineas: string[], encabezados: string[]): any[] {
  return lineas.map((linea, index) => {
    const valores = linea.split(',').map(v => v.trim());
    const fila: any = {};
    encabezados.forEach((key, i) => fila[key] = valores[i] || '');
    fila._linea = index + 2;
    return fila;
  }).filter(f => f['cedula'] && f['primer_nombre']);
}

export function transformarAFilaDocente(
  fila: any,
  errores: string[],
  contratos: any[],
  nivelesIngles: any[],
  especializaciones: any[],
  horariosDisponibles: any[]
): any | null {
  const erroresFila: string[] = [];
  const linea = fila._linea;

  const tipoContrato = contratos.find((c: any) => c.nombre === fila['tipo_contrato']);
  if (!tipoContrato) erroresFila.push(`Línea ${linea}: tipo_contrato '${fila['tipo_contrato']}' no encontrado.`);

  const nivelIngles = nivelesIngles.find((n: any) => n.nombre === fila['nivel_ingles']);
  if (!nivelIngles) erroresFila.push(`Línea ${linea}: nivel_ingles '${fila['nivel_ingles']}' no encontrado.`);

  const especializacionesIds = (fila['especializaciones'] || '')
    .split(';')
    .map((nombre: string) => {
      const esp = especializaciones.find((e: any) => e.nombre === nombre);
      if (!esp) erroresFila.push(`Línea ${linea}: especialización '${nombre}' no encontrada.`);
      return esp?.id || null;
    }).filter(Boolean);

  const horariosIds = (fila['horarios'] || '')
    .split(';')
    .map((bloque: string) => {
      const partes = bloque.split('/');
      if (partes.length !== 3) {
        erroresFila.push(`Línea ${linea}: formato de horario inválido: '${bloque}'.`);
        return null;
      }

      const [dias, hora_inicio, hora_fin] = partes;
      const horario = horariosDisponibles.find((h: any) =>
        h.dia.toLowerCase() === dias.toLowerCase() &&
        h.hora_inicio === hora_inicio &&
        h.hora_fin === hora_fin
      );

      if (!horario) {
        erroresFila.push(`Línea ${linea}: horario '${bloque}' no encontrado.`);
        return null;
      }

      return horario.id;
    }).filter(Boolean);

  if (erroresFila.length > 0) {
    errores.push(...erroresFila);
    return null;
  }

  return {
    primer_nombre: fila['primer_nombre'],
    segundo_nombre: fila['segundo_nombre'],
    primer_apellido: fila['primer_apellido'],
    segundo_apellido: fila['segundo_apellido'],
    cedula: fila['cedula'],
    correo: fila['correo'],
    telefono: fila['telefono'],
    tipo_contrato_id: tipoContrato?.id,
    experiencia_anios: Number(fila['experiencia_anios']) || 0,
    nivel_ingles_id: nivelIngles?.id,
    horas_disponibles: Number(fila['horas_disponibles']) || 0,
    especializaciones: especializacionesIds,
    horarios: horariosIds
  };
}
