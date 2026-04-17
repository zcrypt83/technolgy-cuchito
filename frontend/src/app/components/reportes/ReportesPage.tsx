import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FileText,
  Download,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  CalendarClock,
  RefreshCw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import * as api from '../../services/api';
import { useLiveData } from '../../hooks/useLiveData';

type ReportId = 'stock' | 'movimientos' | 'rotacion' | 'valorizacion';

interface ReportMetric {
  label: string;
  value: string;
}

interface ReportData {
  id: ReportId;
  titulo: string;
  descripcion: string;
  icon: LucideIcon;
  color: string;
  generatedAt: Date;
  headers: string[];
  rows: Array<Array<string | number>>;
  metrics: ReportMetric[];
  emptyMessage: string;
}

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const toNumber = (value: unknown) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const normalizeTipoMovimiento = (tipo: unknown) => String(tipo || '').toLowerCase();

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const ReportesPage = () => {
  const [inventario, setInventario] = useState<any[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<ReportId>('stock');

  const loadReports = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const [inventarioRes, movimientosRes] = await Promise.all([
        api.getInventario({ limit: 1000 }),
        api.getMovimientos({ limit: 1000 }),
      ]);

      setInventario(inventarioRes.data || []);
      setMovimientos(movimientosRes.data || []);
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron cargar los datos de reportes');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports(true);
  }, []);

  useLiveData(() => loadReports(false), { pollMs: 15000 });

  const reportes = useMemo<ReportData[]>(() => {
    const generatedAt = new Date();

    const stockRows = inventario.map((item) => {
      const stockActual = toNumber(item.stock_actual ?? item.stockActual);
      const stockReservado = toNumber(item.stock_reservado ?? item.stockReservado);
      const stockDisponible = toNumber(item.stock_disponible ?? item.stockDisponible ?? stockActual - stockReservado);
      const precioCompra = toNumber(
        item.producto?.precio_compra ?? item.producto?.precioCompra ?? item.producto?.precio
      );

      return [
        item.producto?.nombre || 'Sin producto',
        item.almacen?.nombre || 'Sin almacén',
        stockActual,
        stockReservado,
        stockDisponible,
        formatCurrency(stockActual * precioCompra),
      ];
    });

    const stockTotal = stockRows.reduce((acc, row) => acc + toNumber(row[2]), 0);
    const stockCritico = inventario.filter((item) => {
      const stockDisponible = toNumber(item.stock_disponible ?? item.stockDisponible ?? item.stock_actual ?? item.stockActual);
      const stockMinimo = toNumber(item.producto?.stock_minimo ?? item.producto?.stockMinimo);
      return stockMinimo > 0 && stockDisponible <= stockMinimo;
    }).length;
    const valorInventario = inventario.reduce((acc, item) => {
      const precioCompra = toNumber(
        item.producto?.precio_compra ?? item.producto?.precioCompra ?? item.producto?.precio
      );
      const stockActual = toNumber(item.stock_actual ?? item.stockActual);
      return acc + stockActual * precioCompra;
    }, 0);

    const movimientosOrdenados = [...movimientos].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    const movimientosRows = movimientosOrdenados.map((mov) => [
      mov.fecha ? format(new Date(mov.fecha), 'dd/MM/yyyy HH:mm', { locale: es }) : '-',
      String(mov.tipo || '-').toUpperCase(),
      mov.producto?.nombre || 'Sin producto',
      mov.almacenOrigen?.nombre || '-',
      mov.almacenDestino?.nombre || '-',
      toNumber(mov.cantidad),
      mov.usuario?.nombre || '-',
    ]);

    const entradasCount = movimientos.filter((mov) => normalizeTipoMovimiento(mov.tipo) === 'entrada').length;
    const salidasCount = movimientos.filter((mov) => normalizeTipoMovimiento(mov.tipo) === 'salida').length;
    const transferenciasCount = movimientos.filter(
      (mov) => normalizeTipoMovimiento(mov.tipo) === 'transferencia'
    ).length;

    const rotationMap = new Map<
      string,
      { nombre: string; entradas: number; salidas: number; transferencias: number }
    >();

    movimientos.forEach((mov, index) => {
      const productKey = String(mov.producto?.id ?? mov.productoId ?? `unknown-${index}`);
      const productName = mov.producto?.nombre || `Producto ${productKey}`;
      const current = rotationMap.get(productKey) || {
        nombre: productName,
        entradas: 0,
        salidas: 0,
        transferencias: 0,
      };
      const cantidad = toNumber(mov.cantidad);
      const tipo = normalizeTipoMovimiento(mov.tipo);

      if (tipo === 'entrada') current.entradas += cantidad;
      if (tipo === 'salida') current.salidas += cantidad;
      if (tipo === 'transferencia') current.transferencias += cantidad;

      rotationMap.set(productKey, current);
    });

    const rotacionRows = Array.from(rotationMap.values())
      .map((item) => {
        const total = item.entradas + item.salidas + item.transferencias;
        const indiceRotacion = item.entradas > 0 ? item.salidas / item.entradas : item.salidas;
        return [
          item.nombre,
          item.entradas,
          item.salidas,
          item.transferencias,
          total,
          indiceRotacion.toFixed(2),
        ];
      })
      .sort((a, b) => toNumber(b[4]) - toNumber(a[4]));

    const altaRotacion = rotacionRows.filter((row) => toNumber(row[5]) >= 1).length;

    const valorizacionMap = new Map<string, { categoria: string; productos: number; stock: number; valor: number }>();

    inventario.forEach((item) => {
      const categoria = item.producto?.categoria?.nombre || 'Sin categoría';
      const current = valorizacionMap.get(categoria) || {
        categoria,
        productos: 0,
        stock: 0,
        valor: 0,
      };
      const stockActual = toNumber(item.stock_actual ?? item.stockActual);
      const precioCompra = toNumber(
        item.producto?.precio_compra ?? item.producto?.precioCompra ?? item.producto?.precio
      );

      current.productos += 1;
      current.stock += stockActual;
      current.valor += stockActual * precioCompra;

      valorizacionMap.set(categoria, current);
    });

    const valorizacionRows = Array.from(valorizacionMap.values())
      .map((item) => [item.categoria, item.productos, item.stock, formatCurrency(item.valor)])
      .sort((a, b) => toNumber(String(b[3]).replace(/[^0-9.-]/g, '')) - toNumber(String(a[3]).replace(/[^0-9.-]/g, '')));

    const categoriaTop = valorizacionRows[0]?.[0] || '-';

    return [
      {
        id: 'stock',
        titulo: 'Reporte de Stock Actual',
        descripcion: 'Stock disponible por producto y almacén con valorización referencial',
        icon: Package,
        color: 'bg-blue-100 text-blue-600',
        generatedAt,
        headers: ['Producto', 'Almacén', 'Stock Actual', 'Reservado', 'Disponible', 'Valor'],
        rows: stockRows,
        metrics: [
          { label: 'Registros inventario', value: String(stockRows.length) },
          { label: 'Stock total unidades', value: stockTotal.toLocaleString('es-PE') },
          { label: 'Stock crítico', value: String(stockCritico) },
          { label: 'Valor inventario', value: formatCurrency(valorInventario) },
        ],
        emptyMessage: 'No hay registros de inventario para mostrar.',
      },
      {
        id: 'movimientos',
        titulo: 'Reporte de Movimientos',
        descripcion: 'Entradas, salidas y transferencias con detalle operativo',
        icon: TrendingUp,
        color: 'bg-green-100 text-green-600',
        generatedAt,
        headers: ['Fecha', 'Tipo', 'Producto', 'Almacén Origen', 'Almacén Destino', 'Cantidad', 'Usuario'],
        rows: movimientosRows,
        metrics: [
          { label: 'Movimientos totales', value: String(movimientosRows.length) },
          { label: 'Entradas', value: String(entradasCount) },
          { label: 'Salidas', value: String(salidasCount) },
          { label: 'Transferencias', value: String(transferenciasCount) },
        ],
        emptyMessage: 'No hay movimientos registrados para este período.',
      },
      {
        id: 'rotacion',
        titulo: 'Análisis de Rotación',
        descripcion: 'Productos con mayor y menor movimiento relativo',
        icon: BarChart3,
        color: 'bg-purple-100 text-purple-600',
        generatedAt,
        headers: ['Producto', 'Entradas', 'Salidas', 'Transferencias', 'Movimiento Total', 'Índice Rotación'],
        rows: rotacionRows,
        metrics: [
          { label: 'Productos analizados', value: String(rotacionRows.length) },
          { label: 'Alta rotación (>=1)', value: String(altaRotacion) },
          { label: 'Baja rotación (<1)', value: String(rotacionRows.length - altaRotacion) },
          { label: 'Fuente', value: 'Movimientos históricos' },
        ],
        emptyMessage: 'No hay suficientes movimientos para calcular rotación.',
      },
      {
        id: 'valorizacion',
        titulo: 'Valorización de Inventario',
        descripcion: 'Valor estimado de inventario por categoría',
        icon: DollarSign,
        color: 'bg-yellow-100 text-yellow-600',
        generatedAt,
        headers: ['Categoría', 'Registros', 'Stock Total', 'Valor'],
        rows: valorizacionRows,
        metrics: [
          { label: 'Categorías evaluadas', value: String(valorizacionRows.length) },
          { label: 'Valor total', value: formatCurrency(valorInventario) },
          { label: 'Categoría líder', value: String(categoriaTop) },
          { label: 'Fuente', value: 'Inventario + costo compra' },
        ],
        emptyMessage: 'No hay datos de inventario para valorizar.',
      },
    ];
  }, [inventario, movimientos]);

  const selectedReport = reportes.find((reporte) => reporte.id === selectedReportId) || reportes[0];
  const previewRows = selectedReport ? selectedReport.rows.slice(0, 12) : [];

  const exportToExcel = async (report: ReportData) => {
    if (!report.rows.length) {
      toast.error('No hay datos para exportar');
      return;
    }

    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();
      const summaryRows = report.metrics.map((metric) => ({
        Indicador: metric.label,
        Valor: metric.value,
      }));
      const detailRows = report.rows.map((row) =>
        Object.fromEntries(report.headers.map((header, index) => [header, row[index]]))
      );

      const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
      const detailSheet = XLSX.utils.json_to_sheet(detailRows);

      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detalle');

      const fileName = `${slugify(report.titulo)}-${format(new Date(), 'yyyyMMdd-HHmmss')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success('Reporte exportado a Excel');
    } catch (error) {
      toast.error('No se pudo exportar a Excel');
    }
  };

  const exportToPdf = async (report: ReportData) => {
    if (!report.rows.length) {
      toast.error('No hay datos para exportar');
      return;
    }

    try {
      const [{ default: JsPdf }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const doc = new JsPdf({
        orientation: report.headers.length > 6 ? 'landscape' : 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      doc.setFontSize(15);
      doc.text(report.titulo, 40, 42);
      doc.setFontSize(10);
      doc.text(`Generado: ${format(new Date(report.generatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}`, 40, 60);

      let currentY = 78;
      report.metrics.forEach((metric) => {
        doc.text(`${metric.label}: ${metric.value}`, 40, currentY);
        currentY += 14;
      });

      autoTable(doc, {
        startY: currentY + 8,
        head: [report.headers],
        body: report.rows.map((row) => row.map((cell) => String(cell))),
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [37, 99, 235] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 24, right: 24 },
      });

      const fileName = `${slugify(report.titulo)}-${format(new Date(), 'yyyyMMdd-HHmmss')}.pdf`;
      doc.save(fileName);
      toast.success('Reporte exportado a PDF');
    } catch (error) {
      toast.error('No se pudo exportar a PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Cargando datos de reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes e Informes</h1>
          <p className="text-gray-600 mt-1">Detalle operativo y exportación en PDF/Excel</p>
        </div>
        <Button variant="outline" onClick={() => loadReports(true)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar datos
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportes.map((reporte) => {
          const Icon = reporte.icon;
          const isSelected = reporte.id === selectedReportId;

          return (
            <Card
              key={reporte.id}
              className={`transition-shadow ${isSelected ? 'ring-2 ring-blue-400 shadow-lg' : 'hover:shadow-lg'}`}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${reporte.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{reporte.titulo}</CardTitle>
                    <CardDescription>{reporte.descripcion}</CardDescription>
                    <div className="mt-2">
                      <Badge variant="outline">{reporte.rows.length} filas</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={() => setSelectedReportId(reporte.id)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Ver detalle
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportToPdf(reporte)}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportToExcel(reporte)}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>{selectedReport.titulo}</CardTitle>
                <CardDescription>{selectedReport.descripcion}</CardDescription>
              </div>
              <div className="flex items-center text-sm text-gray-500 gap-2">
                <CalendarClock className="h-4 w-4" />
                {format(new Date(selectedReport.generatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {selectedReport.metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border p-3 bg-gray-50">
                  <p className="text-xs text-gray-500">{metric.label}</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{metric.value}</p>
                </div>
              ))}
            </div>

            {selectedReport.rows.length === 0 ? (
              <p className="text-sm text-gray-500">{selectedReport.emptyMessage}</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {selectedReport.headers.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, rowIndex) => (
                      <TableRow key={`${selectedReport.id}-row-${rowIndex}`}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={`${selectedReport.id}-cell-${rowIndex}-${cellIndex}`}>
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {selectedReport.rows.length > previewRows.length && (
              <p className="text-xs text-gray-500">
                Mostrando {previewRows.length} de {selectedReport.rows.length} filas. Exporta el reporte para obtener
                el detalle completo.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
