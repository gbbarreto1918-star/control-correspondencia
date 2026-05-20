import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
import { formatDate } from '../../lib/utils'

applyPlugin(jsPDF)

/**
 * Hook para exportar reportes a PDF.
 * Incluye: listado filtrado, detalle individual, y ambos combinados.
 */
export function usePdfExport() {

  const getFormattedDate = () => {
    const now = new Date()
    const dd = String(now.getDate()).padStart(2, '0')
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const yyyy = now.getFullYear()
    return `${dd}-${mm}-${yyyy}`
  }

  const addHeader = (doc, orgName, isLandscape = false) => {
    const pageWidth = isLandscape ? 297 : 210

    // Fondo del header
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, pageWidth, 35, 'F')

    // Nombre de la organización
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(248, 250, 252)
    doc.text(orgName || 'Sistema de Correspondencia', pageWidth / 2, 14, { align: 'center' })

    // Subtítulo
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(148, 163, 184)
    doc.text('Reporte de Correspondencia', pageWidth / 2, 22, { align: 'center' })

    // Fecha de generación
    doc.setFontSize(8)
    doc.text(`Generado: ${getFormattedDate()}`, pageWidth / 2, 30, { align: 'center' })

    doc.setTextColor(0, 0, 0)
  }

  const addFilters = (doc, filters, startY, isLandscape = false) => {
    if (!filters || Object.keys(filters).length === 0) return startY

    const activeFilters = Object.entries(filters).filter(([, v]) => v && v !== '')

    if (activeFilters.length === 0) return startY

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text('Filtros aplicados:', 14, startY)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)

    const filterLabels = {
      tipo: 'Tipo',
      estado: 'Estado',
      responsable: 'Responsable',
      fechaDesde: 'Desde',
      fechaHasta: 'Hasta',
      busqueda: 'Búsqueda',
    }

    let x = 14
    activeFilters.forEach(([key, value]) => {
      const label = filterLabels[key] || key
      const text = `${label}: ${value}`
      doc.text(text, x, startY + 6)
      x += doc.getTextWidth(text) + 10
      if (x > (isLandscape ? 270 : 180)) {
        x = 14
        startY += 5
      }
    })

    return startY + 14
  }

  const addFooter = (doc) => {
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      const pageHeight = doc.internal.pageSize.getHeight()
      const pageWidth = doc.internal.pageSize.getWidth()
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }
  }

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'Pendiente'
      case 'Vencido': return 'Vencido'
      case 'Cerrado': return 'Cerrado'
      default: return estado || '—'
    }
  }

  const getTipoLabel = (tipo) => {
    return tipo === 'entrante' ? 'Entrante' : 'Saliente'
  }

  /**
   * Exportar listado filtrado (landscape).
   */
  const exportListado = (data, filters = {}, orgName = '') => {
    const doc = new jsPDF('landscape')

    addHeader(doc, orgName, true)

    let startY = addFilters(doc, filters, 42, true)

    const tableData = data.map((item, index) => [
      index + 1,
      getTipoLabel(item.tipo),
      (item.asunto || '').substring(0, 40),
      (item.enviada_por || '').substring(0, 25),
      (item.dirigida_a || '').substring(0, 25),
      (item.responsable_nombre || '—').substring(0, 20),
      formatDate(item.fecha_vencimiento),
      getEstadoLabel(item.estado),
    ])

    doc.autoTable({
      startY,
      head: [['#', 'Tipo', 'Asunto', 'De', 'Para', 'Responsable', 'Vencimiento', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [248, 250, 252],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { halign: 'center', cellWidth: 22 },
        2: { cellWidth: 55 },
        3: { cellWidth: 40 },
        4: { cellWidth: 40 },
        5: { cellWidth: 35 },
        6: { halign: 'center', cellWidth: 28 },
        7: { halign: 'center', cellWidth: 22 },
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        // Colorear estado
        if (data.section === 'body' && data.column.index === 7) {
          const val = data.cell.raw
          if (val === 'Vencido') {
            data.cell.styles.textColor = [239, 68, 68]
            data.cell.styles.fontStyle = 'bold'
          } else if (val === 'Pendiente') {
            data.cell.styles.textColor = [245, 158, 11]
            data.cell.styles.fontStyle = 'bold'
          } else if (val === 'Cerrado') {
            data.cell.styles.textColor = [34, 197, 94]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      },
    })

    addFooter(doc)
    doc.save(`reporte_correspondencia_${getFormattedDate()}.pdf`)
  }

  /**
   * Exportar detalle individual (portrait).
   */
  const exportDetalle = (record, orgName = '') => {
    const doc = new jsPDF('portrait')

    addHeader(doc, orgName, false)

    let y = 45

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(15, 23, 42)
    doc.text('Detalle de Correspondencia', 14, y)
    y += 10

    const fields = [
      ['Nº Correlativo', record.numero_correlativo || '—'],
      ['Tipo', getTipoLabel(record.tipo)],
      ['Estado', getEstadoLabel(record.estado)],
      ['Asunto', record.asunto || '—'],
      ['Descripción', record.descripcion || '—'],
      ['Enviada por', record.enviada_por || '—'],
      ['Dirigida a', record.dirigida_a || '—'],
      ['Responsable', record.responsable_nombre || '—'],
      ['Fecha de Elaboración', formatDate(record.fecha_elaboracion)],
      ['Fecha de Recepción', formatDate(record.fecha_recepcion)],
      ['Fecha de Vencimiento', formatDate(record.fecha_vencimiento)],
      ['Tiene Anexo', record.tiene_anexo ? 'Sí' : 'No'],
    ]

    doc.autoTable({
      startY: y,
      body: fields.map(([label, value]) => [label, value]),
      theme: 'plain',
      columnStyles: {
        0: {
          fontStyle: 'bold',
          cellWidth: 55,
          textColor: [100, 116, 139],
          fontSize: 9,
        },
        1: {
          fontSize: 9,
          textColor: [15, 23, 42],
        },
      },
      margin: { left: 14, right: 14 },
      styles: {
        cellPadding: 4,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
    })

    // Adjuntos (si existen)
    if (record.adjuntos && record.adjuntos.length > 0) {
      const adjY = doc.lastAutoTable.finalY + 10

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(15, 23, 42)
      doc.text('Archivos Adjuntos', 14, adjY)

      doc.autoTable({
        startY: adjY + 5,
        head: [['#', 'Nombre', 'Tipo', 'Tamaño']],
        body: record.adjuntos.map((adj, i) => [
          i + 1,
          adj.nombre_archivo || '—',
          adj.tipo_archivo || '—',
          adj.tamano ? `${(adj.tamano / 1024).toFixed(1)} KB` : '—',
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [248, 250, 252],
          fontSize: 8,
        },
        bodyStyles: {
          fontSize: 8,
        },
        margin: { left: 14, right: 14 },
      })
    }

    addFooter(doc)

    const correlativo = (record.numero_correlativo || 'sin_correlativo').replace(/[/\\]/g, '-')
    doc.save(`detalle_${correlativo}.pdf`)
  }

  /**
   * Exportar ambos: listado + detalle de un registro seleccionado.
   */
  const exportAmbos = (data, detailRecord, filters = {}, orgName = '') => {
    exportListado(data, filters, orgName)
    if (detailRecord) {
      exportDetalle(detailRecord, orgName)
    }
  }

  return { exportListado, exportDetalle, exportAmbos }
}
