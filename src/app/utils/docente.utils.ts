import { Docente } from '../services/docente.service';

export class DocenteUtils {
  /**
   * Formatea una hora en formato HH:MM
   */
  static formatTime(timeString: string): string {
    if (!timeString) return '';
    
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    
    if (timeString.includes(':')) {
      return timeString.substring(0, 5);
    }
    
    return timeString;
  }

  /**
   * Obtiene el nombre completo de un docente
   */
  static getNombreCompleto(docente: Docente): string {
    const nombres = [
      docente.persona?.primer_nombre || '',
      docente.persona?.segundo_nombre || '',
      docente.persona?.primer_apellido || '',
      docente.persona?.segundo_apellido || ''
    ].filter(Boolean);
    
    return nombres.join(' ');
  }

  /**
   * Valida que un número no sea negativo
   */
  static validarNumeroNoNegativo(valor: string | number): number {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    
    if (isNaN(numero) || numero < 0) {
      return 0;
    }
    
    return numero;
  }

  /**
   * Prepara los datos de edición de un docente
   */
  static prepararDatosEdicion(docente: Docente, catalogos: {
    contratos: any[];
    nivelesIngles: any[];
    especializaciones: any[];
    horariosDisponibles: any[];
  }): any {
    // Obtener IDs de especializaciones
    const especIds: string[] = [];
    if (docente.especializaciones && Array.isArray(docente.especializaciones)) {
      docente.especializaciones.forEach((e: any) => {
        let id = null;
        
        if (e.especializacion_id) {
          id = e.especializacion_id;
        } else if (e.especializacion?.id) {
          id = e.especializacion.id;
        } else if (e.id) {
          id = e.id;
        } else if (e.especializacion?.nombre) {
          const found = catalogos.especializaciones.find(es => es.nombre === e.especializacion.nombre);
          id = found ? found.id : null;
        } else if (e.nombre) {
          const found = catalogos.especializaciones.find(es => es.nombre === e.nombre);
          id = found ? found.id : null;
        }
        
        if (id && !especIds.includes(id)) {
          especIds.push(id);
        }
      });
    }

    // Obtener IDs de horarios
    const horarioIds: string[] = [];
    if (docente.horarios && Array.isArray(docente.horarios)) {
      docente.horarios.forEach((h: any) => {
        let id = null;
        
        if (h.horario_id) {
          id = h.horario_id;
        } else if (h.horario?.id) {
          id = h.horario.id;
        } else if (h.id) {
          id = h.id;
        } else if (h.horario?.dia && h.horario?.hora_inicio) {
          const found = catalogos.horariosDisponibles.find(hor => 
            hor.dia === h.horario.dia && 
            hor.hora_inicio === h.horario.hora_inicio &&
            hor.hora_fin === h.horario.hora_fin
          );
          id = found ? found.id : null;
        } else if (h.dia && h.hora_inicio) {
          const found = catalogos.horariosDisponibles.find(hor => 
            hor.dia === h.dia && 
            hor.hora_inicio === h.hora_inicio &&
            hor.hora_fin === h.hora_fin
          );
          id = found ? found.id : null;
        }
        
        if (id && !horarioIds.includes(id)) {
          horarioIds.push(id);
        }
      });
    }

    // Obtener IDs de contrato y nivel de inglés
    const tipoContratoId = catalogos.contratos.find(c => c.nombre === docente.tipo_contrato?.nombre)?.id || '';
    const nivelInglesId = catalogos.nivelesIngles.find(n => n.nombre === docente.nivel_ingles?.nombre)?.id || '';

    return {
      primer_nombre: docente.persona?.primer_nombre || '',
      segundo_nombre: docente.persona?.segundo_nombre || '',
      primer_apellido: docente.persona?.primer_apellido || '',
      segundo_apellido: docente.persona?.segundo_apellido || '',
      cedula: docente.persona?.cedula || '',
      correo: docente.persona?.correo || '',
      telefono: docente.persona?.telefono || '',
      tipo_contrato_id: tipoContratoId,
      experiencia_anios: docente.experiencia_anios || 0,
      nivel_ingles_id: nivelInglesId,
      horas_disponibles: docente.horas_disponibles || 0,
      especializaciones: especIds,
      horarios: horarioIds,
      activo: docente.activo || false
    };
  }

  /**
   * Filtra docentes por búsqueda de texto
   */
  static filtrarPorBusqueda(docente: Docente, textoBusqueda: string): boolean {
    const texto = textoBusqueda.trim().toLowerCase();
    const nombres = [
      docente.persona?.primer_nombre || '',
      docente.persona?.segundo_nombre || '',
      docente.persona?.primer_apellido || '',
      docente.persona?.segundo_apellido || ''
    ].join(' ').toLowerCase();
    
    return nombres.includes(texto);
  }

  /**
   * Filtra docentes por tipo de contrato
   */
  static filtrarPorContrato(docente: Docente, filtroContrato: string): boolean {
    return filtroContrato === 'Todos' || docente.tipo_contrato?.nombre === filtroContrato;
  }

  /**
   * Filtra docentes por nivel de inglés
   */
  static filtrarPorNivel(docente: Docente, filtroNivelIngles: string): boolean {
    return filtroNivelIngles === 'Todos' || docente.nivel_ingles?.nombre === filtroNivelIngles;
  }

  /**
   * Filtra docentes por experiencia mínima
   */
  static filtrarPorExperiencia(docente: Docente, filtroExperiencia: number): boolean {
    const experienciaMinima = Math.max(0, filtroExperiencia);
    
    if (experienciaMinima === 0) {
      return true;
    }
    
    const experienciaDocente = docente.experiencia_anios || 0;
    return experienciaDocente >= experienciaMinima;
  }
} 