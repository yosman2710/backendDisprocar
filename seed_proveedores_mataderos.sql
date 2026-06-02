-- ===========================================================================
-- SEED DATA: Proveedores y Mataderos - DisproControl
-- Ejecutar en el SQL Editor de Supabase (es seguro re-ejecutar, usa ON CONFLICT)
-- ===========================================================================

-- ==========================================
-- PROVEEDORES (Ganaderos / Empresas)
-- ==========================================
INSERT INTO proveedores (nombre, rif, direccion, telefono, email) VALUES
    ('Agropecuaria Los Llanos C.A.',      'J-12345678-9', 'Km 45 Vía Apure, Barinas',             '+58 273-555-1001', 'contacto@losllanosca.com'),
    ('Hacienda El Palmar S.A.',           'J-23456789-0', 'Carretera Nacional, Calabozo, Guárico', '+58 246-555-2002', 'ventas@haciendaelpalmar.com'),
    ('Ganados del Sur C.A.',              'J-34567890-1', 'Av. Principal, San Fernando de Apure',  '+58 247-555-3003', 'info@ganadosdelsur.com'),
    ('Inversiones Rojas & Hijos S.A.',    'J-45678901-2', 'Urbanización La Florida, Caracas',      '+58 212-555-4004', 'rojashijos@inversiones.com.ve'),
    ('Finca Santa Rosa de Lima',          'J-56789012-3', 'Sector El Tigre, Anzoátegui',           '+58 283-555-5005', 'santarosa@finca.com.ve'),
    ('Agropecuaria Zulia Norte C.A.',     'J-67890123-4', 'Vía Perijá, Maracaibo, Zulia',          '+58 261-555-6006', 'zulia@agronorte.com'),
    ('Ganadería El Potrero Feliz',        'J-78901234-5', 'Municipio Achaguas, Apure',              '+58 247-555-7007', 'elpotrero@ganaderia.com.ve'),
    ('Corporación Bovina Venezuela S.A.', 'J-89012345-6', 'Torre Empresarial, Av. Francisco de Miranda, Caracas', '+58 212-555-8008', 'cbv@bovina.com.ve'),
    ('Hacienda Las Mercedes',             'J-90123456-7', 'Km 12, Vía Valle de la Pascua, Guárico','+58 234-555-9009', 'lasmercedes@hacienda.com'),
    ('Distribuidora Carnes Aragua C.A.',  'J-01234567-8', 'Zona Industrial Norte, Maracay, Aragua','+58 243-555-0010', 'carnes@aragua.com.ve'),
    ('Agropecuaria La Esperanza',         'J-11111111-1', 'Sector El Samán, Barinas',              '+58 273-555-1111', 'laesperanza@agropecuaria.com'),
    ('Finca El Milagro del Llano',        'J-22222222-2', 'Municipio Ezequiel Zamora, Barinas',    '+58 273-555-2222', 'elmilagro@finca.com.ve')
ON CONFLICT (rif) DO NOTHING;

-- ==========================================
-- MATADEROS (Plantas de Beneficio)
-- ==========================================
INSERT INTO mataderos (nombre, ubicacion, registro) VALUES
    ('Matadero Industrial del Sur',        'Av. Industrial Sur, San Fernando de Apure',          'MAT-001-AP'),
    ('Frigorífico Barinas C.A.',           'Zona Industrial Barinas, Estado Barinas',             'MAT-002-BA'),
    ('Planta de Beneficio Los Llanos',     'Km 8 Vía Guasdualito, Barinas',                      'MAT-003-BA'),
    ('Matadero Municipal de Calabozo',     'Calle 5, Sector Industrial, Calabozo, Guárico',      'MAT-004-GU'),
    ('Frigorífico Valle de la Pascua',     'Av. Bolívar, Valle de la Pascua, Guárico',            'MAT-005-GU'),
    ('Planta Frigorífica Zulia S.A.',      'Km 3 Vía El Vigía, Maracaibo, Zulia',                'MAT-006-ZU'),
    ('Matadero Industrial de Maracay',     'Zona Industrial La Morita, Aragua',                  'MAT-007-AR'),
    ('Frigorífico El Tigre',               'Calle Comercio, El Tigre, Anzoátegui',               'MAT-008-AN'),
    ('Planta de Beneficio Central',        'Carretera Panamericana Km 22, Miranda',              'MAT-009-MI'),
    ('Matadero Regional de Apure',         'Sector Los Samanes, Biruaca, Apure',                 'MAT-010-AP'),
    ('Frigorífico del Oriente C.A.',       'Zona Industrial, Maturín, Monagas',                  'MAT-011-MO'),
    ('Planta Beneficio Agropatria',        'Av. Industrial, Acarigua, Portuguesa',               'MAT-012-PO')
ON CONFLICT (registro) DO NOTHING;
