-- ============================================
-- SCHEMA: Sistema de Control de Correspondencia General
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Tabla de Responsables
CREATE TABLE IF NOT EXISTS responsables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Entidades (remitentes/destinatarios frecuentes)
CREATE TABLE IF NOT EXISTS entidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'ambos' CHECK (tipo IN ('remitente', 'destinatario', 'ambos')),
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Correspondencia
CREATE TABLE IF NOT EXISTS correspondencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrante', 'saliente')),
  fecha_elaboracion DATE NOT NULL,
  fecha_recepcion DATE NOT NULL,
  enviada_por TEXT NOT NULL,
  dirigida_a TEXT NOT NULL,
  numero_correlativo TEXT NOT NULL UNIQUE,
  asunto TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  responsable_id UUID REFERENCES responsables(id),
  responsable_nombre TEXT,
  fecha_vencimiento DATE,
  estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Vencido', 'Cerrado')),
  tiene_anexo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Adjuntos
CREATE TABLE IF NOT EXISTS adjuntos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correspondencia_id UUID NOT NULL REFERENCES correspondencia(id) ON DELETE CASCADE,
  nombre_archivo TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo_archivo TEXT NOT NULL,
  tamano INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Configuración
CREATE TABLE IF NOT EXISTS configuracion (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pin_secretaria TEXT NOT NULL DEFAULT '250261',
  nombre_organizacion TEXT DEFAULT 'Organización'
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_correspondencia_tipo ON correspondencia(tipo);
CREATE INDEX IF NOT EXISTS idx_correspondencia_estado ON correspondencia(estado);
CREATE INDEX IF NOT EXISTS idx_correspondencia_responsable ON correspondencia(responsable_id);
CREATE INDEX IF NOT EXISTS idx_correspondencia_fecha_vencimiento ON correspondencia(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_correspondencia_numero_correlativo ON correspondencia(numero_correlativo);
CREATE INDEX IF NOT EXISTS idx_correspondencia_created_at ON correspondencia(created_at);
CREATE INDEX IF NOT EXISTS idx_adjuntos_correspondencia ON adjuntos(correspondencia_id);

-- ============================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_correspondencia_updated_at
  BEFORE UPDATE ON correspondencia
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (Permisivo para MVP)
-- ============================================
ALTER TABLE responsables ENABLE ROW LEVEL SECURITY;
ALTER TABLE entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE correspondencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (acceso público con anon key)
CREATE POLICY "Allow all on responsables" ON responsables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on entidades" ON entidades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on correspondencia" ON correspondencia FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on adjuntos" ON adjuntos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on configuracion" ON configuracion FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DATOS INICIALES
-- ============================================
INSERT INTO configuracion (id, pin_secretaria, nombre_organizacion)
VALUES (1, '250261', 'Organización')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE: Crear bucket para adjuntos automáticamente
-- ============================================
-- Crear el bucket en la tabla de storage de Supabase si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'correspondencia-adjuntos',
  'correspondencia-adjuntos',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Habilitar Row Level Security en storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas anteriores si existen para evitar conflictos
DROP POLICY IF EXISTS "Permitir select público de adjuntos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir insert público de adjuntos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir update público de adjuntos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir delete público de adjuntos" ON storage.objects;

-- Crear políticas de acceso público (Lectura/Carga/Modificación/Eliminación) para el bucket de correspondencia
CREATE POLICY "Permitir select público de adjuntos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'correspondencia-adjuntos');

CREATE POLICY "Permitir insert público de adjuntos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'correspondencia-adjuntos');

CREATE POLICY "Permitir update público de adjuntos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'correspondencia-adjuntos') 
WITH CHECK (bucket_id = 'correspondencia-adjuntos');

CREATE POLICY "Permitir delete público de adjuntos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'correspondencia-adjuntos');
